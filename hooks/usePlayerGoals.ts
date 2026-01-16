"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function usePlayerGoals(playerId: string | null) {
  const [goals, setGoals] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!playerId) {
      setGoals(0)
      setLoading(false)
      return
    }

    async function fetchGoals() {
      try {
        setLoading(true)
        setError(null)

        // Zähle alle Tore des Spielers (GOAL und OWN_GOAL)
        const { data, error: fetchError } = await supabase
          .from("match_events")
          .select("id")
          .eq("player_id", playerId)
          .in("type", ["GOAL", "OWN_GOAL"])

        if (fetchError) throw fetchError

        setGoals(data?.length || 0)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()

    // Realtime Subscription für Match Events
    const channel: RealtimeChannel = supabase
      .channel(`player-goals:${playerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
        },
        async () => {
          // Refetch goals when match events change
          const { data, error: fetchError } = await supabase
            .from("match_events")
            .select("id")
            .eq("player_id", playerId)
            .in("type", ["GOAL", "OWN_GOAL"])

          if (!fetchError && data) {
            setGoals(data.length)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [playerId, supabase])

  return { goals, loading, error }
}
