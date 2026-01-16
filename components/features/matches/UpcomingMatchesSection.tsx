"use client"

import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { MatchCard } from "./MatchCard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export function UpcomingMatchesSection() {
  const { matches, loading } = useRealtimeMatches({
    status: ["SCHEDULED"],
    limit: 4,
  })

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Nächste Spiele</h2>
        <div>
          {[1, 2, 3, 4].map((i, index) => (
            <div key={i} className={index < 3 ? "mb-4" : ""}>
              <div className="h-32 bg-card animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (matches.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Nächste Spiele</h2>
        <p className="text-muted-foreground text-center py-8">
          Keine geplanten Spiele
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Nächste Spiele</h2>
      <div>
        {matches.slice(0, 4).map((match, index) => (
          <div key={match.id} className={index < matches.length - 1 ? "mb-4" : ""}>
            <MatchCard match={match} />
          </div>
        ))}
      </div>
      <div className="pt-2">
        <Link href="/matches">
          <Button 
            variant="default" 
            size="sm" 
            className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
          >
            Alle anzeigen
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

