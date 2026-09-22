'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GuestChrome } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'
import { api } from '../../../lib/api'
import { useAuthStore } from '../../../stores/authStore'
import { TermsAccept } from '../../../components/auth/TermsAccept'

const reasons = [
  { title: 'Your own shop', detail: 'A branded store on the mall, not a listing lost in a marketplace dump.' },
  { title: 'One checkout', detail: 'Shoppers pay once with PayGate. You fulfil from your court.' },
  { title: 'Ads and studio', detail: 'Promote on the mall and generate banners when you are ready.' },
  { title: 'Gift cards', detail: 'MMall cards spend at every shop, including yours.' },
]

export default function SellPage() {
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
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

  async function sendOtp() {
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

  return (
    <GuestChrome>
      <CourtNav />
      <p className="text-xs tracking-[0.2em] text-mute">VENDOR</p>
      <p className="mt-3 text-sm">
        <Link href="/shop" className="font-semibold text-glow hover:underline">
          ← Continue shopping
        </Link>
        {' · '}
        <Link href="/shop/join" className="text-glow hover:underline">
          Back to join
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Sell on MMall</h1>
      <p className="mt-2 max-w-3xl text-mute">
        This creates a merchant account and a store. Shopping uses a different shopper sign-up.{' '}
        <Link href="/shop/signup" className="text-glow">
          I only want to buy
        </Link>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reasons.map((item) => (
              <article key={item.title} className="rounded-xl bg-black/5 p-4">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-mute">{item.detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-mute">
            Explorer stores are free. KYC unlocks payouts, ads, and going fully live.{' '}
            <Link href="/fees" className="text-glow">
              Fees
            </Link>
          </p>
        </section>

        <form
          className="rounded-2xl bg-black/5 p-6"
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
              setSession(result.token, result.user)
              router.replace('/products')
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Sign-up failed')
            } finally {
              setBusy(false)
            }
          }}
        >
          <h2 className="text-xl font-semibold">Create your shop</h2>
          <input
            className="mt-4 w-full rounded-xl bg-black/5 px-3 py-2 text-sm"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
          <input
            className="mt-3 w-full rounded-xl bg-black/5 px-3 py-2 text-sm"
            placeholder="Work email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="mt-3 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl bg-black/5 px-3 py-2 text-sm"
              placeholder="Phone +27…"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => void sendOtp()}
              disabled={busy || phone.length < 10}
              className="rounded-xl bg-navy px-3 text-sm text-ice"
            >
              SMS OTP
            </button>
          </div>
          {otpId ? (
            <input
              className="mt-3 w-full rounded-xl bg-black/5 px-3 py-2 text-sm"
              placeholder="6-digit SMS code"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              required
            />
          ) : null}
          {demoCode ? <p className="mt-2 text-xs text-mute">Dev code: {demoCode}</p> : null}
          <input
            className="mt-3 w-full rounded-xl bg-black/5 px-3 py-2 text-sm"
            placeholder="Password (8+ characters)"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <div className="mt-4">
            <TermsAccept role="vendor" accepted={accepted} onChange={setAccepted} />
          </div>
          {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}
          <button
            className="mt-4 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            type="submit"
            disabled={busy || !otpId || !accepted}
          >
            Create free store
          </button>
          <p className="mt-4 text-sm text-mute">
            Already selling?{' '}
            <Link href="/login?next=/" className="text-glow">
              Merchant sign in
            </Link>
          </p>
        </form>
      </div>
    </GuestChrome>
  )
}
