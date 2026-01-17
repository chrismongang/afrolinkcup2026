"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents"
import { formatTime, calculateLiveMinute } from "@/lib/utils/format"
import type { Match, MatchEvent, Player, Team } from "@/types"

type MatchWithTeams = Match & {
  team_home: Team | null
  team_away: Team | null
}

const liveStatuses: Match["status"][] = [
  "LIVE",
  "LIVE_FIRST_HALF",
  "HALF_TIME",
  "LIVE_SECOND_HALF",
  "EXTRA_TIME",
  "PENALTIES",
]

// Zeit in Millisekunden, wie lange ein beendetes Match noch angezeigt wird (5 Minuten)
const FINISHED_MATCH_DISPLAY_DURATION = 5 * 60 * 1000 // 5 Minuten

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

type MatchEventWithDetails = MatchEvent & {
  player?: Player | null
  team: Team
}

export default function ArenaTickerPage() {
  const { matches, loading, error } = useRealtimeMatches()
  const [showError, setShowError] = useState(false)
  const [liveMinute, setLiveMinute] = useState<number | null>(null)
  
  // State für das aktuell angezeigte Match und wann es beendet wurde
  const [currentDisplayMatch, setCurrentDisplayMatch] = useState<MatchWithTeams | null>(null)
  const [matchFinishedAt, setMatchFinishedAt] = useState<number | null>(null)
  const previousMatchIdRef = useRef<string | null>(null)

  // Finde das beste Match zum Anzeigen
  const bestMatch = useMemo(() => {
    if (!matches || matches.length === 0) return null

    // Priorität 1: Live-Matches
    const liveMatches = matches.filter((m) => liveStatuses.includes(m.status))
    if (liveMatches.length > 0) {
      return liveMatches.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )[0]
    }

    // Priorität 2: Nächstes geplantes Match
    const scheduledMatches = matches
      .filter((m) => m.status === "SCHEDULED")
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return scheduledMatches.length > 0 ? scheduledMatches[0] : null
  }, [matches])

  // Logik: Wann soll zum nächsten Match gewechselt werden?
  useEffect(() => {
    if (!bestMatch) return

    // Wenn ein neues Live-Match startet, wechsle sofort (auch wenn aktuell ein beendetes Match angezeigt wird)
    if (liveStatuses.includes(bestMatch.status)) {
      // Nur wechseln, wenn es ein anderes Match ist oder das aktuelle Match nicht live ist
      if (!currentDisplayMatch || currentDisplayMatch.id !== bestMatch.id || !liveStatuses.includes(currentDisplayMatch.status)) {
        setCurrentDisplayMatch(bestMatch)
        setMatchFinishedAt(null)
        previousMatchIdRef.current = bestMatch.id
        return
      }
    }

    // Wenn das aktuelle Match beendet wurde
    if (currentDisplayMatch?.status === "FINISHED") {
      // Prüfe, ob es ein neues Live-Match gibt (anderes Match)
      if (liveStatuses.includes(bestMatch.status) && bestMatch.id !== currentDisplayMatch.id) {
        // Neues Live-Match -> sofort wechseln
        setCurrentDisplayMatch(bestMatch)
        setMatchFinishedAt(null)
        previousMatchIdRef.current = bestMatch.id
        return
      }

      // Kein neues Live-Match -> prüfe, ob die Anzeigezeit abgelaufen ist
      if (matchFinishedAt) {
        const timeSinceFinished = Date.now() - matchFinishedAt
        if (timeSinceFinished >= FINISHED_MATCH_DISPLAY_DURATION) {
          // Zeit abgelaufen -> wechsle nur wenn es ein anderes Match ist
          if (bestMatch.id !== currentDisplayMatch.id) {
            setCurrentDisplayMatch(bestMatch)
            setMatchFinishedAt(bestMatch.status === "FINISHED" ? Date.now() : null)
            previousMatchIdRef.current = bestMatch.id
            return
          }
        }
      }
      // Zeit noch nicht abgelaufen oder kein anderes Match -> behalte das beendete Match
      // Aber update es für Score-Updates
      if (currentDisplayMatch.id === bestMatch.id) {
        setCurrentDisplayMatch(bestMatch)
      }
      return
    }

    // Wenn das Match gerade beendet wurde (Status-Wechsel zu FINISHED)
    if (
      currentDisplayMatch &&
      currentDisplayMatch.id === bestMatch.id &&
      currentDisplayMatch.status !== "FINISHED" &&
      bestMatch.status === "FINISHED"
    ) {
      // Match wurde gerade beendet -> speichere Zeitpunkt
      setMatchFinishedAt(Date.now())
      setCurrentDisplayMatch(bestMatch)
      previousMatchIdRef.current = bestMatch.id
      return
    }

    // Wenn das Match-ID sich geändert hat (neues Match)
    if (currentDisplayMatch?.id !== bestMatch.id) {
      setCurrentDisplayMatch(bestMatch)
      setMatchFinishedAt(bestMatch.status === "FINISHED" ? Date.now() : null)
      previousMatchIdRef.current = bestMatch.id
      return
    }

    // Update das aktuelle Match (für Score-Updates etc.)
    if (currentDisplayMatch && currentDisplayMatch.id === bestMatch.id) {
      setCurrentDisplayMatch(bestMatch)
    }
  }, [bestMatch, currentDisplayMatch, matchFinishedAt])

  // Initial: Setze das erste Match
  useEffect(() => {
    if (!currentDisplayMatch && bestMatch) {
      setCurrentDisplayMatch(bestMatch)
      setMatchFinishedAt(bestMatch.status === "FINISHED" ? Date.now() : null)
      previousMatchIdRef.current = bestMatch.id
    }
  }, [bestMatch, currentDisplayMatch])

  // Prüfe regelmäßig, ob die Anzeigezeit für beendete Matches abgelaufen ist
  useEffect(() => {
    if (!matchFinishedAt || !currentDisplayMatch || currentDisplayMatch.status !== "FINISHED") {
      return
    }

    const checkInterval = setInterval(() => {
      const timeSinceFinished = Date.now() - matchFinishedAt
      if (timeSinceFinished >= FINISHED_MATCH_DISPLAY_DURATION && bestMatch) {
        // Zeit abgelaufen -> wechsle nur wenn es ein anderes Match ist
        if (bestMatch.id !== currentDisplayMatch.id) {
          setCurrentDisplayMatch(bestMatch)
          setMatchFinishedAt(bestMatch.status === "FINISHED" ? Date.now() : null)
          previousMatchIdRef.current = bestMatch.id
        }
      }
    }, 1000) // Prüfe jede Sekunde

    return () => clearInterval(checkInterval)
  }, [matchFinishedAt, currentDisplayMatch, bestMatch])

  const displayMatch = currentDisplayMatch
  const { events } = useRealtimeEvents(displayMatch?.id || null)

  // Filtere nur Tore (GOAL und OWN_GOAL)
  const goalEvents = useMemo(() => {
    if (!events) return []
    return events
      .filter((e) => e.type === "GOAL" || e.type === "OWN_GOAL")
      .sort((a, b) => {
        if (a.minute !== b.minute) return a.minute - b.minute
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeA - timeB
      })
  }, [events])

  const isLive =
    displayMatch &&
    (displayMatch.status === "LIVE" ||
      displayMatch.status === "LIVE_FIRST_HALF" ||
      displayMatch.status === "LIVE_SECOND_HALF" ||
      displayMatch.status === "EXTRA_TIME" ||
      displayMatch.status === "PENALTIES")

  // Calculate live minute
  useEffect(() => {
    if (isLive && displayMatch) {
      const calculateMinute = () => {
        const minute = calculateLiveMinute(
          displayMatch.start_time || new Date().toISOString(),
          displayMatch.status,
          (displayMatch as any).actual_start_time || null
        )
        setLiveMinute(minute)
      }

      calculateMinute()
      const interval = setInterval(calculateMinute, 1000)
      return () => clearInterval(interval)
    } else {
      setLiveMinute(null)
    }
  }, [isLive, displayMatch])

  // Zeige Fehler nach 10 Sekunden Loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowError(true)
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      setShowError(false)
    }
  }, [loading])

  // Automatisch Vollbild beim Laden
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        console.log("Vollbild konnte nicht aktiviert werden:", error)
      }
    }
    enterFullscreen()
  }, [])

  if (error || showError) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
          <p className="mb-8">
            {showError
              ? "Verbindung zu langsam. Bitte Seite neu laden."
              : "Fehler beim Laden der Daten."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-2xl md:text-3xl font-semibold"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-white text-4xl md:text-6xl">Lade...</div>
      </div>
    )
  }

  if (!displayMatch) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
          Kein Spiel verfügbar
        </div>
      </div>
    )
  }

  const isFinished = displayMatch.status === "FINISHED"
  const isScheduled = displayMatch.status === "SCHEDULED"
  const showScore = isFinished || isLive
  const startTime = displayMatch.start_time ? new Date(displayMatch.start_time) : new Date()
  const phaseLabel = displayMatch.group
    ? `${stageLabels[displayMatch.stage]} - Gruppe ${displayMatch.group}`
    : stageLabels[displayMatch.stage]

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Hintergrundbild */}
      <div className="absolute inset-0">
        <img
          src="/sceen_bg.png"
          alt="Arena Hintergrund"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-4 md:p-8">
        {/* Match Header - Kompakt */}
        <div className="flex-shrink-0 mb-6 md:mb-8">
          {/* Status und Phase */}
          <div className="flex items-center justify-center mb-4 md:mb-6">
            {isLive && liveMinute !== null ? (
              <div className="bg-primary text-primary-foreground px-6 py-3 md:px-8 md:py-4 rounded-xl flex items-center gap-3 md:gap-4 shadow-lg">
                <span className="relative flex h-3 w-3 md:h-4 md:w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 md:h-4 md:w-4 bg-primary-foreground"></span>
                </span>
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">{liveMinute}'</span>
                <span className="text-lg md:text-xl lg:text-2xl font-medium">•</span>
                <span className="text-lg md:text-xl lg:text-2xl font-medium">{phaseLabel}</span>
              </div>
            ) : (
              <div className="border-2 border-white/20 bg-black/40 backdrop-blur px-6 py-3 md:px-8 md:py-4 rounded-xl flex items-center gap-3 md:gap-4">
                <span className="text-xl md:text-2xl lg:text-3xl font-bold">
                  {statusLabels[displayMatch.status]}
                </span>
                <span className="text-lg md:text-xl lg:text-2xl font-medium">•</span>
                <span className="text-lg md:text-xl lg:text-2xl font-medium">{phaseLabel}</span>
              </div>
            )}
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center">
              {displayMatch.team_home ? (
                <>
                  <div className="text-4xl md:text-6xl lg:text-7xl mb-2 md:mb-3">
                    {displayMatch.team_home.flag_emoji}
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl lg:text-3xl font-bold uppercase">
                      {displayMatch.team_home.name}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-lg md:text-2xl lg:text-3xl font-bold uppercase text-white/80">
                    {displayMatch.stage === 'SEMIFINAL' && (displayMatch as any).match_slug === 'halbfinale-1-2026-01-17' ? '1. Gruppe A' :
                     displayMatch.stage === 'SEMIFINAL' && (displayMatch as any).match_slug === 'halbfinale-2-2026-01-17' ? '1. Gruppe B' :
                     displayMatch.stage === 'FINAL' ? 'Sieger HF1' : 'TBD'}
                  </div>
                </div>
              )}
            </div>

            {/* Score */}
            {showScore && displayMatch.team_home && displayMatch.team_away ? (
              <div className="px-6 md:px-8 lg:px-12">
                <div className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  {displayMatch.score_home} - {displayMatch.score_away}
                </div>
              </div>
            ) : isScheduled ? (
              <div className="px-6 md:px-8 lg:px-12">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold">
                  {formatTime(startTime)}
                </div>
              </div>
            ) : null}

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center">
              {displayMatch.team_away ? (
                <>
                  <div className="text-4xl md:text-6xl lg:text-7xl mb-2 md:mb-3">
                    {displayMatch.team_away.flag_emoji}
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl lg:text-3xl font-bold uppercase">
                      {displayMatch.team_away.name}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="text-lg md:text-2xl lg:text-3xl font-bold uppercase text-white/80">
                    {displayMatch.stage === 'SEMIFINAL' && (displayMatch as any).match_slug === 'halbfinale-1-2026-01-17' ? '2. Gruppe B' :
                     displayMatch.stage === 'SEMIFINAL' && (displayMatch as any).match_slug === 'halbfinale-2-2026-01-17' ? '2. Gruppe A' :
                     displayMatch.stage === 'FINAL' ? 'Sieger HF2' : 'TBD'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Torschützen-Liste */}
        <div className="flex-1 overflow-hidden">
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 w-full h-full flex flex-col">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Torschützen
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4">
              {goalEvents.length === 0 ? (
                <div className="text-white/60 text-2xl md:text-3xl text-center py-8">
                  Noch keine Tore
                </div>
              ) : (
                goalEvents.map((event) => {
                  const isHomeTeam = displayMatch.team_home && event.team_id === displayMatch.team_home.id
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-white/10 rounded-xl"
                    >
                      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                        {event.minute}'
                      </div>
                      <div className="text-2xl md:text-3xl lg:text-4xl">
                        {event.team.flag_emoji}
                      </div>
                      <div className="flex-1 text-xl md:text-2xl lg:text-3xl font-semibold text-white">
                        {event.player?.name || "Unbekannt"}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
