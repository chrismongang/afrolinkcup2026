"use client"

import { useEffect } from "react"
import Image from "next/image"
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch"
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents"
import { useGroups } from "@/hooks/useGroups"
import { MatchHeader } from "@/components/features/matches/MatchHeader"
import { SquadSection } from "@/components/features/matches/SquadSection"
import { TipSection } from "@/components/features/matches/TipSection"
import { MatchDetailNav } from "@/components/features/navigation/MatchDetailNav"
import { NewsSection } from "@/components/features/news/NewsSection"
import { GroupTableCardHighlighted } from "@/components/features/groups/GroupTableCardHighlighted"
import { Card } from "@/components/ui/card"

type Props = {
  params: { id: string }
}

export default function MatchDetailPage({ params }: Props) {
  const { id } = params
  const { match, loading: matchLoading, error: matchError } = useRealtimeMatch(id)
  const { events, loading: eventsLoading } = useRealtimeEvents(id)
  const { groupA, groupB } = useGroups()

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (matchLoading) {
    return (
      <main className="min-h-screen bg-background">
        <MatchDetailNav matchId={id} />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="space-y-4">
            <div className="h-32 bg-card animate-pulse rounded-xl" />
            <div className="h-64 bg-card animate-pulse rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  if (matchError || !match) {
    return (
      <main className="min-h-screen bg-background">
        <MatchDetailNav matchId={id} />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Spiel nicht gefunden
              </p>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero mit Hintergrundbild + Match Header */}
      <section className="relative overflow-hidden min-h-[340px]">
        {/* Hintergrundbild */}
        <div className="absolute inset-0">
          <Image
            src="/images/match-hero.png"
            alt="Match Hintergrund"
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Inhalt auf dem Hero */}
        <div className="relative z-10">
          {/* Navigation Bar im Hero */}
          <MatchDetailNav matchId={id} />

          {/* Match Header auf dem Hintergrundbild */}
          <div className="container mx-auto px-6 pb-16 pt-8">
            <MatchHeader match={match} events={events} />
          </div>
        </div>
      </section>

      {/* Restliche Inhalte unterhalb des Heros */}
      <div className="container mx-auto px-4 pt-4 pb-8 space-y-8">
        {/* Tip Section */}
        <TipSection match={match} />

        {/* Squad Section */}
        <SquadSection match={match} />

        {/* Gruppen-Tabelle Section - nur für Gruppenspiele */}
        {match.stage === "GROUP" && match.group && (
          <section>
            {match.group === "A" && groupA && (
              <GroupTableCardHighlighted
                groupData={groupA}
                highlightedTeamIds={[match.team_home.id, match.team_away.id]}
              />
            )}
            {match.group === "B" && groupB && (
              <GroupTableCardHighlighted
                groupData={groupB}
                highlightedTeamIds={[match.team_home.id, match.team_away.id]}
              />
            )}
          </section>
        )}

        {/* News Section */}
        <NewsSection matchId={match.id} />
      </div>
    </main>
  )
}
