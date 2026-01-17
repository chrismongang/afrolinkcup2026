"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { PlayerModal } from "./PlayerModal"
import type { Player, Team } from "@/types"

interface PlayerCardProps {
  player: Player
  team: Team
}

export function PlayerCard({ player, team }: PlayerCardProps) {
  const [imageError, setImageError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const hasPhotoUrl = player.photo_url && player.photo_url.trim() !== ""

  return (
    <>
      <Card
        className="transition-colors hover:bg-card/80 cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Spielerbild */}
          <div className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-muted border border-border">
            {hasPhotoUrl && !imageError ? (
              <Image
                src={player.photo_url!}
                alt={player.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setImageError(true)}
              />
            ) : (
              /* Fallback Platzhalter - wird angezeigt wenn kein photo_url vorhanden ist oder Bild nicht geladen werden kann */
              <div className="absolute inset-0 bg-muted flex items-center justify-center text-2xl">
                ⚽
              </div>
            )}
          </div>

          {/* Spieler-Informationen */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-foreground">
              {player.name}
            </div>
            <div className="text-sm text-muted-foreground">
              {player.age && `${player.age} Jahre`}
              {player.age && player.jersey_number !== null && " • "}
              {player.jersey_number !== null && `#${player.jersey_number}`}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <PlayerModal
      player={player}
      team={team}
      open={modalOpen}
      onOpenChange={setModalOpen}
    />
  </>
  )
}
