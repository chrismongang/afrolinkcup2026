"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Team, Match } from "@/types"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { calculateGroupTable, type GroupTableEntry } from "@/lib/utils/groups"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

export type GroupData = {
  group: "A" | "B"
  teams: Team[]
  matches: MatchWithTeams[]
  table: GroupTableEntry[]
  liveMatchIds: string[] // IDs der Matches, die gerade laufen
}

export function useGroups() {
  const [groupA, setGroupA] = useState<GroupData | null>(null)
  const [groupB, setGroupB] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true)
        setError(null)

        // Lade Teams
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true })

        if (teamsError) throw teamsError

        // Lade alle Gruppenspiele
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
            *,
            team_home:teams!matches_team_home_id_fkey(*),
            team_away:teams!matches_team_away_id_fkey(*)
          `)
          .eq("stage", "GROUP")
          .order("start_time", { ascending: true })

        if (matchesError) throw matchesError

        const matches = (matchesData as MatchWithTeams[]) || []
        const teams = (teamsData as Team[]) || []

        // Trenne nach Gruppen
        const teamsA = teams.filter((t) => t.group === "A")
        const teamsB = teams.filter((t) => t.group === "B")
        const matchesA = matches.filter((m) => m.group === "A")
        const matchesB = matches.filter((m) => m.group === "B")

        // Finde laufende Matches
        const liveStatuses: Match["status"][] = [
          "LIVE",
          "LIVE_FIRST_HALF",
          "HALF_TIME",
          "LIVE_SECOND_HALF",
          "EXTRA_TIME",
          "PENALTIES",
        ]

        const liveMatchIdsA = matchesA
          .filter((m) => liveStatuses.includes(m.status))
          .map((m) => m.id)
        const liveMatchIdsB = matchesB
          .filter((m) => liveStatuses.includes(m.status))
          .map((m) => m.id)

        // Berechne Tabellen
        const tableA = calculateGroupTable(teamsA, matchesA)
        const tableB = calculateGroupTable(teamsB, matchesB)

        setGroupA({
          group: "A",
          teams: teamsA,
          matches: matchesA,
          table: tableA,
          liveMatchIds: liveMatchIdsA,
        })

        setGroupB({
          group: "B",
          teams: teamsB,
          matches: matchesB,
          table: tableB,
          liveMatchIds: liveMatchIdsB,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"))
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()

    // Realtime Subscription für Matches
    const channel: RealtimeChannel = supabase
      .channel("groups:realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
        },
        async () => {
          // Refetch wenn Matches aktualisiert werden
          const { data: matchesData, error: matchesError } = await supabase
            .from("matches")
            .select(`
              *,
              team_home:teams!matches_team_home_id_fkey(*),
              team_away:teams!matches_team_away_id_fkey(*)
            `)
            .eq("stage", "GROUP")
            .order("start_time", { ascending: true })

          if (!matchesError && matchesData) {
            const matches = matchesData as MatchWithTeams[]
            const { data: teamsData } = await supabase
              .from("teams")
              .select("*")
              .order("name", { ascending: true })

            if (teamsData) {
              const teams = teamsData as Team[]
              const teamsA = teams.filter((t) => t.group === "A")
              const teamsB = teams.filter((t) => t.group === "B")
              const matchesA = matches.filter((m) => m.group === "A")
              const matchesB = matches.filter((m) => m.group === "B")

              const liveStatuses: Match["status"][] = [
                "LIVE",
                "LIVE_FIRST_HALF",
                "HALF_TIME",
                "LIVE_SECOND_HALF",
                "EXTRA_TIME",
                "PENALTIES",
              ]

              const liveMatchIdsA = matchesA
                .filter((m) => liveStatuses.includes(m.status))
                .map((m) => m.id)
              const liveMatchIdsB = matchesB
                .filter((m) => liveStatuses.includes(m.status))
                .map((m) => m.id)

              const tableA = calculateGroupTable(teamsA, matchesA)
              const tableB = calculateGroupTable(teamsB, matchesB)

              setGroupA({
                group: "A",
                teams: teamsA,
                matches: matchesA,
                table: tableA,
                liveMatchIds: liveMatchIdsA,
              })

              setGroupB({
                group: "B",
                teams: teamsB,
                matches: matchesB,
                table: tableB,
                liveMatchIds: liveMatchIdsB,
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return { groupA, groupB, loading, error }
}
