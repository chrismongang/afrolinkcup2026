"use client"

import { useEffect, useState, useMemo } from "react"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { ArenaLeaderboardCard } from "@/components/features/leaderboard/ArenaLeaderboardCard"
import Image from "next/image"

export default function ArenaLeaderboardPage() {
  const { entries, loading, error } = useLeaderboard()
  const [showError, setShowError] = useState(false)

  // Top 3 Tipper
  const topThree = useMemo(() => {
    return entries.slice(0, 3)
  }, [entries])

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

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Hintergrundbild - unoptimiert für volle Qualität */}
      <div className="absolute inset-0">
        <img
          src="/sceen_bg.png"
          alt="Arena Hintergrund"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content-Bereich */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-8">
        {/* Titel "TOP TIPPER" */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center">
            TOP TIPPER
          </h1>
        </div>

        {/* Zwei Sections: 50/50 */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 h-full">
          {/* Linke Section: User-Karten */}
          <div className="flex-1 flex flex-col gap-4 md:gap-6 lg:gap-8 justify-center">
            {topThree.length > 0 ? (
              topThree.map((entry) => (
                <ArenaLeaderboardCard key={entry.id} entry={entry} rank={entry.rank} />
              ))
            ) : (
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl text-white">
                  Noch keine Mitspieler - Scanne den QR Code um mitzutippen
                </p>
              </div>
            )}
          </div>

          {/* Rechte Section: QR-Code */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <Image
                  src="/images/afrolinkcup.live_qr-code.png"
                  alt="QR Code"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xl md:text-2xl lg:text-3xl text-white text-center">
                Scanne um mitzutippen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
