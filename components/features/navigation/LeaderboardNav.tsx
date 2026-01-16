"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeaderboardNav() {
  const router = useRouter()

  return (
    <nav className="w-full pt-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Back Button - Links */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-foreground hover:bg-accent"
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Zurück</span>
          </Button>

          {/* Title - Zentriert */}
          <h1 className="text-sm font-semibold text-foreground uppercase absolute left-1/2 transform -translate-x-1/2">
            AFROLINK CUP 2026
          </h1>

          {/* Platzhalter für zentrierte Ausrichtung */}
          <div className="w-10" />
        </div>
      </div>
    </nav>
  )
}
