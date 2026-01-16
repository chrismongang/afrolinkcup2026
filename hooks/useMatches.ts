"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Match, Team } from "@/types"
import type { Database } from "@/types/database.types"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

export function useMatches(filters?: {
  status?: Match["status"][]
  stage?: Match["stage"][]
  limit?: number
  orderBy?: "start_time" | "created_at"
  orderDirection?: "asc" | "desc"
}) {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)

        let query = supabase
          .from("matches")
          .select(`
            *,
            team_home:teams!matches_team_home_id_fkey(*),
            team_away:teams!matches_team_away_id_fkey(*)
          `)

        if (filters?.status && filters.status.length > 0) {
          query = query.in("status", filters.status)
        }

        if (filters?.stage && filters.stage.length > 0) {
          query = query.in("stage", filters.stage)
        }

        if (filters?.orderBy) {
          query = query.order(filters.orderBy, {
            ascending: filters.orderDirection === "asc",
          })
        } else {
          query = query.order("start_time", { ascending: true })
        }

        if (filters?.limit) {
          query = query.limit(filters.limit)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setMatches((data as MatchWithTeams[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [
    filters?.status?.join(","),
    filters?.stage?.join(","),
    filters?.limit,
    filters?.orderBy,
    filters?.orderDirection,
  ])

  return { matches, loading, error }
}

