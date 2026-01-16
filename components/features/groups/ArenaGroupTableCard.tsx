"use client"

import type { GroupData } from "@/hooks/useGroups"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ArenaGroupTableCardProps {
  groupData: GroupData
}

export function ArenaGroupTableCard({ groupData }: ArenaGroupTableCardProps) {
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
    <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 md:p-12 w-full max-w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-6xl md:text-7xl font-bold text-white">
          Gruppe {groupData.group}
        </h2>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b-2 border-white/30">
              <th className="text-left py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                #
              </th>
              <th className="text-left py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                Team
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                Sp
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                P
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                S
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                U
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                N
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                T
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
                GT
              </th>
              <th className="text-center py-6 px-6 text-3xl md:text-4xl font-semibold text-white">
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
                    "border-b border-white/20 transition-colors",
                    isPlaying &&
                      isFlashing &&
                      "bg-yellow-500/40"
                  )}
                >
                  <td className="py-6 px-6 text-3xl md:text-4xl font-medium text-white">
                    {entry.position}
                  </td>
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl md:text-6xl">{entry.team.flag_emoji}</span>
                      <span className="text-3xl md:text-4xl font-medium text-white">
                        {entry.team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl text-white">
                    {entry.played}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl font-semibold text-white" style={{ color: '#EEF757' }}>
                    {entry.points}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl text-white">
                    {entry.wins}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl text-white">
                    {entry.draws}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl text-white">
                    {entry.losses}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl text-white">
                    {entry.goalsFor}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl text-white">
                    {entry.goalsAgainst}
                  </td>
                  <td className="py-6 px-6 text-center text-3xl md:text-4xl font-medium text-white">
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
    </div>
  )
}
