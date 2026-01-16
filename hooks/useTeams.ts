"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Team } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true })

        if (fetchError) throw fetchError

        setTeams((data as Team[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()

    // Realtime Subscription für Teams
    const channel: RealtimeChannel = supabase
      .channel("teams:realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teams",
        },
        async () => {
          // Refetch teams when updated
          const { data, error: fetchError } = await supabase
            .from("teams")
            .select("*")
            .order("name", { ascending: true })

          if (!fetchError && data) {
            setTeams(data as Team[])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { teams, loading, error }
}
