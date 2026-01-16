"use client"

import Link from "next/link"
import { useLeaderboard } from "@/hooks/useLeaderboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LeaderboardCard } from "./LeaderboardCard"

export function TopLeaderboardSection() {
  const { entries, loading } = useLeaderboard()

  // Nur Top 3 anzeigen
  const topThree = entries.slice(0, 3)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Top Tipper</CardTitle>
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
        <CardTitle className="text-foreground">Top Tipper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          {topThree.map((entry) => (
            <LeaderboardCard key={entry.id} entry={entry} />
          ))}
        </div>
        <Link href="/leaderboard" className="block">
          <Button variant="outline" className="w-full">
            Alle Tipper anzeigen
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
