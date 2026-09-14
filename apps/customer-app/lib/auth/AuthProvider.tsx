import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { Platform } from 'react-native'
import type { User } from '@shopping-mall/shared-types'
import { api } from '../api'
import { createPasskey, getPasskey, passkeysAvailable } from '../passkeys'
import { sessionStore } from '../session'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  persist: (nextToken: string, nextUser: User) => Promise<void>
  applyUser: (nextUser: User) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithPasskey: (email?: string) => Promise<void>
  registerPasskey: () => Promise<void>
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  consumeMagic: (magic: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const persist = async (nextToken: string, nextUser: User) => {
    setToken(nextToken)
    setUser(nextUser)
    await sessionStore.write(sessionStore.TOKEN, nextToken)
    await sessionStore.write(sessionStore.USER, JSON.stringify(nextUser))
  }

  const applyUser = async (nextUser: User) => {
    setUser(nextUser)
    await sessionStore.write(sessionStore.USER, JSON.stringify(nextUser))
  }

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await sessionStore.read(sessionStore.TOKEN)
        const storedUser = await sessionStore.read(sessionStore.USER)
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser) as User)
        }
      } catch (error) {
        console.error('Failed to load auth:', error)
      } finally {
        setIsLoading(false)
      }
    }
    void loadStoredAuth()
  }, [])

  useEffect(() => {
    if (!user || !token) return
    void api.notifications
      .registerDevice({ token: `mmall:${Platform.OS}:${user.id}`, platform: Platform.OS }, token)
      .catch(() => undefined)
  }, [user, token])

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password)
    if (!response.token) throw new Error(response.error || 'Login failed')
    if (response.user.role === 'VENDOR') throw new Error('That email is a merchant account. Use merchant sign-in.')
    try {
      const me = await api.auth.me(response.token)
      await persist(response.token, me)
    } catch {
      await persist(response.token, response.user)
    }
  }

  const loginWithPasskey = async (email?: string) => {
    if (!passkeysAvailable()) {
      throw new Error('Passkeys work in Safari or Chrome on this device.')
    }
    const options = await api.auth.passkeyAuthOptions(email)
    const assertion = await getPasskey(options)
    const response = await api.auth.passkeyAuthVerify({ response: assertion, email })
    if (!response.token) throw new Error(response.error || 'Passkey sign-in failed')
    await persist(response.token, response.user)
  }

  const registerPasskey = async () => {
    if (!token) throw new Error('Sign in first')
    if (!passkeysAvailable()) throw new Error('Passkeys work in Safari or Chrome on this device.')
    const options = await api.auth.passkeyRegisterOptions(token)
    const attestation = await createPasskey(options)
    await api.auth.passkeyRegisterVerify(attestation, token)
  }

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.auth.register(data)
    if (!response.token) throw new Error(response.error || 'Registration failed')
    await persist(response.token, response.user)
  }

  const consumeMagic = async (magic: string) => {
    const response = await api.auth.consumeMagic(magic)
    if (!response.token) throw new Error(response.error || 'Magic link failed')
    await persist(response.token, response.user)
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    await sessionStore.remove(sessionStore.TOKEN)
    await sessionStore.remove(sessionStore.USER)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        persist,
        applyUser,
        login,
        loginWithPasskey,
        registerPasskey,
        register,
        consumeMagic,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
