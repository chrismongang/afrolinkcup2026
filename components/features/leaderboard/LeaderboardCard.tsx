"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { LeaderboardEntry } from "@/hooks/useLeaderboard"
import { cn } from "@/lib/utils"

interface LeaderboardCardProps {
  entry: LeaderboardEntry
}

export function LeaderboardCard({ entry }: LeaderboardCardProps) {
  const isTopThree = entry.rank <= 3
  const isTopOne = entry.rank === 1

  // Get avatar URL or default
  const avatarUrl = entry.avatar_url || "/images/default_profilpic.png"

  return (
    <Card
      className={cn(
        "transition-colors",
        isTopOne && "border-2 border-primary bg-primary/5",
        isTopThree && !isTopOne && "border border-primary/50 bg-primary/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Ranking */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
              isTopOne && "bg-primary text-primary-foreground",
              isTopThree && !isTopOne && "bg-primary/20 text-primary",
              !isTopThree && "bg-muted text-muted-foreground"
            )}
          >
            {entry.rank}
          </div>

          {/* Avatar */}
          <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-muted border border-border">
            <Image
              src={avatarUrl}
              alt={entry.username}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Username */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-foreground truncate">
              {entry.username}
            </div>
          </div>

          {/* Points */}
          <div
            className={cn(
              "flex-shrink-0 text-xl font-bold",
              isTopOne && "text-primary",
              isTopThree && !isTopOne && "text-primary/80",
              !isTopThree && "text-foreground"
            )}
          >
            {entry.total_points}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
