"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tip } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"

type TipDistribution = {
  home: number
  away: number
  draw: number
  total: number
}

export function useMatchTips(matchId: string | null) {
  const [userTip, setUserTip] = useState<Tip | null>(null)
  const [distribution, setDistribution] = useState<TipDistribution>({
    home: 0,
    away: 0,
    draw: 0,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!matchId) {
      setUserTip(null)
      setDistribution({ home: 0, away: 0, draw: 0, total: 0 })
      setLoading(false)
      return
    }

    async function fetchTips() {
      try {
        setLoading(true)
        setError(null)

        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle()

          if (profileError && profileError.code !== "PGRST116") {
            throw profileError
          }

          if (profile) {
            const { data: userTipData, error: userTipError } = await supabase
              .from("tips")
              .select("*")
              .eq("match_id", matchId)
              .eq("user_profile_id", profile.id)
              .maybeSingle()

            if (userTipError && userTipError.code !== "PGRST116") {
              throw userTipError
            }

            setUserTip(userTipData || null)
          } else {
            setUserTip(null)
          }
        } else {
          setUserTip(null)
        }

        // Fetch distribution
        const { data: distributionData, error: distributionError } = await supabase
          .from("tips")
          .select("predicted_winner")
          .eq("match_id", matchId)
          .not("predicted_winner", "is", null)

        if (distributionError) throw distributionError

        const dist: TipDistribution = {
          home: 0,
          away: 0,
          draw: 0,
          total: distributionData?.length || 0,
        }

        distributionData?.forEach((tip) => {
          if (tip.predicted_winner === "HOME") dist.home++
          else if (tip.predicted_winner === "AWAY") dist.away++
          else if (tip.predicted_winner === "DRAW") dist.draw++
        })

        setDistribution(dist)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchTips()

    // Realtime subscription for tips
    const channel: RealtimeChannel = supabase
      .channel(`tips:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tips",
          filter: `match_id=eq.${matchId}`,
        },
        async () => {
          // Refetch distribution when tips change
          const { data: distributionData, error: distributionError } = await supabase
            .from("tips")
            .select("predicted_winner")
            .eq("match_id", matchId)
            .not("predicted_winner", "is", null)

          if (!distributionError && distributionData) {
            const dist: TipDistribution = {
              home: 0,
              away: 0,
              draw: 0,
              total: distributionData.length,
            }

            distributionData.forEach((tip) => {
              if (tip.predicted_winner === "HOME") dist.home++
              else if (tip.predicted_winner === "AWAY") dist.away++
              else if (tip.predicted_winner === "DRAW") dist.draw++
            })

            setDistribution(dist)
          }

          // Refetch user tip
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session?.user) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("id")
              .eq("user_id", session.user.id)
              .maybeSingle()

            if (profile) {
              const { data: userTipData } = await supabase
                .from("tips")
                .select("*")
                .eq("match_id", matchId)
                .eq("user_profile_id", profile.id)
                .maybeSingle()

              setUserTip(userTipData || null)
            } else {
              setUserTip(null)
            }
          } else {
            setUserTip(null)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const submitWinnerTip = async (winner: "HOME" | "AWAY" | "DRAW") => {
    if (!matchId) return { error: new Error("No match ID") }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        return { error: new Error("Must be logged in to submit winner tip") }
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        return { error: profileError }
      }

      const userProfileId = profile?.id || null

      if (!userProfileId) {
        return { error: new Error("User profile not found") }
      }

      // Check if tip already exists
      let existingTipQuery = supabase
        .from("tips")
        .select("*")
        .eq("match_id", matchId)

      existingTipQuery = existingTipQuery.eq("user_profile_id", userProfileId)

      const { data: existingTip } = await existingTipQuery.maybeSingle()

      if (existingTip) {
        // Update existing tip (only if score tip not submitted yet)
        if (
          existingTip.predicted_home_score === null ||
          existingTip.predicted_home_score === undefined ||
          existingTip.predicted_away_score === null ||
          existingTip.predicted_away_score === undefined
        ) {
          const { error: updateError } = await supabase
            .from("tips")
            .update({ predicted_winner: winner })
            .eq("id", existingTip.id)

          if (updateError) throw updateError
        }
      } else {
        // Create new tip
        const tipData: any = {
          match_id: matchId,
          predicted_winner: winner,
        }

        tipData.user_profile_id = userProfileId

        const { error: insertError } = await supabase.from("tips").insert(tipData)

        if (insertError) throw insertError
      }

      // Immediately refetch user tip to update UI
      if (userProfileId) {
        const { data: userTipData } = await supabase
          .from("tips")
          .select("*")
          .eq("match_id", matchId)
          .eq("user_profile_id", userProfileId)
          .maybeSingle()

        setUserTip(userTipData || null)
      }

      // Refetch distribution
      const { data: distributionData } = await supabase
        .from("tips")
        .select("predicted_winner")
        .eq("match_id", matchId)
        .not("predicted_winner", "is", null)

      if (distributionData) {
        const dist: TipDistribution = {
          home: 0,
          away: 0,
          draw: 0,
          total: distributionData.length,
        }

        distributionData.forEach((tip) => {
          if (tip.predicted_winner === "HOME") dist.home++
          else if (tip.predicted_winner === "AWAY") dist.away++
          else if (tip.predicted_winner === "DRAW") dist.draw++
        })

        setDistribution(dist)
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Unknown error") }
    }
  }

  const submitScoreTip = async (homeScore: number, awayScore: number) => {
    if (!matchId) return { error: new Error("No match ID") }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        return { error: new Error("Must be logged in to submit score tip") }
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        return { error: profileError }
      }

      if (!profile) {
        return { error: new Error("User profile not found") }
      }

      // Check if tip already exists
      const { data: existingTip } = await supabase
        .from("tips")
        .select("*")
        .eq("match_id", matchId)
        .eq("user_profile_id", profile.id)
        .maybeSingle()

      if (existingTip) {
        // Update existing tip (keep predicted_winner if it exists)
        const updateData: any = {
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }

        const { error: updateError } = await supabase
          .from("tips")
          .update(updateData)
          .eq("id", existingTip.id)

        if (updateError) throw updateError
      } else {
        // Create new tip (should have predicted_winner from previous step)
        const tipData: any = {
          match_id: matchId,
          user_profile_id: profile.id,
          predicted_home_score: homeScore,
          predicted_away_score: awayScore,
        }

        // If user has a winner tip, include it
        if (userTip?.predicted_winner) {
          tipData.predicted_winner = userTip.predicted_winner
        }

        const { error: insertError } = await supabase.from("tips").insert(tipData)

        if (insertError) throw insertError
      }

      // Immediately refetch user tip to update UI
      const { data: userTipData } = await supabase
        .from("tips")
        .select("*")
        .eq("match_id", matchId)
        .eq("user_profile_id", profile.id)
        .maybeSingle()

      setUserTip(userTipData || null)

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("Unknown error") }
    }
  }

  return {
    userTip,
    distribution,
    loading,
    error,
    submitWinnerTip,
    submitScoreTip,
  }
}
