import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { DatabaseService } from "@/lib/database"
import { EmailService } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await DatabaseService.createUser(
      email,
      passwordHash,
      firstName,
      lastName,
      verificationToken,
      tokenExpires,
    )

    // Create default user preferences
    await DatabaseService.createUserPreferences(user.id)

    // Send verification email
    const emailResult = await EmailService.sendVerificationEmail(email, verificationToken, firstName)

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      // Don't fail registration if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: user.email_verified,
        subscription: user.subscription,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
