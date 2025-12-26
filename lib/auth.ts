"use client"

import { createContext, useContext } from "react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  subscription: "free" | "premium"
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string }>
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
  private static USERS_KEY = "marketdesk_users"
  private static CURRENT_USER_KEY = "marketdesk_current_user"

  private static getAllUsers(): User[] {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem(this.USERS_KEY)
    return users ? JSON.parse(users) : []
  }

  private static saveUsers(users: User[]) {
    if (typeof window === "undefined") return
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = this.getAllUsers()

      // Check if user already exists
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Email already registered" }
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        firstName,
        lastName,
        subscription: "free",
        createdAt: new Date().toISOString(),
      }

      // Store password separately (in real app, this would be hashed)
      const passwords = JSON.parse(localStorage.getItem("marketdesk_passwords") || "{}")
      passwords[newUser.id] = password

      users.push(newUser)
      this.saveUsers(users)
      localStorage.setItem("marketdesk_passwords", JSON.stringify(passwords))

      return { success: true, user: newUser }
    } catch (error) {
      return { success: false, error: "Registration failed. Please try again." }
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const users = this.getAllUsers()
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())

      if (!user) {
        return { success: false, error: "Invalid email or password" }
      }

      // Verify password
      const passwords = JSON.parse(localStorage.getItem("marketdesk_passwords") || "{}")
      if (passwords[user.id] !== password) {
        return { success: false, error: "Invalid email or password" }
      }

      // Store current user
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))

      return { success: true, user }
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." }
    }
  }

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem(this.CURRENT_USER_KEY)
    return user ? JSON.parse(user) : null
  }

  static setCurrentUser(user: User | null) {
    if (typeof window === "undefined") return

    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    }
  }

  static async logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    }
  }
}
