"use client"

import type { Team } from "@/types"

interface TeamHeaderProps {
  team: Team
}

export function TeamHeader({ team }: TeamHeaderProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
      {/* Flagge - größer */}
      <div className="text-7xl">{team.flag_emoji}</div>

      {/* Team-Name - groß */}
      <div className="text-3xl font-bold text-foreground text-center">
        {team.name}
      </div>
    </div>
  )
}
