import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/admin/auth"

// POST: Upload Spieler-Bild
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const playerId = formData.get("player_id") as string

    if (!file || !playerId) {
      return NextResponse.json(
        { error: "Datei und player_id sind erforderlich" },
        { status: 400 }
      )
    }

    // Validiere Dateityp
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Nur Bilddateien sind erlaubt" },
        { status: 400 }
      )
    }

    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Datei ist zu groß (max 5MB)" },
        { status: 400 }
      )
    }

    // Generiere eindeutigen Dateinamen
    const fileExt = file.name.split(".").pop()
    const fileName = `${playerId}-${Date.now()}.${fileExt}`
    const filePath = `players/${fileName}`

    // Upload zu Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("player-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      )
    }

    // Hole öffentliche URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("player-images").getPublicUrl(filePath)

    // Update Spieler mit photo_url
    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({ photo_url: publicUrl })
      .eq("id", playerId)
      .select()
      .single()

    if (updateError) {
      // Lösche hochgeladene Datei bei Fehler
      await supabase.storage.from("player-images").remove([filePath])
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: { url: publicUrl } })
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
