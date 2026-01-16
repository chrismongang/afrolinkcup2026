"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Match, Team } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

export function useRealtimeMatch(matchId: string | null) {
  const [match, setMatch] = useState<MatchWithTeams | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!matchId) {
      setMatch(null)
      setLoading(false)
      return
    }

    async function fetchMatch() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("matches")
          .select(`
            *,
            team_home:teams!matches_team_home_id_fkey(*),
            team_away:teams!matches_team_away_id_fkey(*)
          `)
          .eq("id", matchId)
          .single()

        if (fetchError) throw fetchError

        setMatch(data as MatchWithTeams)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchMatch()

    // Realtime Subscription
    const channel: RealtimeChannel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `id=eq.${matchId}`,
        },
        async (payload) => {
          // Refetch match data when updated
          const { data, error: fetchError } = await supabase
            .from("matches")
            .select(`
              *,
              team_home:teams!matches_team_home_id_fkey(*),
              team_away:teams!matches_team_away_id_fkey(*)
            `)
            .eq("id", matchId)
            .single()

          if (!fetchError && data) {
            setMatch(data as MatchWithTeams)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  return { match, loading, error }
}

