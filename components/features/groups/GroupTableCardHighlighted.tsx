"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupData } from "@/hooks/useGroups"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface GroupTableCardHighlightedProps {
  groupData: GroupData
  highlightedTeamId?: string
  highlightedTeamIds?: string[]
}

export function GroupTableCardHighlighted({
  groupData,
  highlightedTeamId,
  highlightedTeamIds,
}: GroupTableCardHighlightedProps) {
  // Unterstütze sowohl einzelne ID als auch Array von IDs
  const highlightedIds = highlightedTeamIds 
    ? new Set(highlightedTeamIds)
    : highlightedTeamId 
    ? new Set([highlightedTeamId])
    : new Set<string>()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Gruppe {groupData.group}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">
                  #
                </th>
                <th className="text-left py-2 px-2 text-sm font-semibold text-muted-foreground">
                  Team
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  Sp
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  P
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  S
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  U
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  N
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  T
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  GT
                </th>
                <th className="text-center py-2 px-2 text-sm font-semibold text-muted-foreground">
                  TD
                </th>
              </tr>
            </thead>
            <tbody>
              {groupData.table.map((entry) => {
                const isHighlighted = highlightedIds.has(entry.team.id)
                return (
                  <tr
                    key={entry.team.id}
                    className={cn(
                      "border-b border-border transition-colors",
                      isHighlighted && "bg-primary/20"
                    )}
                  >
                    <td className="py-3 px-2 text-sm font-medium text-foreground">
                      {entry.position}
                    </td>
                    <td className="py-3 px-2">
                      <Link 
                        href={`/teams/${entry.team.team_slug}`}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <span className="text-xl">{entry.team.flag_emoji}</span>
                        <span className="text-sm font-medium text-foreground">
                          {entry.team.name}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-foreground">
                      {entry.played}
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-semibold" style={{ color: '#EEF757' }}>
                      {entry.points}
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-foreground">
                      {entry.wins}
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-foreground">
                      {entry.draws}
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-foreground">
                      {entry.losses}
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-foreground">
                      {entry.goalsFor}
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-foreground">
                      {entry.goalsAgainst}
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-medium text-foreground">
                      {entry.goalDifference > 0
                        ? `+${entry.goalDifference}`
                        : entry.goalDifference}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
