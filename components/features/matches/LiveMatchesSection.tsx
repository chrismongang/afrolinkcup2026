"use client"

import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { MatchCard } from "./MatchCard"

export function LiveMatchesSection() {
  const { matches, loading } = useRealtimeMatches({
    status: ["LIVE", "LIVE_FIRST_HALF", "HALF_TIME", "LIVE_SECOND_HALF", "EXTRA_TIME", "PENALTIES"],
  })

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Live-Spiel
        </h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    )
  }

  if (matches.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Live-Spiel
        </h2>
        <p className="text-muted-foreground text-center py-8">
          Aktuell läuft kein Spiel
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
        Live-Spiele
      </h2>
      <div className="space-y-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}

