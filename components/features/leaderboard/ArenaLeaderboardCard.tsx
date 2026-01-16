"use client"

import { useState } from "react"
import Image from "next/image"
import type { LeaderboardEntry } from "@/hooks/useLeaderboard"
import { cn } from "@/lib/utils"

interface ArenaLeaderboardCardProps {
  entry: LeaderboardEntry
  rank: number
}

export function ArenaLeaderboardCard({ entry, rank }: ArenaLeaderboardCardProps) {
  const [imageError, setImageError] = useState(false)
  // Get avatar URL or default (wie in LeaderboardCard)
  const avatarUrl = entry.avatar_url || "/images/default_profilpic.png"

  const isTopThree = rank <= 3
  const isTopOne = rank === 1

  // Größen basierend auf Platzierung (größer für Arena, aber ähnliches Layout wie LeaderboardCard)
  const cardPadding = isTopOne
    ? "p-6 md:p-8 lg:p-10" // Größer für Platz 1
    : "p-5 md:p-6 lg:p-8" // Kleiner für Platz 2 und 3

  const avatarSize = isTopOne
    ? "w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28" // Größer für Platz 1
    : "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" // Kleiner für Platz 2 und 3

  const usernameSize = isTopOne
    ? "text-2xl md:text-3xl lg:text-4xl" // Größer für Platz 1
    : "text-xl md:text-2xl lg:text-3xl" // Kleiner für Platz 2 und 3

  const pointsSize = isTopOne
    ? "text-4xl md:text-5xl lg:text-6xl" // Größer für Platz 1
    : "text-3xl md:text-4xl lg:text-5xl" // Kleiner für Platz 2 und 3

  const rankBadgeSize = isTopOne
    ? "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-2xl md:text-3xl lg:text-4xl" // Größer für Platz 1
    : "w-14 h-14 md:w-18 md:h-18 lg:w-20 lg:h-20 text-xl md:text-2xl lg:text-3xl" // Kleiner für Platz 2 und 3

  return (
    <div
      className={cn(
        "bg-black/70 backdrop-blur-sm rounded-2xl w-full flex items-center gap-4 md:gap-6 lg:gap-8 transition-colors",
        isTopOne && "border-2 border-primary bg-primary/5",
        isTopThree && !isTopOne && "border border-primary/50 bg-primary/5"
      )}
    >
      <div className={cn(cardPadding, "w-full flex items-center gap-4 md:gap-6 lg:gap-8")}>
        {/* Ranking Badge */}
        <div
          className={cn(
            `${rankBadgeSize} rounded-full flex items-center justify-center font-bold flex-shrink-0`,
            isTopOne && "bg-primary text-primary-foreground",
            isTopThree && !isTopOne && "bg-primary/20 text-primary",
            !isTopThree && "bg-muted text-muted-foreground"
          )}
        >
          {rank}
        </div>

        {/* Avatar */}
        <div
          className={cn(
            `relative ${avatarSize} rounded-full overflow-hidden bg-muted border border-border flex-shrink-0`
          )}
        >
          {!imageError ? (
            <Image
              src={avatarUrl}
              alt={entry.username}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            /* Fallback Platzhalter nur wenn Bild-Fehler */
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-2xl md:text-3xl lg:text-4xl">
              👤
            </div>
          )}
        </div>

        {/* Username */}
        <div className="flex-1 min-w-0">
          <div className={cn(usernameSize, "font-semibold text-white truncate")}>
            {entry.username}
          </div>
        </div>

        {/* Points */}
        <div
          className={cn(
            `${pointsSize} font-bold flex-shrink-0`,
            isTopOne && "text-primary",
            isTopThree && !isTopOne && "text-primary/80",
            !isTopThree && "text-white"
          )}
        >
          {entry.total_points}
        </div>
      </div>
    </div>
  )
}
