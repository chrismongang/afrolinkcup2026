"use client"

import { useState } from "react"
import Image from "next/image"
import type { Scorer } from "@/hooks/useAllScorers"

interface ArenaScorerCardProps {
  scorer: Scorer
  rank: number
}

export function ArenaScorerCard({ scorer, rank }: ArenaScorerCardProps) {
  const [imageError, setImageError] = useState(false)
  const hasPhotoUrl = scorer.player.photo_url && scorer.player.photo_url.trim() !== ""

  const isFirst = rank === 1
  const isSecond = rank === 2
  const isThird = rank === 3

  // Größen basierend auf Platzierung
  const cardSize = isFirst
    ? "w-96 md:w-[28rem] lg:w-[32rem]" // Größer für Platz 1
    : "w-80 md:w-96 lg:w-[26rem]" // Kleiner für Platz 2 und 3

  const imageSize = isFirst
    ? "w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64" // Größer für Platz 1
    : "w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56" // Kleiner für Platz 2 und 3

  const nameSize = isFirst
    ? "text-4xl md:text-5xl lg:text-6xl" // Größer für Platz 1
    : "text-3xl md:text-4xl lg:text-5xl" // Kleiner für Platz 2 und 3

  const goalsSize = isFirst
    ? "text-7xl md:text-8xl lg:text-9xl" // Größer für Platz 1
    : "text-6xl md:text-7xl lg:text-8xl" // Kleiner für Platz 2 und 3

  const teamSize = isFirst
    ? "text-2xl md:text-3xl lg:text-4xl" // Größer für Platz 1
    : "text-xl md:text-2xl lg:text-3xl" // Kleiner für Platz 2 und 3

  // Podest-Höhe: Platz 1 höher, Platz 2 und 3 tiefer
  const podiumHeight = isFirst ? "mb-0" : "mb-12 md:mb-16 lg:mb-20"

  return (
    <div className={`flex flex-col items-center ${cardSize} ${podiumHeight}`}>
      {/* Platzierung Badge */}
      <div
        className={`
          w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8
          ${
            isFirst
              ? "bg-yellow-500 text-black"
              : isSecond
              ? "bg-gray-300 text-black"
              : "bg-amber-600 text-white"
          }
        `}
      >
        {rank}
      </div>

      {/* Karte mit halbtransparentem Hintergrund */}
      <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 md:p-10 lg:p-12 w-full flex flex-col items-center">
        {/* Spielerfoto */}
        <div
          className={`relative ${imageSize} rounded-full overflow-hidden bg-muted border-4 md:border-6 ${
            isFirst ? "border-yellow-500" : isSecond ? "border-gray-300" : "border-amber-600"
          } mb-6 md:mb-8`}
        >
          {hasPhotoUrl && !imageError ? (
            <Image
              src={scorer.player.photo_url!}
              alt={scorer.player.name}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : null}
          {/* Fallback Platzhalter */}
          <div className="absolute inset-0 bg-muted flex items-center justify-center text-5xl md:text-6xl lg:text-7xl">
            ⚽
          </div>
        </div>

        {/* Spielername */}
        <div className={`${nameSize} font-bold text-white text-center mb-3 md:mb-4`}>
          {scorer.player.name}
        </div>

        {/* Team Name und Flagge */}
        <div className={`${teamSize} text-white/80 text-center mb-6 md:mb-8 flex items-center justify-center gap-3`}>
          <span className="text-3xl md:text-4xl lg:text-5xl">{scorer.player.team.flag_emoji}</span>
          <span>{scorer.player.team.name}</span>
        </div>

        {/* Tore - groß hervorgehoben */}
        <div className="mt-auto">
          <div className="text-center">
            <div className={`${goalsSize} font-bold text-white mb-2`} style={{ color: '#EEF757' }}>
              {scorer.goals}
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl text-white/70">
              {scorer.goals === 1 ? "Tor" : "Tore"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
