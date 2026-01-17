"use client"

import { useRouter } from "next/navigation"
import { useRealtimeMatches } from "@/hooks/useRealtimeMatches"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils/format"
import Link from "next/link"

const statusLabels: Record<string, string> = {
  SCHEDULED: "Geplant",
  LIVE: "Läuft",
  LIVE_FIRST_HALF: "1. Halbzeit",
  HALF_TIME: "Halbzeit",
  LIVE_SECOND_HALF: "2. Halbzeit",
  EXTRA_TIME: "Verlängerung",
  PENALTIES: "Elfmeterschießen",
  FINISHED: "Beendet",
}

const stageLabels: Record<string, string> = {
  GROUP: "Gruppenphase",
  SEMIFINAL: "Halbfinale",
  FINAL: "Finale",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { matches, loading, error } = useRealtimeMatches()

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/access")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161616] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center py-20">Lädt...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#161616] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400 text-center py-20">
            Fehler beim Laden: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161616] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm">Afrolink Cup 2026</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/screens">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E]"
              >
                Arena Screens
              </Button>
            </Link>
            <Link href="/admin/players">
              <Button
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E]"
              >
                Spieler
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E]"
            >
              Abmelden
            </Button>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-[#1E1E1E] rounded-lg p-8 text-center text-gray-400">
              Keine Spiele gefunden
            </div>
          ) : (
            matches.map((match) => (
              <Link
                key={match.id}
                href={`/admin/matches/${match.id}`}
                className="block bg-[#1E1E1E] rounded-lg p-4 sm:p-6 hover:bg-[#252525] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded bg-[#EEF757]/20 text-[#EEF757]">
                        {stageLabels[match.stage]}
                        {match.group && ` - Gruppe ${match.group}`}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          match.status === "LIVE" ||
                          match.status === "LIVE_FIRST_HALF" ||
                          match.status === "LIVE_SECOND_HALF"
                            ? "bg-red-500/20 text-red-400"
                            : match.status === "FINISHED"
                            ? "bg-gray-500/20 text-gray-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {statusLabels[match.status]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {match.team_home ? (
                          <>
                            <span className="text-lg sm:text-xl font-semibold text-white">
                              {match.team_home.short_name}
                            </span>
                            <span className="text-lg sm:text-xl">{match.team_home.flag_emoji}</span>
                          </>
                        ) : (
                          <span className="text-lg sm:text-xl font-semibold text-white/60 italic">
                            {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '1. Gruppe A' :
                             match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '1. Gruppe B' :
                             match.stage === 'FINAL' ? 'Sieger HF1' : 'TBD'}
                          </span>
                        )}
                      </div>
                      {match.team_home && match.team_away ? (
                        <div className="text-xl sm:text-2xl font-bold text-[#EEF757]">
                          {match.score_home} : {match.score_away}
                        </div>
                      ) : (
                        <div className="text-xl sm:text-2xl font-bold text-[#EEF757]">
                          vs
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {match.team_away ? (
                          <>
                            <span className="text-lg sm:text-xl">{match.team_away.flag_emoji}</span>
                            <span className="text-lg sm:text-xl font-semibold text-white">
                              {match.team_away.short_name}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg sm:text-xl font-semibold text-white/60 italic">
                            {match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-1-2026-01-17' ? '2. Gruppe B' :
                             match.stage === 'SEMIFINAL' && (match as any).match_slug === 'halbfinale-2-2026-01-17' ? '2. Gruppe A' :
                             match.stage === 'FINAL' ? 'Sieger HF2' : 'TBD'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-400">
                      {formatDateTime(new Date(match.start_time))}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      variant="primary"
                      className="w-full sm:w-auto bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
                    >
                      Verwalten →
                    </Button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
