import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/admin/auth"

// GET: Lade alle Spieler (mit Team-Filter)
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("team_id")

    let query = supabase
      .from("players")
      .select(`
        *,
        team:teams(id, name, short_name, flag_emoji)
      `)
      .order("jersey_number", { ascending: true, nullsFirst: false })

    if (teamId) {
      query = query.eq("team_id", teamId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

// POST: Erstelle neuen Spieler
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const body = await request.json()
    const { team_id, name, jersey_number, position, age, photo_url, role } = body

    if (!team_id || !name || jersey_number === undefined) {
      return NextResponse.json(
        { error: "team_id, name und jersey_number sind erforderlich" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("players")
      .insert({
        team_id,
        name,
        jersey_number: parseInt(jersey_number),
        position: position || "Spieler",
        age: age ? parseInt(age) : null,
        photo_url: photo_url || null,
        role: role || "player",
      })
      .select(`
        *,
        team:teams(id, name, short_name, flag_emoji)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
