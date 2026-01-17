import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdminAuth } from "@/lib/admin/auth"

// PATCH: Aktualisiere Spieler
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const body = await request.json()
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.jersey_number !== undefined)
      updateData.jersey_number = parseInt(body.jersey_number)
    if (body.position !== undefined) updateData.position = body.position
    if (body.age !== undefined) updateData.age = body.age ? parseInt(body.age) : null
    if (body.photo_url !== undefined) updateData.photo_url = body.photo_url || null
    if (body.role !== undefined) updateData.role = body.role

    const { data, error } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", params.id)
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

// DELETE: Lösche Spieler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    const supabase = await createClient()

    const { error } = await supabase.from("players").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
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
