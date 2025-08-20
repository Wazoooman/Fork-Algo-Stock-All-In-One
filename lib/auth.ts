"use client"

import { createContext, useContext } from "react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  subscription: "free" | "premium"
  emailVerified?: boolean
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string; message?: string }>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export class AuthService {
  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ success: boolean; error?: string; message?: string; user?: User }> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      console.log("[v0] Login attempt for email:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      console.log("[v0] Login response status:", response.status)
      console.log("[v0] Login response ok:", response.ok)

      const data = await response.json()
      console.log("[v0] Login response data:", data)

      if (data.success && data.user) {
        // Store user in localStorage for client-side state management
        localStorage.setItem("marketdesk_current_user", JSON.stringify(data.user))
      }

      return data
    } catch (error) {
      console.error("[v0] Login network error:", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    try {
      const user = localStorage.getItem("marketdesk_current_user")
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  static setCurrentUser(user: User | null) {
    if (typeof window === "undefined") return

    try {
      if (user) {
        localStorage.setItem("marketdesk_current_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("marketdesk_current_user")
      }
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  }

  static async logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("marketdesk_current_user")
        } catch (error) {
          console.error("Error clearing localStorage:", error)
        }
      }
    }
  }
}
