'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { AuthMethods } from '../../components/auth/AuthMethods'
import { AuthChrome } from '../../components/auth/AuthChrome'
import { safeNext } from '../../lib/finishAuth'

function VendorLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('vendor@shopping-mall.local')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function finish(result: { token: string; user: User }) {
    if (result.user.role === 'CUSTOMER') {
      setSession(result.token, result.user)
      router.replace('/shop')
      return
    }
    setSession(result.token, result.user)
    router.replace(safeNext(params.get('next'), result.user))
  }

  useEffect(() => {
    const token = params.get('magic')
    if (!token) return
    void api.auth
      .consumeMagic(token)
      .then(finish)
      .catch((err) => setError(err instanceof Error ? err.message : 'Magic link failed'))
  }, [params])

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="text-xs tracking-[0.22em] text-mute">MERCHANT</p>
      <h1 className="mt-2 text-3xl font-bold">Merchant sign in</h1>
      <p className="mt-2 text-mute">Continue with Google, Apple, a passkey, or email. Password is optional.</p>

      <label className="mt-8 block text-sm font-medium">
        Email
        <input
          className="mt-2 w-full rounded-xl bg-black/5 px-3 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username webauthn"
          placeholder="you@store.com"
        />
      </label>
      <p className="mt-2 text-xs text-mute">Needed for passkey, magic link, and email code.</p>

      <div className="mt-6">
        <AuthMethods role="VENDOR" purpose="login" email={email} onSession={finish} onError={setError} />
      </div>

      <div className="my-7 flex items-center gap-3 text-xs tracking-wide text-mute">
        <span className="h-px flex-1 bg-[var(--mm-card-border)]" />
        or password
        <span className="h-px flex-1 bg-[var(--mm-card-border)]" />
      </div>

      {showPassword ? (
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            setError('')
            try {
              finish(await api.auth.login({ email, password }))
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Login failed')
            }
          }}
        >
          <input
            className="w-full rounded-xl bg-black/5 px-3 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white" type="submit">
            Sign in with password
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setShowPassword(true)} className="text-sm font-semibold text-glow">
          Use a password instead
        </button>
      )}

      {error ? <p className="mt-4 text-sm text-signal">{error}</p> : null}

      <p className="mt-8 text-sm text-mute">
        New merchant?{' '}
        <Link href="/signup" className="text-glow">
          Create a free store
        </Link>
        {' · '}
        <Link href="/shop/login" className="text-glow">
          I shop here
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthChrome>
      <Suspense fallback={<p className="text-mute">Loading…</p>}>
        <VendorLoginForm />
      </Suspense>
    </AuthChrome>
  )
}
