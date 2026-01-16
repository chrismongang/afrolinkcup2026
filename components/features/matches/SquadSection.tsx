"use client"

import { useState } from "react"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PlayerModal } from "@/components/features/teams/PlayerModal"
import { useMatchSquads, type SquadData } from "@/hooks/useMatchSquads"
import { cn } from "@/lib/utils"
import type { Match, Team, Player } from "@/types"

type MatchWithTeams = Match & {
  team_home: Team
  team_away: Team
}

interface SquadSectionProps {
  match: MatchWithTeams
}

function PlayerSquadItem({
  player,
  team,
  side,
  onPlayerClick,
}: {
  player: Player
  team: Team
  side: "left" | "right"
  onPlayerClick: (player: Player, team: Team) => void
}) {
  // Nur Spieler haben Trikotnummern
  const hasJerseyNumber = player.jersey_number !== null && player.jersey_number !== undefined

  return (
    <div
      className={cn(
        "flex items-center rounded-md cursor-pointer transition-colors hover:bg-card/80 py-2",
        side === "left" ? "pl-0 pr-1" : "px-1"
      )}
      onClick={() => onPlayerClick(player, team)}
    >
      {side === "left" ? (
        <>
          {/* Nummer links, eigener grauer Bereich - nah am Rand */}
          {hasJerseyNumber && (
            <div className="w-4 text-right text-sm font-semibold text-foreground/50">
              {player.jersey_number}
            </div>
          )}
          {/* Name linksbündig */}
          <div className={cn("flex-1 min-w-0", hasJerseyNumber ? "pl-2" : "")}>
            <div className="text-base font-medium text-foreground truncate">
              {player.name}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Name rechtsbündig, dann Nummer mit wenig Abstand */}
          <div className="flex-1 min-w-0 pr-0 text-right">
            <div className="text-base font-medium text-foreground truncate">
              {player.name}
            </div>
          </div>
          {/* Nummer ganz rechts, eigener grauer Bereich */}
          {hasJerseyNumber && (
            <div className="w-5 text-right text-sm font-semibold text-foreground/50">
              {player.jersey_number}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SquadRow({
  homePlayer,
  awayPlayer,
  homeTeam,
  awayTeam,
  onPlayerClick,
}: {
  homePlayer: Player | null
  awayPlayer: Player | null
  homeTeam: Team
  awayTeam: Team
  onPlayerClick: (player: Player, team: Team) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Heimteam Spieler */}
      <div>
        {homePlayer ? (
          <PlayerSquadItem
            player={homePlayer}
            team={homeTeam}
            side="left"
            onPlayerClick={onPlayerClick}
          />
        ) : (
          <div className="py-2" /> // Leere Zeile für Ausrichtung
        )}
      </div>
      {/* Auswärtsteam Spieler */}
      <div>
        {awayPlayer ? (
          <PlayerSquadItem
            player={awayPlayer}
            team={awayTeam}
            side="right"
            onPlayerClick={onPlayerClick}
          />
        ) : (
          <div className="py-2" /> // Leere Zeile für Ausrichtung
        )}
      </div>
    </div>
  )
}

function TeamheadStaffRow({
  homeContent,
  awayContent,
}: {
  homeContent: React.ReactNode
  awayContent: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="text-left">{homeContent}</div>
      <div className="text-right">{awayContent}</div>
    </div>
  )
}

export function SquadSection({ match }: SquadSectionProps) {
  const { homeSquad, awaySquad, loading } = useMatchSquads(
    match.team_home.id,
    match.team_away.id
  )
  const [selectedPlayer, setSelectedPlayer] = useState<{ player: Player; team: Team } | null>(null)

  if (loading || !homeSquad || !awaySquad) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="text-2xl">
              {match.team_home.flag_emoji}
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
                KADER
              </h3>
            </div>
            <div className="text-2xl">
              {match.team_away.flag_emoji}
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Trenne Spieler, Teamhead und Staff für beide Teams
  const homePlayers = homeSquad.players.filter((p) => p.role === 'player')
  const awayPlayers = awaySquad.players.filter((p) => p.role === 'player')
  const homeTeamhead = homeSquad.players.find((p) => p.role === 'teamhead')
  const awayTeamhead = awaySquad.players.find((p) => p.role === 'teamhead')
  const homeStaff = homeSquad.players.filter((p) => p.role === 'staff')
  const awayStaff = awaySquad.players.filter((p) => p.role === 'staff')

  // Maximale Anzahl für synchronisierte Zeilen
  const maxPlayers = Math.max(homePlayers.length, awayPlayers.length)
  const maxStaff = Math.max(homeStaff.length, awayStaff.length)
  const hasTeamheadOrStaff = homeTeamhead || awayTeamhead || homeStaff.length > 0 || awayStaff.length > 0

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {/* Header mit Flaggen und KADER Titel */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="text-2xl">
              {homeSquad.team.flag_emoji}
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
                KADER
              </h3>
            </div>
            <div className="text-2xl">
              {awaySquad.team.flag_emoji}
            </div>
          </div>

          <div className="space-y-3">
            {/* Spieler Zeilen - synchronisiert */}
            {Array.from({ length: maxPlayers }).map((_, index) => (
              <SquadRow
                key={`player-${index}`}
                homePlayer={homePlayers[index] || null}
                awayPlayer={awayPlayers[index] || null}
                homeTeam={homeSquad.team}
                awayTeam={awaySquad.team}
                onPlayerClick={(player, team) => setSelectedPlayer({ player, team })}
              />
            ))}

            {/* Trennlinie und Teamhead/Staff Bereich */}
            {hasTeamheadOrStaff && (
              <>
                {/* Trennlinie (nicht über gesamte Breite) */}
                <div className="flex justify-center my-4">
                  <div className="w-3/4 h-px bg-border" />
                </div>

                {/* TEAMHEAD Titel - synchronisiert */}
                {(homeTeamhead || awayTeamhead) && (
                  <TeamheadStaffRow
                    homeContent={
                      homeTeamhead ? (
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                          TEAMHEAD
                        </h4>
                      ) : (
                        <div />
                      )
                    }
                    awayContent={
                      awayTeamhead ? (
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                          TEAMHEAD
                        </h4>
                      ) : (
                        <div />
                      )
                    }
                  />
                )}

                {/* Teamhead Zeilen - synchronisiert */}
                {(homeTeamhead || awayTeamhead) && (
                  <TeamheadStaffRow
                    homeContent={
                      homeTeamhead ? (
                        <div className="text-sm font-medium text-foreground">
                          {homeTeamhead.name}
                        </div>
                      ) : (
                        <div />
                      )
                    }
                    awayContent={
                      awayTeamhead ? (
                        <div className="text-sm font-medium text-foreground">
                          {awayTeamhead.name}
                        </div>
                      ) : (
                        <div />
                      )
                    }
                  />
                )}

                {/* STAFF Titel - synchronisiert */}
                {(homeStaff.length > 0 || awayStaff.length > 0) && (
                  <TeamheadStaffRow
                    homeContent={
                      homeStaff.length > 0 ? (
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                          STAFF
                        </h4>
                      ) : (
                        <div />
                      )
                    }
                    awayContent={
                      awayStaff.length > 0 ? (
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
                          STAFF
                        </h4>
                      ) : (
                        <div />
                      )
                    }
                  />
                )}

                {/* Staff Zeilen - synchronisiert */}
                {Array.from({ length: maxStaff }).map((_, index) => (
                  <TeamheadStaffRow
                    key={`staff-${index}`}
                    homeContent={
                      homeStaff[index] ? (
                        <div className="text-sm font-medium text-foreground">
                          {homeStaff[index].name}
                        </div>
                      ) : (
                        <div />
                      )
                    }
                    awayContent={
                      awayStaff[index] ? (
                        <div className="text-sm font-medium text-foreground">
                          {awayStaff[index].name}
                        </div>
                      ) : (
                        <div />
                      )
                    }
                  />
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer.player}
          team={selectedPlayer.team}
          open={!!selectedPlayer}
          onOpenChange={(open) => {
            if (!open) setSelectedPlayer(null)
          }}
        />
      )}
    </>
  )
}
