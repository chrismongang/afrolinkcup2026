"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Match, MatchEvent, Team, Player } from "@/types"

type MatchEventWithDetails = MatchEvent & {
  player?: Player | null
  team: Team
}

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

interface LiveTickerProps {
  events: MatchEventWithDetails[]
  loading: boolean
  match: MatchWithTeams
}

const eventIcons: Record<MatchEvent["type"], string> = {
  GOAL: "⚽",
  OWN_GOAL: "🥅",
  ASSIST: "🎯",
  YELLOW: "🟨",
  RED: "🟥",
  START: "▶️",
  HT: "⏸️",
  FT: "⏹️",
  ET_START: "➕",
  PEN_START: "🎯",
  SUBSTITUTION: "🔄",
}

const eventLabels: Record<MatchEvent["type"], string> = {
  GOAL: "Tor",
  OWN_GOAL: "Eigentor",
  ASSIST: "Torvorlage",
  YELLOW: "Gelbe Karte",
  RED: "Rote Karte",
  START: "Spielstart",
  HT: "Halbzeit",
  FT: "Spielende",
  ET_START: "Verlängerung",
  PEN_START: "Elfmeterschießen",
  SUBSTITUTION: "Auswechslung",
}

export function LiveTicker({ events, loading, match }: LiveTickerProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Live-Ticker</CardTitle>
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

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Live-Ticker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Noch keine Events
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Live-Ticker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => {
            const isHomeTeam = event.team_id === match.team_home.id
            const isGoal = event.type === "GOAL" || event.type === "OWN_GOAL"
            const isCard = event.type === "YELLOW" || event.type === "RED"

            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  isGoal ? "bg-primary/10" : "bg-card"
                }`}
              >
                {/* Minute */}
                <div className="flex-shrink-0 w-12 text-center">
                  <span className="text-sm font-semibold text-foreground">
                    {event.minute}'
                  </span>
                </div>

                {/* Event Icon */}
                <div className="flex-shrink-0 text-2xl">
                  {eventIcons[event.type]}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{event.team.flag_emoji}</span>
                    <span className="text-sm font-medium text-foreground">
                      {eventLabels[event.type]}
                    </span>
                  </div>
                  {event.player && (
                    <div className="text-sm text-muted-foreground">
                      {event.player.name}
                      {event.player.jersey_number && ` (#${event.player.jersey_number})`}
                    </div>
                  )}
                  {event.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.description}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
