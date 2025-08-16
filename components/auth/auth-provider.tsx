"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AuthContext, AuthService, type User } from "@/lib/auth"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    const result = await AuthService.login(email, password)

    if (result.success && result.user) {
      setUser(result.user)
      AuthService.setCurrentUser(result.user)
    }

    setLoading(false)
    return result
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true)
    const result = await AuthService.register(email, password, firstName, lastName)

    // Don't automatically log in user after registration - they need to verify email first
    setLoading(false)
    return result
  }

  const logout = async () => {
    setUser(null)
    await AuthService.logout()
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}
