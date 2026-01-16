import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireNewsPortalAuth } from "@/lib/news-portal/auth"
import { generateSlug } from "@/lib/utils/slug"

// GET: List all articles
export async function GET(request: NextRequest) {
  try {
    console.log("[News Portal API] GET /api/news-portal/articles called")
    
    // Add timeout wrapper
    const supabasePromise = createClient()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout: Supabase connection took too long")), 10000)
    )
    
    console.log("[News Portal API] Creating Supabase client...")
    const supabase = await Promise.race([supabasePromise, timeoutPromise]) as Awaited<ReturnType<typeof createClient>>
    console.log("[News Portal API] Supabase client created")
    
    const { searchParams } = new URL(request.url)
    const matchId = searchParams.get("match_id")
    const teamId = searchParams.get("team_id")

    let query = supabase
      .from("news_articles")
      .select(`
        *,
        news_authors!inner(username),
        news_article_teams(team_id)
      `)
      .order("created_at", { ascending: false })

    if (matchId) {
      query = query.eq("match_id", matchId)
    }

    const limitParam = searchParams.get("limit")
    if (limitParam) {
      const limitNum = parseInt(limitParam, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum * 2) // Load more to account for filtering
      }
    }

    // Add timeout for query
    const queryPromise = query
    const queryTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Query timeout")), 8000)
    )
    
    let queryResult
    try {
      queryResult = await Promise.race([queryPromise, queryTimeout])
    } catch (timeoutError) {
      console.error("Query timeout or error:", timeoutError)
      return NextResponse.json(
        { 
          error: "Datenbank-Abfrage hat zu lange gedauert",
          data: []
        },
        { status: 200 }
      )
    }

    const { data, error } = queryResult as { data: any; error: any }

    if (error) {
      // Check if table doesn't exist yet (migration not run)
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json(
          { 
            error: "News-Tabellen existieren noch nicht. Bitte Migrationen ausführen.",
            data: []
          },
          { status: 200 } // Return 200 with empty data instead of error
        )
      }
      console.error("Supabase query error:", error)
      return NextResponse.json(
        { 
          error: error.message || "Fehler beim Laden der Artikel",
          data: []
        },
        { status: 200 } // Return 200 with empty data instead of error
      )
    }

    // Filter by teamId if provided (after fetching, since it's a many-to-many relation)
    let filteredData = data || []
    if (teamId) {
      // Filter by specific team
      filteredData = filteredData.filter((article: any) =>
        article.news_article_teams?.some((link: any) => link.team_id === teamId)
      )
    } else if (matchId) {
      // Filter by specific match - already done in query, no additional filtering needed
    }
    // If no matchId and no teamId, show ALL articles (for homepage or dashboard)

    // Apply limit after filtering
    if (limitParam) {
      const limitNum = parseInt(limitParam, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        filteredData = filteredData.slice(0, limitNum)
      }
    }

    console.log("[News Portal API] Returning", filteredData.length, "articles")
    return NextResponse.json({ data: filteredData })
  } catch (error) {
    console.error("[News Portal API] Error:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        data: []
      },
      { status: 200 } // Return 200 with empty data
    )
  }
}

// POST: Create new article
export async function POST(request: NextRequest) {
  try {
    await requireNewsPortalAuth()
    const supabase = await createClient()

    const requestBody = await request.json()
    const { title, title_image_url, body, author_username, match_id, team_ids } = requestBody

    if (!title || !body || !author_username) {
      return NextResponse.json(
        { error: "Titel, Text und Autor sind erforderlich" },
        { status: 400 }
      )
    }

    // Get or create author
    let { data: author, error: authorError } = await supabase
      .from("news_authors")
      .select("id")
      .eq("username", author_username)
      .maybeSingle()

    if (authorError && authorError.code !== "PGRST116") {
      return NextResponse.json({ error: authorError.message }, { status: 400 })
    }

    if (!author) {
      // Create new author (password_hash can be empty for now, not used in env var auth)
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

    // Generate slug
    const baseSlug = generateSlug(title)
    let slug = baseSlug
    let counter = 0

    // Check for uniqueness
    while (true) {
      const { data: existing } = await supabase
        .from("news_articles")
        .select("id")
        .eq("slug", slug)
        .maybeSingle()

      if (!existing) break
      counter++
      slug = `${baseSlug}-${counter}`
    }

    // Create article
    const { data: article, error: articleError } = await supabase
      .from("news_articles")
      .insert({
        title,
        slug,
        title_image_url: title_image_url || null,
        body,
        author_id: author.id,
        match_id: match_id || null,
      })
      .select("id")
      .single()

    if (articleError) {
      return NextResponse.json({ error: articleError.message }, { status: 400 })
    }

    // Link teams if provided
    if (team_ids && Array.isArray(team_ids) && team_ids.length > 0) {
      const teamLinks = team_ids.map((teamId: string) => ({
        article_id: article.id,
        team_id: teamId,
      }))

      const { error: linkError } = await supabase
        .from("news_article_teams")
        .insert(teamLinks)

      if (linkError) {
        // Article was created, but team linking failed - log but don't fail
        console.error("Failed to link teams:", linkError)
      }
    }

    return NextResponse.json({ data: article })
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
