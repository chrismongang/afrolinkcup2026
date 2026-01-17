"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils/format"
import type { Match, Team } from "@/types"

type MatchWithTeams = Match & {
  team_home: Team | null
  team_away: Team | null
}

interface MatchCardProps {
  match: MatchWithTeams
}

const statusLabels: Record<Match["status"], string> = {
  SCHEDULED: "Geplant",
  LIVE: "LIVE",
  LIVE_FIRST_HALF: "1. Halbzeit",
  HALF_TIME: "Halbzeit",
  LIVE_SECOND_HALF: "2. Halbzeit",
  EXTRA_TIME: "Verlängerung",
  PENALTIES: "Elfmeterschießen",
  FINISHED: "Beendet",
}

const statusVariants: Record<Match["status"], "default" | "secondary" | "outline"> = {
  SCHEDULED: "outline",
  LIVE: "default",
  LIVE_FIRST_HALF: "default",
  HALF_TIME: "secondary",
  LIVE_SECOND_HALF: "default",
  EXTRA_TIME: "default",
  PENALTIES: "default",
  FINISHED: "secondary",
}

export function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === "LIVE" || 
                 match.status === "LIVE_FIRST_HALF" || 
                 match.status === "LIVE_SECOND_HALF" ||
                 match.status === "EXTRA_TIME" ||
                 match.status === "PENALTIES"

  const startTime = new Date(match.start_time)
  const isFinished = match.status === "FINISHED"
  const showScore = isFinished || isLive
  
  // Wenn Teams noch nicht feststehen, ist die Karte nicht klickbar
  const hasTeams = match.team_home !== null && match.team_away !== null

  const cardContent = (
      <Card className={`transition-colors hover:bg-card/80 ${isLive ? "ring-2 ring-primary rounded-xl" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Left: Time (for scheduled matches) */}
            <div className="flex-shrink-0 w-16">
              {!showScore && (
                <span className="text-sm font-medium text-foreground">
                  {formatTime(startTime)}
                </span>
              )}
            </div>

            {/* Center: Teams */}
            <div className="flex-1 space-y-2">
              {/* Home Team */}
              <div className="flex items-center space-x-2">
                {match.team_home ? (
                  <>
                    <span className="text-xl">{match.team_home.flag_emoji}</span>
                    <span className="font-medium text-foreground">{match.team_home.name}</span>
                  </>
                ) : (
                  <span className="font-medium text-muted-foreground italic">
                    {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '1. Gruppe A' :
                     match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '1. Gruppe B' :
                     match.stage === 'FINAL' ? 'Sieger HF1' : 'TBD'}
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center space-x-2">
                {match.team_away ? (
                  <>
                    <span className="text-xl">{match.team_away.flag_emoji}</span>
                    <span className="font-medium text-foreground">{match.team_away.name}</span>
                  </>
                ) : (
                  <span className="font-medium text-muted-foreground italic">
                    {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '2. Gruppe B' :
                     match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '2. Gruppe A' :
                     match.stage === 'FINAL' ? 'Sieger HF2' : 'TBD'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Score or Status Badge */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {showScore ? (
                <>
                  <span className="text-lg font-bold text-foreground">
                    {match.score_home}
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {match.score_away}
                  </span>
                  {match.score_home_penalties !== null && match.score_away_penalties !== null && (
                    <span className="text-xs text-muted-foreground">
                      ({match.score_home_penalties}:{match.score_away_penalties})
                    </span>
                  )}
                </>
              ) : (
                <Badge variant={statusVariants[match.status]}>
                  {statusLabels[match.status]}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  )

  if (hasTeams) {
    return (
      <Link href={`/matches/${match.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  // Wenn Teams noch nicht feststehen, zeige die Karte ohne Link
  return (
    <div className="block opacity-75 cursor-not-allowed">
      {cardContent}
    </div>
  )
}

