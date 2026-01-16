"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Player, Team } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

export type SquadData = {
  team: Team
  players: Player[]
}

export function useMatchSquads(homeTeamId: string | null, awayTeamId: string | null) {
  const [homeSquad, setHomeSquad] = useState<SquadData | null>(null)
  const [awaySquad, setAwaySquad] = useState<SquadData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!homeTeamId || !awayTeamId) {
      setHomeSquad(null)
      setAwaySquad(null)
      setLoading(false)
      return
    }

    async function fetchSquads() {
      try {
        setLoading(true)
        setError(null)

        // Lade beide Teams
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .in("id", [homeTeamId, awayTeamId])

        if (teamsError) throw teamsError

        const teams = (teamsData as Team[]) || []
        const homeTeam = teams.find((t) => t.id === homeTeamId)
        const awayTeam = teams.find((t) => t.id === awayTeamId)

        if (!homeTeam || !awayTeam) {
          throw new Error("Teams not found")
        }

        // Lade Spieler beider Teams
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("*")
          .in("team_id", [homeTeamId, awayTeamId])
          .order("jersey_number", { ascending: true, nullsFirst: false })

        if (playersError) throw playersError

        const players = (playersData as Player[]) || []
        const homePlayers = players.filter((p) => p.team_id === homeTeamId)
        const awayPlayers = players.filter((p) => p.team_id === awayTeamId)

        setHomeSquad({
          team: homeTeam,
          players: homePlayers,
        })

        setAwaySquad({
          team: awayTeam,
          players: awayPlayers,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchSquads()

    // Realtime Subscription für Teams
    const teamsChannel: RealtimeChannel = supabase
      .channel("match-squads-teams")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        async () => {
          const { data: teamsData, error: teamsError } = await supabase
            .from("teams")
            .select("*")
            .in("id", [homeTeamId, awayTeamId])

          if (!teamsError && teamsData) {
            const teams = teamsData as Team[]
            const homeTeam = teams.find((t) => t.id === homeTeamId)
            const awayTeam = teams.find((t) => t.id === awayTeamId)

            if (homeTeam && awayTeam) {
              setHomeSquad((prev) => prev ? { ...prev, team: homeTeam } : null)
              setAwaySquad((prev) => prev ? { ...prev, team: awayTeam } : null)
            }
          }
        }
      )
      .subscribe()

    // Realtime Subscription für Spieler
    const playersChannel: RealtimeChannel = supabase
      .channel("match-squads-players")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
        },
        async () => {
          const { data: playersData, error: playersError } = await supabase
            .from("players")
            .select("*")
            .in("team_id", [homeTeamId, awayTeamId])
            .order("jersey_number", { ascending: true, nullsFirst: false })

          if (!playersError && playersData) {
            const players = playersData as Player[]
            const homePlayers = players.filter((p) => p.team_id === homeTeamId)
            const awayPlayers = players.filter((p) => p.team_id === awayTeamId)

            setHomeSquad((prev) =>
              prev ? { ...prev, players: homePlayers } : null
            )
            setAwaySquad((prev) =>
              prev ? { ...prev, players: awayPlayers } : null
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(teamsChannel)
      supabase.removeChannel(playersChannel)
    }
  }, [homeTeamId, awayTeamId, supabase])

  return { homeSquad, awaySquad, loading, error }
}
