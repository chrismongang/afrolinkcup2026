"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useTeam } from "@/hooks/useTeam"
import { useTeamScorers } from "@/hooks/useTeamScorers"
import { useTeamMatches } from "@/hooks/useTeamMatches"
import { useGroups } from "@/hooks/useGroups"
import { TeamDetailNav } from "@/components/features/navigation/TeamDetailNav"
import { TeamHeader } from "@/components/features/teams/TeamHeader"
import { PlayerCard } from "@/components/features/teams/PlayerCard"
import { GroupTableCardHighlighted } from "@/components/features/groups/GroupTableCardHighlighted"
import { TeamScorersSection } from "@/components/features/teams/TeamScorersSection"
import { MatchCard } from "@/components/features/matches/MatchCard"
import { NewsSection } from "@/components/features/news/NewsSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Player } from "@/types"

type Props = {
  params: { slug: string }
}

export default function TeamDetailPage({ params }: Props) {
  const { slug } = params
  const { team, loading: teamLoading, error: teamError } = useTeam(slug)
  const { scorers, loading: scorersLoading } = useTeamScorers(team?.id ?? null)
  const { matches, loading: matchesLoading } = useTeamMatches(team?.id ?? null)
  const { groupA, groupB } = useGroups()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (teamLoading) {
    return (
      <main className="min-h-screen bg-background">
        <TeamDetailNav teamSlug={slug} />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="h-64 bg-card animate-pulse rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (teamError || !team) {
    return (
      <main className="min-h-screen bg-background">
        <TeamDetailNav teamSlug={slug} />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Team nicht gefunden
              </p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  // Finde die richtige Gruppe
  const groupData = team.group === "A" ? groupA : groupB

  // Trenne Spieler, Teamhead und Staff
  const players = team.players.filter((player: Player) => player.role === "player")
  const teamhead = team.players.find((player: Player) => player.role === "teamhead")
  const staff = team.players.filter((player: Player) => player.role === "staff")

  // Sortiere Spieler nach Trikotnummer oder Name
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.jersey_number !== null && b.jersey_number !== null) {
      return a.jersey_number - b.jersey_number
    }
    if (a.jersey_number !== null) return -1
    if (b.jersey_number !== null) return 1
    return a.name.localeCompare(b.name)
  })

  const teamPhotoUrl = `/team-photos/${team.id}.jpg`

  return (
    <main className="min-h-screen bg-background">
      {/* Hero mit Hintergrundbild + Team Header */}
      <section className="relative overflow-hidden min-h-[340px]">
        {/* Hintergrundbild */}
        <div className="absolute inset-0">
          <Image
            src={teamPhotoUrl}
            alt={`${team.name} Teamfoto`}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Inhalt auf dem Hero */}
        <div className="relative z-10">
          {/* Navigation Bar im Hero */}
          <TeamDetailNav teamSlug={team.team_slug} />

          {/* Team Header auf dem Hintergrundbild */}
          <div className="container mx-auto px-6 pb-16 pt-8">
            <TeamHeader team={team} />
          </div>
        </div>
      </section>

      {/* Restliche Inhalte unterhalb des Heros */}
      <div className="container mx-auto px-4 pt-4 pb-8 space-y-8">
        {/* Teamhead Section */}
        {teamhead && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Teamhead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base font-medium text-foreground">
                  {teamhead.name}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Staff Section */}
        {staff.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {staff.map((member: Player) => (
                    <div key={member.id} className="text-base font-medium text-foreground">
                      {member.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Spieler Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Spieler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedPlayers.length > 0 ? (
                  sortedPlayers.map((player) => (
                    <PlayerCard key={player.id} player={player} team={team} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Noch keine Spieler hinzugefügt
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Gruppen-Tabelle Section */}
        {groupData && (
          <section>
            <GroupTableCardHighlighted
              groupData={groupData}
              highlightedTeamId={team.id}
            />
          </section>
        )}

        {/* Torschützen Section */}
        <section>
          <TeamScorersSection scorers={scorers} loading={scorersLoading} />
        </section>

        {/* Matches Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Spiele</CardTitle>
            </CardHeader>
            <CardContent>
              {matchesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine Spiele
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* News Section */}
        <NewsSection teamId={team.id} />
      </div>
    </main>
  )
}
