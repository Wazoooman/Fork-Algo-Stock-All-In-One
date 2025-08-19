import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Verification token is required" }, { status: 400 })
    }

    // Verify the token and update user
    const isVerified = await DatabaseService.verifyEmail(token)

    if (!isVerified) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Get user details to send welcome email
    const user = await DatabaseService.getUserByEmail("") // We'll need to modify this

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
