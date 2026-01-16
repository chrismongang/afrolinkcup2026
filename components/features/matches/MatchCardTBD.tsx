"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatTime } from "@/lib/utils/format"
import type { Match, Team } from "@/types"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

interface MatchCardTBDProps {
  match: MatchWithTeams
  stageLabel: string
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

export function MatchCardTBD({ match, stageLabel }: MatchCardTBDProps) {
  const startTime = new Date(match.start_time)
  const isFinished = match.status === "FINISHED"
  const isLive = match.status === "LIVE" || 
                 match.status === "LIVE_FIRST_HALF" || 
                 match.status === "LIVE_SECOND_HALF" ||
                 match.status === "EXTRA_TIME" ||
                 match.status === "PENALTIES"

  return (
    <Card className="transition-colors hover:bg-card/80 opacity-75">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Left: Time */}
          <div className="flex-shrink-0 w-16">
            {!isFinished && !isLive && (
              <span className="text-sm font-medium text-muted-foreground">
                {formatTime(startTime)}
              </span>
            )}
          </div>

          {/* Center: Teams or TBD */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span className="font-medium text-muted-foreground">
                {match.stage === "SEMIFINAL"
                  ? "Sieger/Verlierer"
                  : match.stage === "FINAL"
                    ? "Sieger Halbfinale"
                    : "TBD"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏆</span>
              <span className="font-medium text-muted-foreground">
                {match.stage === "SEMIFINAL"
                  ? "Sieger/Verlierer"
                  : match.stage === "FINAL"
                    ? "Sieger Halbfinale"
                    : "TBD"}
              </span>
            </div>
          </div>

          {/* Right: Status Badge */}
          <div className="flex-shrink-0">
            <Badge variant={statusVariants[match.status]}>
              {statusLabels[match.status]}
            </Badge>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {stageLabel}
        </div>
      </CardContent>
    </Card>
  )
}
