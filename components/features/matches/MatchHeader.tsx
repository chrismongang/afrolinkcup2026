"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatTime, calculateLiveMinute } from "@/lib/utils/format"
import type { Match, Team, MatchEvent, Player } from "@/types"

type MatchWithTeams = Match & {
  team_home: Team | null
  team_away: Team | null
}

type MatchEventWithDetails = MatchEvent & {
  player?: Player | null
  team: Team
}

interface MatchHeaderProps {
  match: MatchWithTeams
  events?: MatchEventWithDetails[]
  currentMinute?: number
}

const statusLabels: Record<Match["status"], string> = {
  SCHEDULED: "Geplant",
  LIVE: "LIVE",
  LIVE_FIRST_HALF: "1. Halbzeit",
  HALF_TIME: "Halbzeit",
  LIVE_SECOND_HALF: "2. Halbzeit",
  EXTRA_TIME: "Verlängerung",
  PENALTIES: "Elfmeterschießen",
  FINISHED: "Beendet",
}

const stageLabels: Record<Match["stage"], string> = {
  GROUP: "Gruppenphase",
  SEMIFINAL: "Halbfinale",
  FINAL: "Finale",
}

export function MatchHeader({ match, events = [], currentMinute }: MatchHeaderProps) {
  const [liveMinute, setLiveMinute] = useState<number | null>(null)

  const isLive =
    match.status === "LIVE" ||
    match.status === "LIVE_FIRST_HALF" ||
    match.status === "LIVE_SECOND_HALF" ||
    match.status === "EXTRA_TIME" ||
    match.status === "PENALTIES"

  const isFinished = match.status === "FINISHED"
  const isScheduled = match.status === "SCHEDULED"
  const showScore = isFinished || isLive

  const startTime = new Date(match.start_time)
  const phaseLabel = match.group
    ? `${stageLabels[match.stage]} - Gruppe ${match.group}`
    : stageLabels[match.stage]

  // Extract goals for each team
  // Note: OWN_GOAL counts for the opposing team
  const homeGoals = match.team_home ? events
    .filter((e) => {
      if (e.type === "GOAL") {
        return e.team_id === match.team_home!.id
      }
      if (e.type === "OWN_GOAL") {
        return match.team_away && e.team_id === match.team_away.id // Own goal by away team counts for home
      }
      return false
    })
    .sort((a, b) => a.minute - b.minute) : []

  const awayGoals = match.team_away ? events
    .filter((e) => {
      if (e.type === "GOAL") {
        return e.team_id === match.team_away!.id
      }
      if (e.type === "OWN_GOAL") {
        return match.team_home && e.team_id === match.team_home.id // Own goal by home team counts for away
      }
      return false
    })
    .sort((a, b) => a.minute - b.minute) : []

  // Calculate live minute automatically when match is live
  useEffect(() => {
    if (isLive) {
      const calculateMinute = () => {
        const minute = calculateLiveMinute(
          match.start_time,
          match.status,
          (match as any).actual_start_time
        )
        setLiveMinute(minute)
      }

      // Calculate immediately
      calculateMinute()

      // Update every second
      const interval = setInterval(calculateMinute, 1000)
      return () => clearInterval(interval)
    } else {
      setLiveMinute(null)
    }
  }, [isLive, match.start_time, match.status, (match as any).actual_start_time])

  // Use provided currentMinute, calculated liveMinute, or fallback to latest event
  const latestEvent = events.length > 0 ? events[events.length - 1] : null
  const displayMinute = currentMinute ?? liveMinute ?? (latestEvent?.minute ?? null)

  return (
    <div className="space-y-6 text-white">
      {/* Top Row: Phase (links) und Status (rechts) */}
      <div className="flex items-center justify-between">
        {/* Phase - Links */}
        <div className="text-xs sm:text-sm text-white">
          {phaseLabel}
        </div>

        {/* Status/Live Minute - Rechts */}
        {isLive && displayMinute !== null ? (
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold">{displayMinute}'</span>
          </div>
        ) : (
          <div className="border border-white/20 bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg">
            <span className="text-xs sm:text-sm font-semibold">
              {statusLabels[match.status]}
            </span>
          </div>
        )}
      </div>

      {/* Teams & Score - Nebeneinander */}
      <div className="flex items-center justify-between mt-4">
        {/* Home Team */}
        {match.team_home ? (
          <Link
            href={`/teams/${match.team_home.team_slug}`}
            className="flex-1 flex flex-col items-center hover:opacity-90 transition-opacity"
          >
            <div className="text-5xl mb-2 drop-shadow-lg">{match.team_home.flag_emoji}</div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold">
                {match.team_home.name}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-white/80 italic">
                {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '1. Gruppe A' :
                 match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '1. Gruppe B' :
                 match.stage === 'FINAL' ? 'Sieger HF1' : 'TBD'}
              </div>
            </div>
          </div>
        )}

        {/* Score oder Uhrzeit */}
        {showScore && match.team_home && match.team_away ? (
          <div className="px-4 sm:px-8">
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-xl">
              {match.score_home} - {match.score_away}
            </div>
          </div>
        ) : isScheduled ? (
          <div className="px-4 sm:px-8">
            <div className="text-3xl font-semibold drop-shadow-xl">
              {formatTime(startTime)}
            </div>
          </div>
        ) : null}

        {/* Away Team */}
        {match.team_away ? (
          <Link
            href={`/teams/${match.team_away.team_slug}`}
            className="flex-1 flex flex-col items-center hover:opacity-90 transition-opacity"
          >
            <div className="text-5xl mb-2 drop-shadow-lg">{match.team_away.flag_emoji}</div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold">
                {match.team_away.name}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-white/80 italic">
                {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '2. Gruppe B' :
                 match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '2. Gruppe A' :
                 match.stage === 'FINAL' ? 'Sieger HF2' : 'TBD'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dünne Linie */}
      {showScore && (
        <>
          <div className="border-t border-white/20 my-4"></div>

          {/* Goals List */}
          <div className="flex items-start justify-between text-sm">
            {/* Home Goals */}
            <div className="flex-1">
              {homeGoals.length > 0 ? (
                <div className="space-y-1">
                  {homeGoals.map((goal) => (
                    <div key={goal.id} className="text-sm">
                      {goal.type === "OWN_GOAL" ? "Eigentor" : goal.player?.name || "Unbekannt"} {goal.minute}'
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/60">-</div>
              )}
            </div>

            {/* Center Icon */}
            <div className="px-4">
              <span className="text-lg">⚽</span>
            </div>

            {/* Away Goals */}
            <div className="flex-1 text-right">
              {awayGoals.length > 0 ? (
                <div className="space-y-1">
                  {awayGoals.map((goal) => (
                    <div key={goal.id} className="text-sm">
                      {goal.type === "OWN_GOAL" ? "Eigentor" : goal.player?.name || "Unbekannt"} {goal.minute}'
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-white/60">-</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Penalties */}
      {match.score_home_penalties !== null && match.score_away_penalties !== null && (
        <div className="text-center text-xs sm:text-sm text-white/70 mt-4 pt-4 border-t border-white/20">
          Elfmeterschießen: {match.score_home_penalties}:{match.score_away_penalties}
        </div>
      )}
    </div>
  )
}
