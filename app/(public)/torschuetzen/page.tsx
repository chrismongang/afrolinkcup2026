"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useAllScorers } from "@/hooks/useAllScorers"
import { ScorersNav } from "@/components/features/navigation/ScorersNav"
import { ScorerCard } from "@/components/features/scorers/ScorerCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ScorersPage() {
  const { scorers, loading, error } = useAllScorers()

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
            alt="Torschützen Hintergrund"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Inhalt auf dem Hero */}
        <div className="relative z-10">
          {/* Navigation Bar im Hero */}
          <ScorersNav />

          {/* Header auf dem Hintergrundbild */}
          <div className="container mx-auto px-6 pb-16 pt-8">
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl font-bold mb-2 drop-shadow-lg">
                Torschützen
              </h1>
              <p className="text-lg sm:text-xl text-white/90 drop-shadow">
                Die besten Torjäger des Turniers
              </p>
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
        ) : scorers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Noch keine Tore erzielt
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Torschützenliste</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scorers.map((scorer, index) => (
                  <ScorerCard key={scorer.player.id} scorer={scorer} rank={index + 1} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
