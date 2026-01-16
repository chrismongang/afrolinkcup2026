"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Player } from "@/types"

export function useMatchPlayers(homeTeamId: string | null, awayTeamId: string | null) {
  const [homePlayers, setHomePlayers] = useState<Player[]>([])
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!homeTeamId || !awayTeamId) {
      setHomePlayers([])
      setAwayPlayers([])
      setLoading(false)
      return
    }

    async function fetchPlayers() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("players")
          .select("*")
          .in("team_id", [homeTeamId, awayTeamId])
          .eq("role", "player")
          .order("jersey_number", { ascending: true, nullsFirst: false })

        if (fetchError) throw fetchError

        const players = (data as Player[]) || []
        setHomePlayers(players.filter((p) => p.team_id === homeTeamId))
        setAwayPlayers(players.filter((p) => p.team_id === awayTeamId))
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [homeTeamId, awayTeamId, supabase])

  return { homePlayers, awayPlayers, loading, error }
}
