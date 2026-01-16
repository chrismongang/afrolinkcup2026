"use client"

import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { MatchCard } from "@/components/features/matches/MatchCard"
import type { Match } from "@/types"

const liveStatuses: Match["status"][] = [
  "LIVE",
  "LIVE_FIRST_HALF",
  "HALF_TIME",
  "LIVE_SECOND_HALF",
  "EXTRA_TIME",
  "PENALTIES",
]

const stageLabels: Record<Match["stage"], string> = {
  GROUP: "Gruppenphase",
  SEMIFINAL: "Halbfinale",
  FINAL: "Finale",
}

export default function MatchesPage() {
  const { matches: allMatches, loading } = useRealtimeMatches()

  // Separate live matches (always shown first)
  const liveMatches = allMatches.filter((m) => liveStatuses.includes(m.status))
  
  // Group remaining matches by stage
  const nonLiveMatches = allMatches.filter((m) => !liveStatuses.includes(m.status))
  
  const groupMatches = nonLiveMatches.filter((m) => m.stage === "GROUP")
  const semifinalMatches = nonLiveMatches.filter((m) => m.stage === "SEMIFINAL")
  const finalMatches = nonLiveMatches.filter((m) => m.stage === "FINAL")

  // Sort matches within each stage by start_time
  const sortByTime = (a: typeof allMatches[0], b: typeof allMatches[0]) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()

  groupMatches.sort(sortByTime)
  semifinalMatches.sort(sortByTime)
  finalMatches.sort(sortByTime)

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Spiele</h1>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Spiele</h1>
        </div>

        {/* Matches */}
        {allMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Keine Spiele gefunden
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Live Matches - Always First */}
            {liveMatches.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </span>
                  Live-Spiele
                </h2>
                <div>
                  {liveMatches.map((match, index) => (
                    <div key={match.id} className={index < liveMatches.length - 1 ? "mb-4" : ""}>
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Group Stage */}
            {groupMatches.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  {stageLabels.GROUP}
                </h2>
                <div>
                  {groupMatches.map((match, index) => (
                    <div key={match.id} className={index < groupMatches.length - 1 ? "mb-4" : ""}>
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Semifinals */}
            {semifinalMatches.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  {stageLabels.SEMIFINAL}
                </h2>
                <div>
                  {semifinalMatches.map((match, index) => (
                    <div key={match.id} className={index < semifinalMatches.length - 1 ? "mb-4" : ""}>
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Final */}
            {finalMatches.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">
                  {stageLabels.FINAL}
                </h2>
                <div>
                  {finalMatches.map((match, index) => (
                    <div key={match.id} className={index < finalMatches.length - 1 ? "mb-4" : ""}>
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
