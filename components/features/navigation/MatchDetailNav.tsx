"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MatchDetailNavProps {
  matchId: string
}

export function MatchDetailNav({ matchId }: MatchDetailNavProps) {
  const router = useRouter()

  const handleShare = async () => {
    const url = `${window.location.origin}/matches/${matchId}`

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Afrolink Cup 2026 - Spiel",
          text: "Schau dir dieses Spiel an!",
          url: url,
        })
        return
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      // Optional: Show toast notification
      alert("Link in Zwischenablage kopiert!")
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      // Fallback: Show URL in alert
      alert(`Link: ${url}`)
    }
  }

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

          {/* Share Button - Rechts */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-foreground hover:bg-accent"
          >
            <Share2 className="h-6 w-6" />
            <span className="sr-only">Teilen</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
