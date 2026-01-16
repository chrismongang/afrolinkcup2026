"use client"

import { useEffect, useState, useMemo } from "react"
import { useAllScorers } from "@/hooks/useAllScorers"
import { useGroups } from "@/hooks/useGroups"
import { ArenaScorerCard } from "@/components/features/scorers/ArenaScorerCard"
import { ArenaGroupTableCard } from "@/components/features/groups/ArenaGroupTableCard"

export default function ArenaTorschuetzenPage() {
  const { scorers, loading: scorersLoading, error: scorersError } = useAllScorers()
  const { groupA, groupB, loading: groupsLoading, error: groupsError } = useGroups()
  const [showError, setShowError] = useState(false)
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)

  // Top 3 Torschützen
  const topScorers = useMemo(() => {
    return scorers.slice(0, 3)
  }, [scorers])

  // Bestimme welche Gruppen verfügbar sind (für Fallback)
  const availableGroups = useMemo(() => {
    const groups = []
    if (groupA) groups.push(groupA)
    if (groupB) groups.push(groupB)
    return groups
  }, [groupA, groupB])

  // Wechsle alle 45 Sekunden zwischen den Gruppen (nur wenn Tabellen angezeigt werden)
  useEffect(() => {
    if (topScorers.length > 0 || availableGroups.length <= 1) return

    const interval = setInterval(() => {
      setCurrentGroupIndex((prev) => (prev + 1) % availableGroups.length)
    }, 45000) // 45 Sekunden

    return () => clearInterval(interval)
  }, [topScorers.length, availableGroups.length])

  const loading = scorersLoading || groupsLoading
  const error = scorersError || groupsError

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

  // Fallback: Wenn keine Torschützen vorhanden, zeige Tabellen
  if (topScorers.length === 0) {
    const currentGroup = availableGroups[currentGroupIndex] || availableGroups[0]

    if (!currentGroup) {
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
          {/* Keine Daten verfügbar */}
          <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
            Keine Daten verfügbar
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
        <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8">
          <div className="w-full h-full flex items-center justify-center">
            <ArenaGroupTableCard groupData={currentGroup} />
          </div>
        </div>
      </div>
    )
  }

  // Zeige Torschützen mit Podest-Design
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
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="w-full flex items-end justify-center gap-6 md:gap-10 lg:gap-12">
          {/* Platz 2 (links) */}
          {topScorers[1] && (
            <ArenaScorerCard scorer={topScorers[1]} rank={2} />
          )}

          {/* Platz 1 (Mitte, größer) */}
          {topScorers[0] && (
            <ArenaScorerCard scorer={topScorers[0]} rank={1} />
          )}

          {/* Platz 3 (rechts) */}
          {topScorers[2] && (
            <ArenaScorerCard scorer={topScorers[2]} rank={3} />
          )}
        </div>
      </div>
    </div>
  )
}
