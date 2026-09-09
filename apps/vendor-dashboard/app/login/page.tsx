'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { ThemeToggle } from '../../components/theme/ThemeToggle'

export default function LoginPage() {
  const router = useRouter()
  const setSession = useAuthStore((s) => s.setSession)
  const [email, setEmail] = useState('vendor@shopping-mall.local')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-grid px-4">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <form
        className="mm-card p-8 rounded-3xl w-full max-w-md"
        onSubmit={async (event) => {
          event.preventDefault()
          setError('')
          try {
            const result = await api.auth.login({ email, password })
            setSession(result.token, result.user)
            router.replace('/')
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
          }
        }}
      >
        <img src="/icon.png" alt="MMall" className="h-16 w-16 rounded-2xl object-cover mb-5 shadow-glow" />
        <p className="text-xs tracking-[0.22em] text-mute mb-2">VENDOR NODE</p>
        <h1 className="text-3xl font-bold mb-6">MMall sign in</h1>
        <input
          className="w-full border rounded-xl px-3 py-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded-xl px-3 py-2 mb-4"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-signal text-sm mb-3">{error}</p> : null}
        <button className="w-full bg-brand text-white py-2.5 rounded-xl shadow-glow" type="submit">
          Continue
        </button>
      </form>
    </div>
  )
}
