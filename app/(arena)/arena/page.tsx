"use client"

import { useEffect, useMemo, useState } from "react"
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents"
import { ArenaMatchHeader } from "@/components/features/matches/ArenaMatchHeader"
import type { Match } from "@/types"

// Live-Status-Werte
const liveStatuses: Match["status"][] = [
  "LIVE",
  "LIVE_FIRST_HALF",
  "HALF_TIME",
  "LIVE_SECOND_HALF",
  "EXTRA_TIME",
  "PENALTIES",
]

export default function ArenaDisplayPage() {
  const { matches, loading, error } = useRealtimeMatches()
  const [showError, setShowError] = useState(false)

  // Finde das anzuzeigende Match: Live-Match priorisieren, sonst nächstes geplantes
  const displayMatch = useMemo(() => {
    if (!matches || matches.length === 0) return null

    // Suche nach Live-Matches
    const liveMatches = matches.filter((m) => liveStatuses.includes(m.status))
    if (liveMatches.length > 0) {
      // Sortiere nach start_time (ältestes Live-Match zuerst)
      return liveMatches.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )[0]
    }

    // Suche nach nächstem geplanten Match
    const scheduledMatches = matches
      .filter((m) => m.status === "SCHEDULED")
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return scheduledMatches.length > 0 ? scheduledMatches[0] : null
  }, [matches])

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
