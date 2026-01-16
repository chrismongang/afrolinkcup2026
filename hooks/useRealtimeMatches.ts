"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Match, Team } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

export function useRealtimeMatches(filters?: {
  status?: Match["status"][]
  stage?: Match["stage"][]
  limit?: number
}) {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout | null = null
    let channel: RealtimeChannel | null = null

    async function fetchMatches() {
      try {
        setLoading(true)
        setError(null)

        // Timeout von 8 Sekunden für die Abfrage
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error("Abfrage-Timeout: Verbindung zu Supabase zu langsam"))
          }, 8000)
        })

        let query = supabase
          .from("matches")
          .select(`
            *,
            team_home:teams!matches_team_home_id_fkey(*),
            team_away:teams!matches_team_away_id_fkey(*)
          `)
          .order("start_time", { ascending: true })

        if (filters?.status && filters.status.length > 0) {
          query = query.in("status", filters.status)
        }

        if (filters?.stage && filters.stage.length > 0) {
          query = query.in("stage", filters.stage)
        }

        if (filters?.limit && filters.limit > 0) {
          query = query.limit(filters.limit)
        }

        // Race zwischen Query und Timeout
        const queryPromise = query
        const result = await Promise.race([
          queryPromise,
          timeoutPromise,
        ]) as { data: MatchWithTeams[] | null; error: any }

        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (!isMounted) return

        if (result.error) throw result.error

        setMatches((result.data as MatchWithTeams[]) || [])
      } catch (err) {
        if (!isMounted) return
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        setError(err instanceof Error ? err : new Error("Unknown error"))
        // Setze leeres Array als Fallback
        setMatches([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMatches()

    // Realtime Subscription für alle Matches
    channel = supabase
      .channel("matches:realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async () => {
          if (!isMounted) return
          // Refetch matches when any match is updated
          let query = supabase
            .from("matches")
            .select(`
              *,
              team_home:teams!matches_team_home_id_fkey(*),
              team_away:teams!matches_team_away_id_fkey(*)
            `)
            .order("start_time", { ascending: true })

          if (filters?.status && filters.status.length > 0) {
            query = query.in("status", filters.status)
          }

          if (filters?.stage && filters.stage.length > 0) {
            query = query.in("stage", filters.stage)
          }

          if (filters?.limit && filters.limit > 0) {
            query = query.limit(filters.limit)
          }

          const { data, error: fetchError } = await query

          if (!fetchError && data && isMounted) {
            setMatches(data as MatchWithTeams[])
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [
    filters?.status?.join(","),
    filters?.stage?.join(","),
    filters?.limit,
  ])

  return { matches, loading, error }
}

