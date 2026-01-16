"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { LeaderboardCard } from "@/components/features/leaderboard/LeaderboardCard"
import { LeaderboardNav } from "@/components/features/navigation/LeaderboardNav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeaderboardPage() {
  const { entries, loading, error } = useLeaderboard()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[340px]">
        {/* Hintergrundbild */}
        <div className="absolute inset-0">
          <Image
            src="/images/match-hero.png"
            alt="Leaderboard Hintergrund"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Inhalt auf dem Hero */}
        <div className="relative z-10">
          {/* Navigation Bar im Hero */}
          <LeaderboardNav />

          {/* Header auf dem Hintergrundbild */}
          <div className="container mx-auto px-6 pb-16 pt-8">
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl font-bold mb-2 drop-shadow-lg">
                Leaderboard
              </h1>
              <p className="text-lg sm:text-xl text-white/90 drop-shadow mb-4">
                Die besten Tipp-Experten des Turniers
              </p>
              <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-sm sm:text-base text-white/90 drop-shadow">
                  <span className="font-semibold">Punktesystem:</span> Exaktes Ergebnis = 4 Punkte • 
                  Richtige Differenz/Tendenz oder Unentschieden = 3 Punkte • 
                  Richtige Tendenz = 2 Punkte
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restliche Inhalte unterhalb des Heros */}
      <div className="container mx-auto px-4 pt-4 pb-8 space-y-8">
        {loading ? (
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-card animate-pulse rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive text-lg">
                Fehler beim Laden: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Noch keine Teilnehmer im Leaderboard
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Rangliste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <LeaderboardCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
