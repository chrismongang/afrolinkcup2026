"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents"
import { ArenaMatchHeader } from "@/components/features/matches/ArenaMatchHeader"
import type { Match, Team } from "@/types"

type MatchWithTeams = Match & {
  team_home: Team | null
  team_away: Team | null
}

// Live-Status-Werte
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

export default function ArenaDisplayPage() {
  const { matches, loading, error } = useRealtimeMatches()
  const [showError, setShowError] = useState(false)
  
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
        // Fehler beim Vollbild ignorieren (z.B. wenn nicht erlaubt)
        console.log("Vollbild konnte nicht aktiviert werden:", error)
      }
    }

    enterFullscreen()
  }, [])

  // Zeige Fehler oder Timeout
  if (error || showError) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        {/* Hintergrundbild - unoptimiert für volle Qualität */}
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Fehler State */}
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
        {/* Hintergrundbild - unoptimiert für volle Qualität */}
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Loading State */}
        <div className="relative z-10 text-white text-4xl md:text-6xl">Lade...</div>
      </div>
    )
  }

  if (!displayMatch) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        {/* Hintergrundbild - unoptimiert für volle Qualität */}
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Kein Match verfügbar */}
        <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
          Kein Spiel verfügbar
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Hintergrundbild - unoptimiert für volle Qualität */}
      <div className="absolute inset-0">
        <img
          src="/sceen_bg.png"
          alt="Arena Hintergrund"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content-Bereich: Groß und zentriert für gute Lesbarkeit von den Tribünen */}
      <div className="relative z-10 w-full max-w-[95vw] h-full max-h-[95vh] flex items-center justify-center p-4 md:p-8">
        <div className="w-full h-full flex items-center justify-center">
          <ArenaMatchHeader match={displayMatch} events={events || []} />
        </div>
      </div>
    </div>
  )
}
