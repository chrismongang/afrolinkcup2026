"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/types"

export type LeaderboardEntry = UserProfile & {
  rank: number
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchLeaderboard() {
      try {
        if (!isMounted) return
        
        setError(null)

        // Fetch all user profiles with points, sorted by total_points (desc) and created_at (asc)
        const { data, error: fetchError } = await supabase
          .from("user_profiles")
          .select("*")
          .not("user_id", "is", null) // Only registered users
          .order("total_points", { ascending: false })
          .order("created_at", { ascending: true })

        if (fetchError) throw fetchError

        if (!isMounted) return

        // Add rank (same points = same rank)
        const entriesWithRank: LeaderboardEntry[] = (data || []).map((profile, index) => {
          // Calculate rank: if previous entry has same points, use same rank
          let rank = index + 1
          if (index > 0 && data && data[index - 1].total_points === profile.total_points) {
            // Find the first entry with this point value
            const firstWithSamePoints = data.findIndex(
              (p) => p.total_points === profile.total_points
            )
            rank = firstWithSamePoints + 1
          }
          return {
            ...profile,
            rank,
          }
        })

        setEntries(entriesWithRank)
        setLoading(false)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err : new Error("Unknown error"))
        setLoading(false)
      }
    }

    // Initial fetch
    fetchLeaderboard()

    // Polling: Fetch leaderboard every 10 seconds (instead of Realtime to reduce load)
    intervalRef.current = setInterval(() => {
      if (isMounted) {
        fetchLeaderboard()
      }
    }, 10000) // 10 seconds

    return () => {
      isMounted = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [supabase])

  return { entries, loading, error }
}
