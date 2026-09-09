import React, { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '@shopping-mall/shared-types'
import { api } from '../api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token')
        const storedUser = await AsyncStorage.getItem('auth_user')
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
    if (response.token) {
      setToken(response.token)
      setUser(response.user)
      await AsyncStorage.setItem('auth_token', response.token)
      await AsyncStorage.setItem('auth_user', JSON.stringify(response.user))
    } else {
      throw new Error(response.error || 'Login failed')
    }
  }

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.auth.register(data)
    if (response.token) {
      setToken(response.token)
      setUser(response.user)
      await AsyncStorage.setItem('auth_token', response.token)
      await AsyncStorage.setItem('auth_user', JSON.stringify(response.user))
    } else {
      throw new Error(response.error || 'Registration failed')
    }
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    await AsyncStorage.removeItem('auth_token')
    await AsyncStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
