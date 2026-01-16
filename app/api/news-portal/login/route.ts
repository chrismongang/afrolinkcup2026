import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: "Passwort ist erforderlich" },
        { status: 400 }
      )
    }

    // Check against environment variable
    const validPassword = process.env.NEWS_PORTAL_PASSWORD

    if (!validPassword) {
      return NextResponse.json(
        { error: "News Portal nicht konfiguriert" },
        { status: 500 }
      )
    }

    if (password !== validPassword) {
      return NextResponse.json(
        { error: "Ungültiges Passwort" },
        { status: 401 }
      )
    }

    // Create session cookie (simple approach)
    const response = NextResponse.json({ success: true })
    response.cookies.set("news-portal-access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
