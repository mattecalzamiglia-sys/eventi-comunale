'use client'

import { createContext, useContext, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import type { User } from '@/types/database'

interface AuthContextType {
  user: User | null
}

const AuthContext = createContext<AuthContextType>({ user: null })

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: React.ReactNode
  initialUser: User | null
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Imposta l'utente iniziale dal server
    setUser(initialUser)
    setLoading(false)
  }, [initialUser, setUser, setLoading])

  return (
    <AuthContext.Provider value={{ user: initialUser }}>
      {children}
    </AuthContext.Provider>
  )
}
