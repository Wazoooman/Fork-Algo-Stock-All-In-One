import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { DatabaseService } from "@/lib/database"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string; email: string }
  } catch (error) {
    return null
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { firstName, lastName } = await request.json()

    if (!firstName || !lastName) {
      return NextResponse.json({ success: false, error: "First name and last name are required" }, { status: 400 })
    }

    const updatedUser = await DatabaseService.updateUserName(user.userId, firstName, lastName)

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        subscription: updatedUser.subscription,
        createdAt: updatedUser.created_at,
        emailVerified: updatedUser.email_verified,
      },
    })
  } catch (error) {
    console.error("Update name error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
