"use client"

import { useTeams } from "@/hooks/useTeams"
import { TeamCard } from "@/components/features/teams/TeamCard"

export default function TeamsPage() {
  const { teams, loading, error } = useTeams()

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <h1 className="text-3xl font-bold text-foreground">Teams</h1>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-destructive text-lg">
              Fehler beim Laden der Teams: {error.message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Teams</h1>

        <div className="space-y-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </main>
  )
}
