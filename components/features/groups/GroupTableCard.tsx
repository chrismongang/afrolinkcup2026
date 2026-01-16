"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GroupData } from "@/hooks/useGroups"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import Link from "next/link"

interface GroupTableCardProps {
  groupData: GroupData
}

export function GroupTableCard({ groupData }: GroupTableCardProps) {
  const [isFlashing, setIsFlashing] = useState(false)

  // Gelbes Aufleuchten für Teams, die gerade spielen
  useEffect(() => {
    if (groupData.liveMatchIds.length === 0) return

    const interval = setInterval(() => {
      setIsFlashing((prev) => !prev)
    }, 1000) // Alle 1 Sekunde

    return () => clearInterval(interval)
  }, [groupData.liveMatchIds.length])

  // Finde Team-IDs, die gerade spielen
  const playingTeamIds = new Set<string>()
  groupData.matches.forEach((match) => {
    if (groupData.liveMatchIds.includes(match.id)) {
      playingTeamIds.add(match.team_home.id)
      playingTeamIds.add(match.team_away.id)
    }
  })

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
                const isPlaying = playingTeamIds.has(entry.team.id)
                return (
                  <tr
                    key={entry.team.id}
                    className={cn(
                      "border-b border-border transition-colors",
                      isPlaying &&
                        isFlashing &&
                        "bg-yellow-500/20 dark:bg-yellow-500/10"
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
