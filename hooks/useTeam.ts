"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Team, Player } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

export type TeamWithPlayers = Team & {
  players: Player[]
}

export function useTeam(teamSlug: string | null) {
  const [team, setTeam] = useState<TeamWithPlayers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!teamSlug) {
      setTeam(null)
      setLoading(false)
      return
    }

    async function fetchTeam() {
      try {
        setLoading(true)
        setError(null)

        // Lade Team
        const { data: teamData, error: teamError } = await supabase
          .from("teams")
          .select("*")
          .eq("team_slug", teamSlug)
          .single()

        if (teamError) throw teamError
        const teamId = (teamData as Team).id

        // Lade Spieler
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .eq("team_id", teamId)
          .order("jersey_number", { ascending: true, nullsFirst: false })

        if (playersError) throw playersError

        setTeam({
          ...(teamData as Team),
          players: (playersData as Player[]) || [],
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [teamSlug, supabase])

  useEffect(() => {
    if (!team?.id) return
    const teamId = team.id

    // Realtime Subscription für Team
    const teamChannel: RealtimeChannel = supabase
      .channel(`team:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
          filter: `id=eq.${teamId}`,
        },
        async () => {
          const { data: teamData, error: teamError } = await supabase
            .from("teams")
            .select("*")
            .eq("id", teamId)
            .single()

          if (!teamError && teamData) {
            setTeam((prev) => (prev ? { ...prev, ...(teamData as Team) } : null))
          }
        }
      )
      .subscribe()

    // Realtime Subscription für Spieler
    const playersChannel: RealtimeChannel = supabase
      .channel(`team-players:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `team_id=eq.${teamId}`,
        },
        async () => {
          const { data: playersData, error: playersError } = await supabase
            .from("players")
            .select("*")
            .eq("team_id", teamId)
            .order("jersey_number", { ascending: true, nullsFirst: false })

          if (!playersError && playersData) {
            setTeam((prev) =>
              prev ? { ...prev, players: playersData as Player[] } : null
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(teamChannel)
      supabase.removeChannel(playersChannel)
    }
  }, [team?.id, supabase])

  return { team, loading, error }
}
