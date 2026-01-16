"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { MatchEvent, Player, Team } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

type MatchEventWithDetails = MatchEvent & {
  player?: Player | null
  team: Team
}

export function useRealtimeEvents(matchId: string | null) {
  const [events, setEvents] = useState<MatchEventWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!matchId) {
      setEvents([])
      setLoading(false)
      return
    }

    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("match_events")
          .select(`
            *,
            player:players(*),
            team:teams!match_events_team_id_fkey(*)
          `)
          .eq("match_id", matchId)
          .order("minute", { ascending: true })
          .order("created_at", { ascending: true })

        if (fetchError) throw fetchError

        setEvents((data as MatchEventWithDetails[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()

    // Realtime Subscription für Match Events
    const channel: RealtimeChannel = supabase
      .channel(`match_events:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_events",
          filter: `match_id=eq.${matchId}`,
        },
        async () => {
          // Refetch events when updated
          const { data, error: fetchError } = await supabase
            .from("match_events")
            .select(`
              *,
              player:players(*),
              team:teams!match_events_team_id_fkey(*)
            `)
            .eq("match_id", matchId)
            .order("minute", { ascending: true })
            .order("created_at", { ascending: true })

          if (!fetchError && data) {
            setEvents(data as MatchEventWithDetails[])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  return { events, loading, error }
}

