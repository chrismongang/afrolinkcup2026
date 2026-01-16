"use client"

import Link from "next/link"
import { useAllScorers } from "@/hooks/useAllScorers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScorerCard } from "./ScorerCard"

export function TopScorersSection() {
  const { scorers, loading } = useAllScorers()

  // Nur Top 3 anzeigen
  const topThree = scorers.slice(0, 3)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Top Torschützen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (topThree.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Top Torschützen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {topThree.map((scorer, index) => (
            <ScorerCard key={scorer.player.id} scorer={scorer} rank={index + 1} />
          ))}
        </div>
        <Link href="/torschuetzen" className="block">
          <Button variant="outline" className="w-full">
            Alle Torschützen anzeigen
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
