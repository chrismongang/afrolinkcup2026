"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { PlayerModal } from "@/components/features/teams/PlayerModal"
import type { Scorer } from "@/hooks/useAllScorers"
import { cn } from "@/lib/utils"

interface ScorerCardProps {
  scorer: Scorer
  rank: number
}

export function ScorerCard({ scorer, rank }: ScorerCardProps) {
  const [imageError, setImageError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const hasPhotoUrl = scorer.player.photo_url && scorer.player.photo_url.trim() !== ""

  // Top 3 besonders hervorheben
  const isTopThree = rank <= 3
  const isTopOne = rank === 1

  return (
    <>
      <Card
        className={cn(
          "transition-colors hover:bg-card/80 cursor-pointer",
          isTopOne && "border-2 border-primary bg-primary/5",
          isTopThree && !isTopOne && "border border-primary/50 bg-primary/5"
        )}
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Ranking */}
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
              isTopOne && "bg-primary text-primary-foreground",
              isTopThree && !isTopOne && "bg-primary/20 text-primary",
              !isTopThree && "bg-muted text-muted-foreground"
            )}>
              {rank}
            </div>

            {/* Spielerbild */}
            <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-muted border border-border">
              {hasPhotoUrl && !imageError ? (
                <Image
                  src={scorer.player.photo_url!}
                  alt={scorer.player.name}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImageError(true)}
                />
              ) : (
                /* Fallback Platzhalter */
                <div className="absolute inset-0 bg-muted flex items-center justify-center text-2xl">
                  ⚽
                </div>
              )}
            </div>

            {/* Spieler-Informationen */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-base font-semibold text-foreground">
                  {scorer.player.name}
                </div>
                {/* Team Flagge */}
                <span className="text-xl">{scorer.player.team.flag_emoji}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {scorer.player.team.name}
              </div>
            </div>

            {/* Tore */}
            <div className={cn(
              "flex-shrink-0 text-2xl font-bold",
              isTopOne && "text-primary",
              isTopThree && !isTopOne && "text-primary/80",
              !isTopThree && "text-foreground"
            )}>
              {scorer.goals}
            </div>
          </div>
        </CardContent>
      </Card>

      <PlayerModal
        player={scorer.player}
        team={scorer.player.team}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
