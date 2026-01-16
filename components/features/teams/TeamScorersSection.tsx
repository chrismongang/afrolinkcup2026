"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Scorer } from "@/hooks/useTeamScorers"

interface TeamScorersSectionProps {
  scorers: Scorer[]
  loading: boolean
}

export function TeamScorersSection({ scorers, loading }: TeamScorersSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Torschützen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (scorers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Torschützen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Noch keine Tore erzielt
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Torschützen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {scorers.map((scorer, index) => (
            <div
              key={scorer.player.id}
              className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                {/* Platz */}
                <div className="w-8 text-center text-sm font-semibold text-muted-foreground">
                  {index + 1}.
                </div>

                {/* Spieler-Name */}
                <div className="text-base font-medium text-foreground">
                  {scorer.player.name}
                </div>
              </div>

              {/* Anzahl Tore */}
              <div className="text-lg font-bold text-foreground">
                {scorer.goals} {scorer.goals === 1 ? "Tor" : "Tore"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
