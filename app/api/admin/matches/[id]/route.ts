import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/admin/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const body = await request.json()

    // Wenn Status auf LIVE oder LIVE_FIRST_HALF geändert wird und actual_start_time noch nicht gesetzt ist,
    // setze es auf die aktuelle Zeit
    if (body.status && (body.status === "LIVE" || body.status === "LIVE_FIRST_HALF")) {
      // Prüfe ob actual_start_time bereits gesetzt ist
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("actual_start_time")
        .eq("id", params.id)
        .single()

      // Nur setzen wenn noch nicht gesetzt
      if (!existingMatch?.actual_start_time) {
        body.actual_start_time = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from("matches")
      .update(body)
      .eq("id", params.id)
      .select()
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
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}
