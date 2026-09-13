'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthChrome } from '../../../components/auth/AuthChrome'
import { AuthMethods } from '../../../components/auth/AuthMethods'
import { TermsAccept } from '../../../components/auth/TermsAccept'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../stores/authStore'

export default function ShopSignupPage() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [accepted, setAccepted] = useState(false)

  function finish(result: { token: string; user: { role: string } }) {
    if (result.user.role !== 'CUSTOMER') {
      setError('Use merchant sign-up to open a store.')
      return
    }
    setSession(result.token, result.user as never)
    router.replace('/shop')
  }

  return (
    <AuthChrome closeHref="/shop">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-mute">One bag across every shop in the mall.</p>

        <div className="mt-8">
          <TermsAccept role="shopper" accepted={accepted} onChange={setAccepted} />
        </div>
        {!accepted ? (
          <p className="mt-3 text-xs text-mute">Accept the terms to continue with Google, Apple, or email.</p>
        ) : null}

        <div className="mt-6">
          <AuthMethods
            role="CUSTOMER"
            purpose="signup"
            email={email}
            firstName={firstName}
            lastName={lastName}
            onSession={finish}
            onError={setError}
            kinds={['google', 'apple']}
            locked={!accepted}
          />
        </div>

        <div className="my-8 flex items-center gap-3 text-xs tracking-wide text-mute">
          <span className="h-px flex-1 bg-[var(--mm-card-border)]" />
          or use email
          <span className="h-px flex-1 bg-[var(--mm-card-border)]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-full bg-black/5 px-4 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
            placeholder="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
          />
          <input
            className="rounded-full bg-black/5 px-4 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
            placeholder="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
          />
        </div>
        <input
          className="mt-3 w-full rounded-full bg-black/5 px-4 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <p className="mt-2 text-xs text-mute">Needed for a passkey, magic link, or one-time code.</p>

        <div className="mt-5">
          <AuthMethods
            role="CUSTOMER"
            purpose="signup"
            email={email}
            firstName={firstName}
            lastName={lastName}
            onSession={finish}
            onError={setError}
            kinds={['passkey', 'magic', 'otp']}
            locked={!accepted}
          />
        </div>

        <div className="mt-6">
          {showPassword ? (
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault()
                setError('')
                if (!accepted) {
                  setError('Accept the Shopper Terms to create an account.')
                  return
                }
                try {
                  finish(
                    await api.auth.register({
                      email,
                      password,
                      firstName,
                      lastName,
                      role: 'CUSTOMER',
                    }),
                  )
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Sign-up failed')
                }
              }}
            >
              <input
                className="w-full rounded-full bg-black/5 px-4 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
                type="password"
                placeholder="Password (8+ characters)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              <button
                className="h-12 w-full rounded-full bg-brand text-sm font-semibold text-white disabled:opacity-50"
                type="submit"
                disabled={!accepted}
              >
                Create account
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setShowPassword(true)} className="text-sm text-mute hover:text-ice">
              Prefer a password?
            </button>
          )}
        </div>

        {error ? <p className="mt-4 text-sm text-signal">{error}</p> : null}

        <p className="mt-10 text-center text-sm text-mute">
          Already shop here?{' '}
          <Link href="/shop/login" className="font-semibold text-ice hover:text-glow">
            Sign in
          </Link>
        </p>
      </div>
    </AuthChrome>
  )
}
