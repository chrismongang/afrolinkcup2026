"use client"

import { useEffect, useState } from "react"
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

interface ArenaMatchHeaderProps {
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

export function ArenaMatchHeader({ match, events = [], currentMinute }: ArenaMatchHeaderProps) {
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
    <div className="space-y-8 md:space-y-12 text-white w-full">
      {/* Top Row: Phase und Status in einer Karte */}
      <div className="flex items-center justify-center">
        {isLive && displayMinute !== null ? (
          <div className="bg-primary text-primary-foreground px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl flex items-center gap-4 md:gap-6 shadow-lg">
            <span className="relative flex h-4 w-4 md:h-6 md:w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 md:h-6 md:w-6 bg-primary-foreground"></span>
            </span>
            <span className="text-2xl md:text-4xl lg:text-5xl font-bold">{displayMinute}'</span>
            <span className="text-xl md:text-3xl lg:text-4xl font-medium">•</span>
            <span className="text-xl md:text-3xl lg:text-4xl font-medium">{phaseLabel}</span>
          </div>
        ) : (
          <div className="border-2 border-white/20 bg-black/40 backdrop-blur px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl flex items-center gap-4 md:gap-6">
            <span className="text-2xl md:text-4xl lg:text-5xl font-bold">
              {statusLabels[match.status]}
            </span>
            <span className="text-xl md:text-3xl lg:text-4xl font-medium">•</span>
            <span className="text-xl md:text-3xl lg:text-4xl font-medium">{phaseLabel}</span>
          </div>
        )}
      </div>

      {/* Teams & Score - Nebeneinander */}
      <div className="flex items-center justify-between mt-8 md:mt-12">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center">
          {match.team_home ? (
            <>
              <div className="text-[10rem] md:text-[14rem] lg:text-[18rem] xl:text-[22rem] mb-6 md:mb-8 drop-shadow-2xl leading-none">
                {match.team_home.flag_emoji}
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase">
                  {match.team_home.name}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase text-white/80">
                {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '1. Gruppe A' :
                 match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '1. Gruppe B' :
                 match.stage === 'FINAL' ? 'Sieger HF1' : 'TBD'}
              </div>
            </div>
          )}
        </div>

        {/* Score oder Uhrzeit */}
        {showScore && match.team_home && match.team_away ? (
          <div className="px-8 md:px-12 lg:px-16">
            <div className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tight drop-shadow-2xl">
              {match.score_home} - {match.score_away}
            </div>
          </div>
        ) : isScheduled ? (
          <div className="px-8 md:px-12 lg:px-16">
            <div className="text-5xl md:text-7xl lg:text-8xl font-bold drop-shadow-2xl">
              {formatTime(startTime)}
            </div>
          </div>
        ) : null}

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center">
          {match.team_away ? (
            <>
              <div className="text-[10rem] md:text-[14rem] lg:text-[18rem] xl:text-[22rem] mb-6 md:mb-8 drop-shadow-2xl leading-none">
                {match.team_away.flag_emoji}
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase">
                  {match.team_away.name}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase text-white/80">
                {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '2. Gruppe B' :
                 match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '2. Gruppe A' :
                 match.stage === 'FINAL' ? 'Sieger HF2' : 'TBD'}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Penalties */}
      {match.score_home_penalties !== null && match.score_away_penalties !== null && (
        <div className="text-center text-xl md:text-3xl lg:text-4xl text-white/70 mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-white/20">
          Elfmeterschießen: {match.score_home_penalties}:{match.score_away_penalties}
        </div>
      )}
    </div>
  )
}
