"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Dynamische Imports für flüssige Übergänge
const MatchView = dynamic(() => import("../page"), { ssr: false })
const TabelleView = dynamic(() => import("../tabelle/page"), { ssr: false })
const TorschuetzenView = dynamic(() => import("../torschuetzen/page"), { ssr: false })
const NewsView = dynamic(() => import("../news/page"), { ssr: false })
const LeaderboardView = dynamic(() => import("../leaderboard/page"), { ssr: false })
const TickerView = dynamic(() => import("../ticker/page"), { ssr: false })
const QRCodeView = dynamic(() => import("../qr-code/page"), { ssr: false })

export default function ArenaScreen2Page() {
  const [currentView, setCurrentView] = useState<string>("match")
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Lade Konfiguration aus der Datenbank
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/admin/arena-screens")
        const data = await response.json()

        if (response.ok && data.data?.screen2) {
          const newView = data.data.screen2
          if (newView !== currentView) {
            setIsTransitioning(true)
            setTimeout(() => {
              setCurrentView(newView)
              setIsTransitioning(false)
            }, 300)
          }
        }
      } catch (err) {
        console.error("Error loading screen config:", err)
      }
    }

    // Initial load
    loadConfig()

    // Polling alle 2 Sekunden für Updates
    const pollInterval = setInterval(loadConfig, 2000)

    return () => clearInterval(pollInterval)
  }, [currentView])

  // Render die entsprechende Ansicht
  const renderView = () => {
    switch (currentView) {
      case "match":
        return <MatchView />
      case "tabelle":
        return <TabelleView />
      case "torschuetzen":
        return <TorschuetzenView />
      case "news":
        return <NewsView />
      case "leaderboard":
        return <LeaderboardView />
      case "ticker":
        return <TickerView />
      case "qr-code":
        return <QRCodeView />
      default:
        return <MatchView />
    }
  }

  return (
    <div className={isTransitioning ? "opacity-50 transition-opacity duration-300" : "transition-opacity duration-300"}>
      {renderView()}
    </div>
  )
}
