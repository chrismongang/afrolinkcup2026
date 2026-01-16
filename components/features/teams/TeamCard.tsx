"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Team } from "@/types"

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link href={`/teams/${team.team_slug}`} className="block">
      <Card className="transition-colors hover:bg-card/80">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Flagge - größer */}
            <div className="text-5xl flex-shrink-0">{team.flag_emoji}</div>
            
            {/* Team-Name */}
            <div className="text-xl font-semibold text-foreground">
              {team.name}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
