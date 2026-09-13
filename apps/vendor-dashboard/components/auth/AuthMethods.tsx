'use client'

import { useEffect, useState, type ReactNode } from 'react'
import type { User } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'
import { getPasskey, passkeysAvailable } from '../../lib/passkeys'

export type AuthMethodKind = 'google' | 'apple' | 'passkey' | 'magic' | 'otp'

function BrandMark({
  src,
  tone = 'color',
}: {
  src: string
  tone?: 'color' | 'on-black' | 'themed'
}) {
  const filter =
    tone === 'on-black' ? 'brightness-0 invert' : tone === 'themed' ? 'auth-glyph' : ''
  return (
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      className={`h-5 w-5 shrink-0 object-contain ${filter}`}
    />
  )
}

function MethodButton({
  disabled,
  onClick,
  icon,
  children,
  tone = 'plain',
}: {
  disabled?: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
  tone?: 'plain' | 'google' | 'apple'
}) {
  const toneClass =
    tone === 'google'
      ? 'border-[#dadce0] bg-white text-[#1f1f1f] hover:bg-[#f7f8f8]'
      : tone === 'apple'
        ? 'border-black bg-black text-white hover:bg-[#1a1a1a]'
        : 'border-[var(--mm-card-border)] bg-transparent text-ice hover:bg-black/5'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-full border px-4 text-sm font-semibold disabled:opacity-50 ${toneClass}`}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

export function AuthMethods({
  role,
  purpose,
  email,
  firstName,
  lastName,
  onSession,
  onError,
  kinds = ['google', 'apple', 'passkey', 'magic', 'otp'],
  locked = false,
}: {
  role: 'CUSTOMER' | 'VENDOR'
  purpose: 'login' | 'signup'
  email: string
  firstName?: string
  lastName?: string
  onSession: (result: { token: string; user: User }) => void
  onError: (message: string) => void
  kinds?: AuthMethodKind[]
  locked?: boolean
}) {
  const [otpId, setOtpId] = useState('')
  const [code, setCode] = useState('')
  const [hint, setHint] = useState('')
  const [busy, setBusy] = useState(false)
  const [keys, setKeys] = useState<boolean | null>(null)
  const show = (kind: AuthMethodKind) => kinds.includes(kind)

  useEffect(() => {
    setKeys(passkeysAvailable())
  }, [])

  async function run(task: () => Promise<void>) {
    setBusy(true)
    onError('')
    try {
      await task()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Could not continue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {show('google') ? (
        <MethodButton
          tone="google"
          disabled={busy || locked}
          icon={<BrandMark src="/auth/google.png" tone="color" />}
          onClick={() =>
            void run(async () => {
              await api.auth.startOAuth('google', role)
            })
          }
        >
          Continue with Google
        </MethodButton>
      ) : null}
      {show('apple') ? (
        <MethodButton
          tone="apple"
          disabled={busy || locked}
          icon={<BrandMark src="/auth/apple.svg" tone="on-black" />}
          onClick={() =>
            void run(async () => {
              await api.auth.startOAuth('apple', role)
            })
          }
        >
          Continue with Apple
        </MethodButton>
      ) : null}
      {show('passkey') ? (
        <MethodButton
          disabled={busy || locked || !email || keys === false}
          icon={<BrandMark src="/auth/passkey.svg" tone="themed" />}
          onClick={() =>
            void run(async () => {
              if (!passkeysAvailable()) throw new Error('Passkeys need this browser')
              const options = await api.auth.passkeyAuthOptions(email)
              const assertion = await getPasskey(options)
              onSession(await api.auth.passkeyAuthVerify({ email, response: assertion }))
            })
          }
        >
          {keys === false ? 'Passkeys need this browser' : 'Continue with a passkey'}
        </MethodButton>
      ) : null}
      {show('magic') ? (
        <MethodButton
          disabled={busy || locked || !email}
          icon={<BrandMark src="/auth/magic.svg" tone="themed" />}
          onClick={() =>
            void run(async () => {
              const result = await api.auth.sendMagicLink({ email, purpose, role, firstName, lastName })
              setHint(result.demoLink ? `Dev link: ${result.demoLink}` : 'Check your email for the magic link.')
            })
          }
        >
          Email a magic link
        </MethodButton>
      ) : null}
      {show('otp') ? (
        <MethodButton
          disabled={busy || locked || !email}
          icon={<BrandMark src="/auth/otp.svg" tone="themed" />}
          onClick={() =>
            void run(async () => {
              const result = await api.auth.sendEmailOtp({ email, purpose, role, firstName, lastName })
              setOtpId(result.otpId)
              setHint(result.demoCode ? `Dev code: ${result.demoCode}` : 'We sent a 6-digit code.')
            })
          }
        >
          Email a one-time code
        </MethodButton>
      ) : null}

      {otpId && show('otp') ? (
        <div className="flex gap-2 pt-1">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="6-digit code"
            className="min-w-0 flex-1 rounded-full bg-black/5 px-4 py-3 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
          />
          <button
            type="button"
            disabled={busy || locked || code.length !== 6}
            className="rounded-full bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50"
            onClick={() =>
              void run(async () => {
                onSession(await api.auth.verifyEmailOtp({ otpId, code }))
              })
            }
          >
            Verify
          </button>
        </div>
      ) : null}
      {hint ? <p className="break-all pt-1 text-xs text-mute">{hint}</p> : null}
    </div>
  )
}
