"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Match, Team } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

export function useTeamMatches(teamId: string | null) {
  const [matches, setMatches] = useState<MatchWithTeams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!teamId) {
      setMatches([])
      setLoading(false)
      return
    }

    async function fetchMatches() {
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
          .or(`team_home_id.eq.${teamId},team_away_id.eq.${teamId}`)
          .order("start_time", { ascending: true })

        if (fetchError) throw fetchError

        setMatches((data as MatchWithTeams[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()

    // Realtime Subscription für Matches
    const channel: RealtimeChannel = supabase
      .channel(`team-matches:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async () => {
          const { data, error: fetchError } = await supabase
            .from("matches")
            .select(`
              *,
              team_home:teams!matches_team_home_id_fkey(*),
              team_away:teams!matches_team_away_id_fkey(*)
            `)
            .or(`team_home_id.eq.${teamId},team_away_id.eq.${teamId}`)
            .order("start_time", { ascending: true })

          if (!fetchError && data) {
            setMatches(data as MatchWithTeams[])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, supabase])

  return { matches, loading, error }
}
