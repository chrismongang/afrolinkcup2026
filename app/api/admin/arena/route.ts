import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/admin/auth"

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const body = await request.json()

    // Arena Display ist ein Singleton - es gibt nur einen Eintrag
    // Prüfe ob bereits ein Eintrag existiert
    const { data: existing } = await supabase
      .from("arena_display")
      .select("id")
      .limit(1)
      .single()

    let result

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("arena_display")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from("arena_display")
        .insert({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      result = data
    }

    return NextResponse.json({ data: result })
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
