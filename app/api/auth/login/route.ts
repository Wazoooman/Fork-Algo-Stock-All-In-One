import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Login API called - testing imports")

  try {
    // Basic environment check
    const JWT_SECRET = process.env.JWT_SECRET
    const DATABASE_URL = process.env.DATABASE_URL

    console.log("[v0] Environment check - JWT_SECRET exists:", !!JWT_SECRET)
    console.log("[v0] Environment check - DATABASE_URL exists:", !!DATABASE_URL)

    if (!JWT_SECRET || !DATABASE_URL) {
      return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 })
    }

    const { email, password } = await request.json()
    console.log("[v0] Login attempt for:", email)

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Testing database import...")
    try {
      const { DatabaseService } = await import("@/lib/database")
      console.log("[v0] Database import successful")

      const user = await DatabaseService.getUserByEmail(email)
      console.log("[v0] Database query successful, user found:", !!user)

      if (!user) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      console.log("[v0] Testing bcrypt import...")
      const bcrypt = await import("bcryptjs")
      console.log("[v0] bcrypt import successful")

      const isPasswordValid = await bcrypt.compare(password, user.password_hash)
      console.log("[v0] Password verification:", isPasswordValid)

      if (!isPasswordValid) {
        return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
      }

      if (!user.email_verified) {
        return NextResponse.json(
          {
            success: false,
            error: "Please verify your email before logging in. Check your inbox for the verification link.",
          },
          { status: 401 },
        )
      }

      console.log("[v0] Testing JWT import...")
      const jwt = await import("jsonwebtoken")
      console.log("[v0] JWT import successful")

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: "7d" },
      )
      console.log("[v0] JWT token generated successfully")

      return NextResponse.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          emailVerified: user.email_verified,
          subscription: user.subscription || "free",
        },
      })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      return NextResponse.json(
        { success: false, error: "Database connection failed", details: String(dbError) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Login API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", details: String(error) },
      { status: 500 },
    )
  }
}
