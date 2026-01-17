import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/admin/auth"

// GET: Lade die aktuelle Konfiguration (öffentlich lesbar - keine Auth erforderlich)
export async function GET(request: NextRequest) {
  try {
    // Verwende anonymen Client - RLS-Policy erlaubt öffentliches Lesen
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("arena_screen_config")
      .select("*")
      .order("screen_id", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Konvertiere zu einem einfachen Objekt
    const config: Record<string, string> = {}
    data?.forEach((item) => {
      config[item.screen_id] = item.view
    })

    return NextResponse.json({ data: config })
  } catch (error) {
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

// PATCH: Aktualisiere die Konfiguration
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const body = await request.json()
    const { screen1, screen2 } = body

    if (!screen1 && !screen2) {
      return NextResponse.json(
        { error: "Mindestens ein Screen muss angegeben werden" },
        { status: 400 }
      )
    }

    const updates: Array<{ screen_id: string; view: string }> = []

    if (screen1) {
      updates.push({ screen_id: "screen1", view: screen1 })
    }

    if (screen2) {
      updates.push({ screen_id: "screen2", view: screen2 })
    }

    // Update alle angegebenen Screens
    const results = await Promise.all(
      updates.map(async (update) => {
        const { data, error } = await supabase
          .from("arena_screen_config")
          .update({
            view: update.view,
            updated_at: new Date().toISOString(),
          })
          .eq("screen_id", update.screen_id)
          .select()
          .single()

        if (error) {
          throw error
        }

        return data
      })
    )

    return NextResponse.json({ data: results })
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
