"use client"

import { useEffect, useState, useMemo } from "react"
import { useGroups } from "@/hooks/useGroups"
import { ArenaGroupTableCard } from "@/components/features/groups/ArenaGroupTableCard"

export default function ArenaTabellePage() {
  const { groupA, groupB, loading, error } = useGroups()
  const [showError, setShowError] = useState(false)
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)

  // Bestimme welche Gruppen verfügbar sind
  const availableGroups = useMemo(() => {
    const groups = []
    if (groupA) groups.push(groupA)
    if (groupB) groups.push(groupB)
    return groups
  }, [groupA, groupB])

  // Wechsle alle 45 Sekunden zwischen den Gruppen
  useEffect(() => {
    if (availableGroups.length <= 1) return

    const interval = setInterval(() => {
      setCurrentGroupIndex((prev) => (prev + 1) % availableGroups.length)
    }, 45000) // 45 Sekunden

    return () => clearInterval(interval)
  }, [availableGroups])

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

  // Zeige aktuelle Gruppe oder Fallback
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
        {/* Keine Gruppe verfügbar */}
        <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
          Keine Tabelle verfügbar
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
