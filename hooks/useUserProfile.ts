"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile, Tip, Match } from "@/types"

export type UserTipWithMatch = Tip & {
  match: Match & {
    team_home: { name: string; short_name: string; flag_emoji: string }
    team_away: { name: string; short_name: string; flag_emoji: string }
  }
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [tips, setTips] = useState<UserTipWithMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setProfile(null)
          setTips([])
          setLoading(false)
          return
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        if (!profileData) {
          setProfile(null)
          setTips([])
          setLoading(false)
          return
        }

        setProfile(profileData as UserProfile)

        // Fetch user tips with match details
        const { data: tipsData, error: tipsError } = await supabase
          .from("tips")
          .select(`
            *,
            match:matches(
              *,
              team_home:teams!matches_team_home_id_fkey(name, short_name, flag_emoji),
              team_away:teams!matches_team_away_id_fkey(name, short_name, flag_emoji)
            )
          `)
          .eq("user_profile_id", profileData.id)
          .not("predicted_home_score", "is", null)
          .not("predicted_away_score", "is", null)
          .order("created_at", { ascending: false })

        if (tipsError) throw tipsError

        setTips((tipsData as UserTipWithMatch[]) || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  return { profile, tips, loading, error }
}
