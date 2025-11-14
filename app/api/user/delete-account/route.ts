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

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const success = await DatabaseService.deleteUser(user.userId)
    
    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 })
    }

    // Clear the auth cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
