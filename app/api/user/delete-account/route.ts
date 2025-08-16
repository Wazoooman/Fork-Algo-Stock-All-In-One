import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { jwtVerify } from "jose"

const sql = neon(process.env.DATABASE_URL!)
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

    // Delete all user data in the correct order (respecting foreign key constraints)
    await sql.begin(async (sql) => {
      // Delete user preferences
      await sql`DELETE FROM neon_auth.user_preferences WHERE user_id = ${user.userId}`

      // Delete trade history
      await sql`DELETE FROM neon_auth.trade_history WHERE user_id = ${user.userId}`

      // Delete watchlists
      await sql`DELETE FROM neon_auth.watchlists WHERE user_id = ${user.userId}`

      // Finally delete the user
      await sql`DELETE FROM neon_auth.users WHERE id = ${user.userId}`
    })

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
