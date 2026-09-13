'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { AuthChrome } from '../../components/auth/AuthChrome'
import { AuthMethods } from '../../components/auth/AuthMethods'
import { TermsAccept } from '../../components/auth/TermsAccept'

export default function SignupPage() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otpId, setOtpId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const [firstName, ...lastParts] = fullName.trim().split(/\s+/)
  const lastName = lastParts.join(' ')

  const sendOtp = async () => {
    setError('')
    setBusy(true)
    try {
      const result = await api.auth.sendOtp({ phone })
      setOtpId(result.otpId)
      setDemoCode(result.demoCode ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send code')
    } finally {
      setBusy(false)
    }
  }

  function finish(result: { token: string; user: { role: string } }) {
    setSession(result.token, result.user as never)
    router.replace('/')
  }

  return (
    <AuthChrome closeHref="/shop">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-2">
        <section className="flex flex-col justify-between text-ice">
          <div>
            <p className="text-xs tracking-[0.22em] text-mute">VENDOR NODE</p>
            <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight">
              Launch your store, generate AI banners, and start selling today.
            </h1>
            <p className="mt-4 max-w-md text-mute">
              Create a free Explorer store in under a minute. Verify later when you go live, buy ads, or take payouts.
            </p>
          </div>
          <p className="mt-8 text-xs text-mute">Identity checks use Smile ID when you unlock paid features.</p>
        </section>

        <form
          className="mm-card w-full max-w-md rounded-3xl p-8"
          onSubmit={async (event) => {
            event.preventDefault()
            setError('')
            if (!accepted) {
              setError('Accept the Vendor Terms to create a store.')
              return
            }
            setBusy(true)
            try {
              const result = await api.auth.registerVendor({
                fullName,
                email,
                phone,
                password,
                otpId,
                otpCode,
              })
              finish(result)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Sign-up failed')
            } finally {
              setBusy(false)
            }
          }}
        >
          <p className="mb-2 text-xs tracking-[0.22em] text-mute">CREATE FREE STORE</p>
          <h2 className="mb-6 text-3xl font-bold">Join MMall</h2>
          <input
            className="mb-3 w-full rounded-xl border px-3 py-2"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            className="mb-3 w-full rounded-xl border px-3 py-2"
            placeholder="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="mb-3 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border px-3 py-2"
              placeholder="Phone +27..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={busy || phone.length < 10}
              className="rounded-xl bg-navy px-3 text-sm text-ice"
            >
              SMS OTP
            </button>
          </div>
          {otpId ? (
            <input
              className="mb-3 w-full rounded-xl border px-3 py-2"
              placeholder="6-digit SMS code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          ) : null}
          {demoCode ? <p className="mb-3 text-xs text-mute">Dev code: {demoCode}</p> : null}
          <input
            className="mb-4 w-full rounded-xl border px-3 py-2"
            placeholder="Password (8+ characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <div className="mb-4">
            <TermsAccept role="vendor" accepted={accepted} onChange={setAccepted} />
          </div>
          {error ? <p className="mb-3 text-sm text-signal">{error}</p> : null}
          <button
            className="w-full rounded-xl bg-brand py-2.5 text-white shadow-glow disabled:opacity-50"
            type="submit"
            disabled={busy || !otpId || !accepted}
          >
            Create Free Store
          </button>

          <div className="my-6 flex items-center gap-3 text-xs tracking-wide text-mute">
            <span className="h-px flex-1 bg-[var(--mm-card-border)]" />
            or continue without a password
            <span className="h-px flex-1 bg-[var(--mm-card-border)]" />
          </div>
          <AuthMethods
            role="VENDOR"
            purpose="signup"
            email={email}
            firstName={firstName}
            lastName={lastName}
            onSession={finish}
            onError={setError}
            locked={!accepted}
          />

          <p className="mt-4 text-sm text-mute">
            Already selling?{' '}
            <Link href="/login" className="text-glow">
              Sign in
            </Link>
            {' · '}
            <Link href="/shop/signup" className="text-glow">
              I want to shop
            </Link>
          </p>
        </form>
      </div>
    </AuthChrome>
  )
}
