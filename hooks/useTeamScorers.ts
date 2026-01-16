"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Player, MatchEvent } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

export type Scorer = {
  player: Player
  goals: number
}

type MatchEventWithPlayer = MatchEvent & {
  player?: Player | null
}

export function useTeamScorers(teamId: string | null) {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!teamId) {
      setScorers([])
      setLoading(false)
      return
    }

    async function fetchScorers() {
      try {
        setLoading(true)
        setError(null)

        // Lade alle Tore des Teams (GOAL und OWN_GOAL)
        const { data: eventsData, error: eventsError } = await supabase
          .from("match_events")
          .select(`
            *,
            player:players(*)
          `)
          .eq("team_id", teamId)
          .in("type", ["GOAL", "OWN_GOAL"])

        if (eventsError) throw eventsError

        const events = (eventsData as MatchEventWithPlayer[]) || []

        // Zähle Tore pro Spieler
        const scorerMap = new Map<string, Scorer>()

        events.forEach((event) => {
          if (event.player) {
            const playerId = event.player.id
            const existing = scorerMap.get(playerId)

            if (existing) {
              existing.goals++
            } else {
              scorerMap.set(playerId, {
                player: event.player,
                goals: 1,
              })
            }
          }
        })

        // Sortiere nach Anzahl Toren (absteigend)
        const sortedScorers = Array.from(scorerMap.values()).sort(
          (a, b) => b.goals - a.goals
        )

        setScorers(sortedScorers)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchScorers()

    // Realtime Subscription für Match Events
    const channel: RealtimeChannel = supabase
      .channel(`team-scorers:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
        },
        async () => {
          // Refetch scorers when match events change
          const { data: eventsData, error: eventsError } = await supabase
            .from("match_events")
            .select(`
              *,
              player:players(*)
            `)
            .eq("team_id", teamId)
            .in("type", ["GOAL", "OWN_GOAL"])

          if (!eventsError && eventsData) {
            const events = eventsData as MatchEventWithPlayer[]
            const scorerMap = new Map<string, Scorer>()

            events.forEach((event) => {
              if (event.player) {
                const playerId = event.player.id
                const existing = scorerMap.get(playerId)

                if (existing) {
                  existing.goals++
                } else {
                  scorerMap.set(playerId, {
                    player: event.player,
                    goals: 1,
                  })
                }
              }
            })

            const sortedScorers = Array.from(scorerMap.values()).sort(
              (a, b) => b.goals - a.goals
            )

            setScorers(sortedScorers)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, supabase])

  return { scorers, loading, error }
}
