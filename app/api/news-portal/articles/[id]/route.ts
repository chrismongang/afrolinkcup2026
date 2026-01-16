import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireNewsPortalAuth } from "@/lib/news-portal/auth"
import { generateSlug } from "@/lib/utils/slug"

// GET: Get single article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("news_articles")
      .select(`
        *,
        news_authors!inner(username),
        news_article_teams(team_id)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    )
  }
}

// PATCH: Update article
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("[News Portal API] PATCH called for article:", params.id)
    await requireNewsPortalAuth()
    const supabase = await createClient()

    const requestBody = await request.json()
    console.log("[News Portal API] Request body:", JSON.stringify(requestBody, null, 2))
    const { title, title_image_url, body: articleBody, author_username, match_id, team_ids } = requestBody

    // Variables to track updates
    let authorId: string | undefined = undefined
    let generatedSlug: string | undefined = undefined

    // Update author if changed
    if (author_username) {
      let { data: author, error: authorError } = await supabase
        .from("news_authors")
        .select("id")
        .eq("username", author_username)
        .maybeSingle()

      if (authorError && authorError.code !== "PGRST116") {
        return NextResponse.json({ error: authorError.message }, { status: 400 })
      }

      if (!author) {
        const { data: newAuthor, error: createError } = await supabase
          .from("news_authors")
          .insert({ username: author_username, password_hash: "" })
          .select("id")
          .single()

        if (createError) {
          return NextResponse.json({ error: createError.message }, { status: 400 })
        }
        author = newAuthor
      }

      authorId = author.id
    }

    // Update slug if title changed
    if (title) {
      const baseSlug = generateSlug(title)
      let slug = baseSlug
      let counter = 0

      while (true) {
        const { data: existing } = await supabase
          .from("news_articles")
          .select("id")
          .eq("slug", slug)
          .neq("id", params.id)
          .maybeSingle()

        if (!existing) break
        counter++
        slug = `${baseSlug}-${counter}`
      }

      generatedSlug = slug
    }

    // Update article
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (articleBody !== undefined) updateData.body = articleBody
    if (title_image_url !== undefined) updateData.title_image_url = title_image_url
    if (match_id !== undefined) updateData.match_id = match_id === "none" || match_id === "" ? null : match_id
    if (authorId) updateData.author_id = authorId
    if (generatedSlug) updateData.slug = generatedSlug

    console.log("[News Portal API] Update data:", JSON.stringify(updateData, null, 2))

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      console.log("[News Portal API] No fields to update, fetching existing article")
      const { data: existingArticle, error: fetchError } = await supabase
        .from("news_articles")
        .select()
        .eq("id", params.id)
        .single()
      
      if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 400 })
      }
      
      // Still update team links if needed
      if (team_ids !== undefined) {
        // Delete existing links
        const { error: deleteError } = await supabase
          .from("news_article_teams")
          .delete()
          .eq("article_id", params.id)

        if (deleteError) {
          console.error("[News Portal API] Delete team links error:", deleteError)
        }

        // Insert new links
        if (Array.isArray(team_ids) && team_ids.length > 0) {
          const teamLinks = team_ids.map((teamId: string) => ({
            article_id: params.id,
            team_id: teamId,
          }))

          const { error: insertError } = await supabase.from("news_article_teams").insert(teamLinks)
          if (insertError) {
            console.error("[News Portal API] Insert team links error:", insertError)
          }
        }
      }
      
      return NextResponse.json({ data: existingArticle })
    }

    const { data: article, error: articleError } = await supabase
      .from("news_articles")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (articleError) {
      console.error("[News Portal API] Update error:", articleError)
      return NextResponse.json({ error: articleError.message }, { status: 400 })
    }

    // Update team links if provided
    if (team_ids !== undefined) {
      // Delete existing links
      const { error: deleteError } = await supabase
        .from("news_article_teams")
        .delete()
        .eq("article_id", params.id)

      if (deleteError) {
        console.error("[News Portal API] Delete team links error:", deleteError)
        // Continue anyway, don't fail the whole update
      }

      // Insert new links
      if (Array.isArray(team_ids) && team_ids.length > 0) {
        const teamLinks = team_ids.map((teamId: string) => ({
          article_id: params.id,
          team_id: teamId,
        }))

        const { error: insertError } = await supabase.from("news_article_teams").insert(teamLinks)
        if (insertError) {
          console.error("[News Portal API] Insert team links error:", insertError)
          // Continue anyway, don't fail the whole update
        }
      }
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    console.error("[News Portal API] PATCH error:", error)
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE: Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireNewsPortalAuth()
    const supabase = await createClient()

    const { error } = await supabase
      .from("news_articles")
      .delete()
      .eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
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
