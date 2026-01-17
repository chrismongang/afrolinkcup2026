"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMatchTips } from "@/hooks/useMatchTips"
import { createClient } from "@/lib/supabase/client"
import type { Match, Team } from "@/types"
import { RegisterDialog } from "@/components/features/auth/RegisterDialog"
import { cn } from "@/lib/utils"

type MatchWithTeams = Match & {
  team_home: Team | null
  team_away: Team | null
}

interface TipSectionProps {
  match: MatchWithTeams
}

export function TipSection({ match }: TipSectionProps) {
  // Wenn Teams noch nicht feststehen, zeige eine Nachricht
  if (!match.team_home || !match.team_away) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">Teams noch nicht festgelegt</p>
            <p className="text-sm">
              Die Teams für dieses Spiel werden automatisch aktualisiert, sobald die vorherigen Spiele beendet sind.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { userTip, distribution, loading, submitWinnerTip, submitScoreTip } =
    useMatchTips(match.id)
  const [isSubmittingWinner, setIsSubmittingWinner] = useState(false)
  const [isSubmittingScore, setIsSubmittingScore] = useState(false)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsAuthenticated(!!session?.user)
    }
    checkAuth()

    // Listen for auth state changes
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const hasWinnerTip = !!userTip?.predicted_winner
  const hasScoreTip =
    userTip?.predicted_home_score !== null &&
    userTip?.predicted_home_score !== undefined &&
    userTip?.predicted_away_score !== null &&
    userTip?.predicted_away_score !== undefined
  // Man kann den Gewinner-Tipp abgeben/ändern, solange man noch keinen Score-Tipp hat
  const canChangeWinner = !hasScoreTip
  const showScoreInput = hasWinnerTip && isAuthenticated

  const handleWinnerClick = async (winner: "HOME" | "AWAY" | "DRAW") => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }
    if (isSubmittingWinner || !canChangeWinner) return

    setIsSubmittingWinner(true)
    const { error } = await submitWinnerTip(winner)
    setIsSubmittingWinner(false)

    if (error) {
      console.error("Error submitting winner tip:", error)
    }
  }

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmittingScore || !isAuthenticated) return

    const home = parseInt(homeScore)
    const away = parseInt(awayScore)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      return
    }

    setIsSubmittingScore(true)
    const { error } = await submitScoreTip(home, away)
    setIsSubmittingScore(false)

    if (error) {
      console.error("Error submitting score tip:", error)
    } else {
      setHomeScore("")
      setAwayScore("")
    }
  }

  // Calculate percentages
  const total = distribution.total || 0
  const homePercent = total > 0 ? Math.round((distribution.home / total) * 100) : 0
  const drawPercent = total > 0 ? Math.round((distribution.draw / total) * 100) : 0
  const awayPercent = total > 0 ? Math.round((distribution.away / total) * 100) : 0

  // Colors for segments (based on image: red for teams, gray for draw)
  const homeColor = "#ff0050" // Red
  const drawColor = "#cccccc" // Gray
  const awayColor = "#ff0050" // Red

  // Show percentages only after user has voted
  const showPercentages = hasWinnerTip

  // Get predicted winner for preview
  const predictedWinner =
    userTip?.predicted_winner === "HOME"
      ? match.team_home.name
      : userTip?.predicted_winner === "AWAY"
        ? match.team_away.name
        : userTip?.predicted_winner === "DRAW"
          ? "Unentschieden"
          : null

  // Don't show if match is finished
  if (match.status === "FINISHED") {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
            WER WIRD GEWINNEN?
          </h3>
          <p className="text-sm text-muted-foreground">
            {total.toLocaleString("de-DE")}{" "}
            {total === 1 ? "Stimme" : "Stimmen"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Segmented Voting Card */}
        <div
          className="relative rounded-full overflow-hidden border-2"
          style={{ borderColor: "#EEF757" }}
        >
          <div className="flex h-16 w-full">
            {/* Home Team Segment */}
            <button
              type="button"
              onClick={() => handleWinnerClick("HOME")}
              disabled={isSubmittingWinner || !canChangeWinner}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-bold transition-all relative",
                "border-r border-border/40",
                userTip?.predicted_winner === "HOME" && "ring-2 ring-offset-2 ring-offset-background ring-primary",
                !canChangeWinner && "opacity-50 cursor-not-allowed",
                "hover:bg-muted/60 active:scale-[0.98]"
              )}
              style={{
                flexBasis: hasWinnerTip ? `${homePercent}%` : "33.33%",
                minWidth: "80px",
                backgroundColor: "#1E1E1E",
              }}
            >
              {showPercentages ? (
                <span className="text-base font-bold">{homePercent}%</span>
              ) : (
                <span className="text-2xl">{match.team_home.flag_emoji}</span>
              )}
            </button>

            {/* Draw Segment */}
            <button
              type="button"
              onClick={() => handleWinnerClick("DRAW")}
              disabled={isSubmittingWinner || !canChangeWinner}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-bold transition-all relative",
                "border-r border-border/40",
                userTip?.predicted_winner === "DRAW" && "ring-2 ring-offset-2 ring-offset-background ring-primary",
                !canChangeWinner && "opacity-50 cursor-not-allowed",
                "hover:bg-muted/60 active:scale-[0.98]"
              )}
              style={{
                flexBasis: hasWinnerTip ? `${drawPercent}%` : "33.33%",
                minWidth: "80px",
                backgroundColor: "#1E1E1E",
              }}
            >
              {showPercentages ? (
                <span className="text-base font-bold">{drawPercent}%</span>
              ) : (
                <span className="text-sm font-medium">Unentschieden</span>
              )}
            </button>

            {/* Away Team Segment */}
            <button
              type="button"
              onClick={() => handleWinnerClick("AWAY")}
              disabled={isSubmittingWinner || !canChangeWinner}
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-bold transition-all relative",
                userTip?.predicted_winner === "AWAY" && "ring-2 ring-offset-2 ring-offset-background ring-primary",
                !canChangeWinner && "opacity-50 cursor-not-allowed",
                "hover:bg-muted/60 active:scale-[0.98]"
              )}
              style={{
                flexBasis: hasWinnerTip ? `${awayPercent}%` : "33.33%",
                minWidth: "80px",
                backgroundColor: "#1E1E1E",
              }}
            >
              {showPercentages ? (
                <span className="text-base font-bold">{awayPercent}%</span>
              ) : (
                <span className="text-2xl">{match.team_away.flag_emoji}</span>
              )}
            </button>
          </div>
        </div>

        {/* Score Input Section */}
        {hasWinnerTip && (
          <div className="pt-4 border-t space-y-4">
            {!isAuthenticated ? (
              <div className="text-center space-y-3 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Um ein Ergebnis zu tippen und am Leaderboard teilzunehmen,
                  musst du dich registrieren.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAuthDialog(true)}
                >
                  Jetzt registrieren
                </Button>
              </div>
            ) : (
              <>
                {predictedWinner && (
                  <p className="text-sm text-center text-muted-foreground">
                    Du tippst auf: <span className="font-medium">{predictedWinner}</span>
                  </p>
                )}

                {hasScoreTip ? (
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Dein Tipp:
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {userTip.predicted_home_score} : {userTip.predicted_away_score}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleScoreSubmit} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {match.team_home.short_name}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={homeScore}
                          onChange={(e) => setHomeScore(e.target.value)}
                          placeholder="0"
                          className="text-center"
                          required
                        />
                      </div>
                      <span className="text-2xl font-bold text-foreground pt-6">
                        :
                      </span>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {match.team_away.short_name}
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={awayScore}
                          onChange={(e) => setAwayScore(e.target.value)}
                          placeholder="0"
                          className="text-center"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmittingScore || !homeScore || !awayScore}
                    >
                      {isSubmittingScore ? "Wird gespeichert..." : "Tipp absenden"}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Lädt...
          </div>
        )}

        <RegisterDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onSuccess={() => {
            // Refresh auth state after successful registration
            async function refreshAuth() {
              const supabase = createClient()
              const {
                data: { session },
              } = await supabase.auth.getSession()
              setIsAuthenticated(!!session?.user)
            }
            refreshAuth()
          }}
        />
      </CardContent>
    </Card>
  )
}
