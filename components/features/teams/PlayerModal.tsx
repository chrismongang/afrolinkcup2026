"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePlayerGoals } from "@/hooks/usePlayerGoals"
import type { Player, Team } from "@/types"

interface PlayerModalProps {
  player: Player
  team: Team
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerModal({ player, team, open, onOpenChange }: PlayerModalProps) {
  const [imageError, setImageError] = useState(false)
  const { goals } = usePlayerGoals(player.id)
  const hasPhotoUrl = player.photo_url && player.photo_url.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Spieler-Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* Spielerbild - größer */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-2 border-border">
            {hasPhotoUrl && !imageError ? (
              <Image
                src={player.photo_url!}
                alt={player.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : null}
            {/* Fallback Platzhalter */}
            <div className="absolute inset-0 bg-muted flex items-center justify-center text-5xl">
              ⚽
            </div>
          </div>

          {/* Name */}
          <div className="text-2xl font-bold text-foreground text-center">
            {player.name}
          </div>

          {/* Details */}
          <div className="w-full space-y-3">
            {player.age && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Alter</span>
                <span className="text-base font-medium text-foreground">
                  {player.age} Jahre
                </span>
              </div>
            )}

            {player.jersey_number !== null && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Trikotnummer</span>
                <span className="text-base font-medium text-foreground">
                  #{player.jersey_number}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Team</span>
              <div className="flex items-center gap-2">
                <span className="text-xl">{team.flag_emoji}</span>
                <span className="text-base font-medium text-foreground">
                  {team.name}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Tore</span>
              <span className="text-base font-semibold text-foreground">
                {goals} {goals === 1 ? "Tor" : "Tore"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
