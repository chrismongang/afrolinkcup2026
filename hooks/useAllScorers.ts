"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Player, Team, MatchEvent } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

export type Scorer = {
  player: Player & { team: Team }
  goals: number
}

type MatchEventWithPlayer = MatchEvent & {
  player?: Player | null
}

export function useAllScorers() {
  const [scorers, setScorers] = useState<Scorer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchScorers() {
      try {
        setLoading(true)
        setError(null)

        // Lade alle Tore (nur GOAL, keine OWN_GOAL) mit Spieler-Informationen
        const { data: eventsData, error: eventsError } = await supabase
          .from("match_events")
          .select(`
            *,
            player:players(*)
          `)
          .eq("type", "GOAL") // Nur reguläre Tore, keine Eigentore
          .not("player_id", "is", null) // Nur Events mit Spieler

        if (eventsError) throw eventsError

        const events = (eventsData as MatchEventWithPlayer[]) || []

        // Zähle Tore pro Spieler
        const scorerMap = new Map<string, Scorer>()

        // Lade alle Teams für die Spieler
        const playerIds = new Set<string>()
        events.forEach((event) => {
          if (event.player) {
            playerIds.add(event.player.team_id)
          }
        })

        const { data: teamsData } = await supabase
          .from("teams")
          .select("*")
          .in("id", Array.from(playerIds))

        const teamsMap = new Map<string, Team>()
        if (teamsData) {
          teamsData.forEach((team) => {
            teamsMap.set(team.id, team as Team)
          })
        }

        events.forEach((event) => {
          if (event.player) {
            const playerId = event.player.id
            const team = teamsMap.get(event.player.team_id)
            
            if (team) {
              const playerWithTeam = {
                ...event.player,
                team: team,
              }
              const existing = scorerMap.get(playerId)

              if (existing) {
                existing.goals++
              } else {
                scorerMap.set(playerId, {
                  player: playerWithTeam,
                  goals: 1,
                })
              }
            }
          }
        })

        // Filtere Spieler mit 0 Toren raus und sortiere nach Anzahl Toren (absteigend)
        const sortedScorers = Array.from(scorerMap.values())
          .filter((scorer) => scorer.goals > 0)
          .sort((a, b) => b.goals - a.goals)

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
      .channel("all-scorers:realtime")
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
            .eq("type", "GOAL")
            .not("player_id", "is", null)

          if (!eventsError && eventsData) {
            const events = eventsData as MatchEventWithPlayer[]
            
            // Lade alle Teams für die Spieler
            const playerIds = new Set<string>()
            events.forEach((event) => {
              if (event.player) {
                playerIds.add(event.player.team_id)
              }
            })

            const { data: teamsData } = await supabase
              .from("teams")
              .select("*")
              .in("id", Array.from(playerIds))

            const teamsMap = new Map<string, Team>()
            if (teamsData) {
              teamsData.forEach((team) => {
                teamsMap.set(team.id, team as Team)
              })
            }

            const scorerMap = new Map<string, Scorer>()

            events.forEach((event) => {
              if (event.player) {
                const playerId = event.player.id
                const team = teamsMap.get(event.player.team_id)
                
                if (team) {
                  const playerWithTeam = {
                    ...event.player,
                    team: team,
                  }
                  const existing = scorerMap.get(playerId)

                  if (existing) {
                    existing.goals++
                  } else {
                    scorerMap.set(playerId, {
                      player: playerWithTeam,
                      goals: 1,
                    })
                  }
                }
              }
            })

            const sortedScorers = Array.from(scorerMap.values())
              .filter((scorer) => scorer.goals > 0)
              .sort((a, b) => b.goals - a.goals)

            setScorers(sortedScorers)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { scorers, loading, error }
}
