"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch"
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents"
import { useMatchPlayers } from "@/hooks/useMatchPlayers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDateTime, formatTime } from "@/lib/utils/format"
import Link from "next/link"
import type { MatchEvent, Player } from "@/types"

const groupStatusOptions = [
  { value: "SCHEDULED", label: "Geplant" },
  { value: "LIVE", label: "Läuft" },
  { value: "FINISHED", label: "Beendet" },
]

const knockoutStatusOptions = [
  { value: "SCHEDULED", label: "Geplant" },
  { value: "LIVE_FIRST_HALF", label: "1. Halbzeit" },
  { value: "HALF_TIME", label: "Halbzeit" },
  { value: "LIVE_SECOND_HALF", label: "2. Halbzeit" },
  { value: "EXTRA_TIME", label: "Verlängerung" },
  { value: "PENALTIES", label: "Elfmeterschießen" },
  { value: "FINISHED", label: "Beendet" },
]

const eventTypes = [
  { value: "GOAL", label: "Tor" },
  { value: "OWN_GOAL", label: "Eigentor" },
  { value: "ASSIST", label: "Torvorlage" },
  { value: "YELLOW", label: "Gelbe Karte" },
  { value: "RED", label: "Rote Karte" },
  { value: "START", label: "Spielstart" },
  { value: "HT", label: "Halbzeit" },
  { value: "FT", label: "Spielende" },
  { value: "ET_START", label: "Verlängerung startet" },
  { value: "PEN_START", label: "Elfmeterschießen startet" },
  { value: "SUBSTITUTION", label: "Auswechslung" },
]

const arenaModes = [
  { value: "LIVE_MATCH", label: "Live Match" },
  { value: "TABLE", label: "Gruppentabellen" },
  { value: "SCORERS", label: "Torjäger" },
  { value: "SCHEDULE", label: "Spielplan" },
  { value: "MVP_PROMO", label: "MVP Promotion" },
]

type MatchEventWithDetails = MatchEvent & {
  player?: Player | null
  team: { id: string; name: string; short_name: string; flag_emoji: string }
}

export default function AdminMatchDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const { match, loading: matchLoading, error: matchError } = useRealtimeMatch(
    params.id
  )
  const { events, loading: eventsLoading } = useRealtimeEvents(params.id)
  const { homePlayers, awayPlayers, loading: playersLoading } = useMatchPlayers(
    match?.team_home_id || null,
    match?.team_away_id || null
  )

  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showEditEventDialog, setShowEditEventDialog] = useState(false)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showTimeDialog, setShowTimeDialog] = useState(false)
  const [showMVPDialog, setShowMVPDialog] = useState(false)
  const [showArenaDialog, setShowArenaDialog] = useState(false)
  const [editingEvent, setEditingEvent] = useState<MatchEventWithDetails | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Event form state
  const [eventType, setEventType] = useState("GOAL")
  const [eventTeam, setEventTeam] = useState<string>("")
  const [eventPlayer, setEventPlayer] = useState<string>("none")
  const [eventMinute, setEventMinute] = useState("")
  const [eventDescription, setEventDescription] = useState("")

  // Score form state
  const [scoreHome, setScoreHome] = useState("0")
  const [scoreAway, setScoreAway] = useState("0")
  const [penaltiesHome, setPenaltiesHome] = useState("")
  const [penaltiesAway, setPenaltiesAway] = useState("")

  // MVP form state
  const [mvpVotingEnd, setMvpVotingEnd] = useState("")

  // Arena form state
  const [arenaMode, setArenaMode] = useState("LIVE_MATCH")

  const allPlayers = [...homePlayers, ...awayPlayers]

  function resetEventForm() {
    setEventType("GOAL")
    setEventTeam("")
    setEventPlayer("none")
    setEventMinute("")
    setEventDescription("")
  }

  function openEditEventDialog(event: MatchEventWithDetails) {
    setEditingEvent(event)
    setEventType(event.type)
    setEventTeam(event.team_id)
    setEventPlayer(event.player_id || "none")
    setEventMinute(event.minute.toString())
    setEventDescription(event.description || "")
    setShowEditEventDialog(true)
  }

  async function handleCreateEvent() {
    if (!match || !eventTeam || !eventMinute) {
      setError("Team und Minute sind erforderlich")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: currentMatch.id,
          team_id: eventTeam,
          player_id: eventPlayer === "none" || eventPlayer === "" ? null : eventPlayer || null,
          type: eventType,
          minute: parseInt(eventMinute),
          description: eventDescription || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Erstellen")
      }

      resetEventForm()
      setShowEventDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateEvent() {
    if (!editingEvent || !eventTeam || !eventMinute) {
      setError("Team und Minute sind erforderlich")
      return
    }

    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingEvent.id,
          team_id: eventTeam,
          player_id: eventPlayer === "none" || eventPlayer === "" ? null : eventPlayer || null,
          type: eventType,
          minute: parseInt(eventMinute),
          description: eventDescription || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Aktualisieren")
      }

      setShowEditEventDialog(false)
      setEditingEvent(null)
      resetEventForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm("Event wirklich löschen?")) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/events?id=${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Löschen")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateScore() {
    if (!match) return

    setSaving(true)
    setError("")

    try {
      const updateData: any = {
        score_home: parseInt(scoreHome) || 0,
        score_away: parseInt(scoreAway) || 0,
      }

      if (penaltiesHome && penaltiesAway) {
        updateData.score_home_penalties = parseInt(penaltiesHome)
        updateData.score_away_penalties = parseInt(penaltiesAway)
      }

      const response = await fetch(`/api/admin/matches/${currentMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Aktualisieren")
      }

      setShowScoreDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    if (!match) return

    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/matches/${currentMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Aktualisieren")
      }

      setShowStatusDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateTime() {
    if (!match) return

    setSaving(true)
    setError("")

    try {
      const timeInput = (document.getElementById("start-time") as HTMLInputElement)
        ?.value
      if (!timeInput) {
        setError("Ungültige Zeit")
        return
      }

      const response = await fetch(`/api/admin/matches/${currentMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_time: new Date(timeInput).toISOString() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Aktualisieren")
      }

      setShowTimeDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateMVP() {
    if (!match) return

    setSaving(true)
    setError("")

    try {
      const endTime = mvpVotingEnd
        ? new Date(mvpVotingEnd).toISOString()
        : null

      const response = await fetch(`/api/admin/matches/${currentMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mvp_voting_end: endTime }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Aktualisieren")
      }

      setShowMVPDialog(false)
      setMvpVotingEnd("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdateArena() {
    if (!match) return

    setSaving(true)
    setError("")

    try {
      const updateData: any = { mode: arenaMode }
      if (arenaMode === "LIVE_MATCH") {
        updateData.match_id = currentMatch.id
      }

      const response = await fetch("/api/admin/arena", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Aktualisieren")
      }

      setShowArenaDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  // Quick Actions
  async function quickAction(action: string) {
    if (!match) return

    const statusMap: Record<string, string> =
      currentMatch.stage === "GROUP"
        ? {
            start: "LIVE",
            finish: "FINISHED",
          }
        : {
            start: "LIVE_FIRST_HALF",
            halftime: "HALF_TIME",
            secondHalf: "LIVE_SECOND_HALF",
            finish: "FINISHED",
          }

    if (statusMap[action]) {
      await handleUpdateStatus(statusMap[action])
    }
  }

  if (matchLoading || eventsLoading || playersLoading) {
    return (
      <div className="min-h-screen bg-[#161616] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center py-20">Lädt...</div>
        </div>
      </div>
    )
  }

  if (matchError || !match) {
    return (
      <div className="min-h-screen bg-[#161616] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-400 text-center py-20">
            {matchError?.message || "Match nicht gefunden"}
          </div>
        </div>
      </div>
    )
  }

  // TypeScript type guard: match is guaranteed to be non-null after the check above
  const currentMatch = match

  const statusOptions =
    currentMatch.stage === "GROUP" ? groupStatusOptions : knockoutStatusOptions

  const allowedEventTypes =
    currentMatch.stage === "GROUP"
      ? eventTypes.filter((type) => type.value !== "HT")
      : eventTypes

  // Initialize score dialog when opening
  function openScoreDialog() {
    setScoreHome(currentMatch.score_home.toString())
    setScoreAway(currentMatch.score_away.toString())
    setPenaltiesHome(currentMatch.score_home_penalties?.toString() || "")
    setPenaltiesAway(currentMatch.score_away_penalties?.toString() || "")
    setShowScoreDialog(true)
  }

  return (
    <div className="min-h-screen bg-[#161616] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href="/admin"
              className="text-[#EEF757] hover:text-[#EEF757]/80 text-sm mb-2 inline-block"
            >
              ← Zurück zur Übersicht
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Match verwalten
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {currentMatch.team_home.short_name} vs {currentMatch.team_away.short_name}
            </p>
          </div>
        </div>

        {/* Match Info Card */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{currentMatch.team_home.flag_emoji}</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#EEF757]">
                {currentMatch.score_home} : {currentMatch.score_away}
              </div>
              <div className="text-3xl">{currentMatch.team_away.flag_emoji}</div>
            </div>
              <div className="text-sm text-gray-400 text-center sm:text-right">
              <div>
                {formatDateTime(new Date(currentMatch.start_time))}
              </div>
              <div className="mt-1">
                Status:{" "}
                {
                  statusOptions.find((s) => s.value === currentMatch.status)?.label ||
                  currentMatch.status
                }
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button
              onClick={() => quickAction("start")}
              disabled={saving || currentMatch.status !== "SCHEDULED"}
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              Spiel starten
            </Button>
            <Button
              onClick={() => quickAction("halftime")}
              disabled={
                saving ||
                currentMatch.stage === "GROUP" ||
                currentMatch.status !== "LIVE_FIRST_HALF"
              }
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              Halbzeit
            </Button>
            <Button
              onClick={() => quickAction("secondHalf")}
              disabled={saving || currentMatch.stage === "GROUP" || currentMatch.status !== "HALF_TIME"}
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              2. Halbzeit
            </Button>
            <Button
              onClick={() => quickAction("finish")}
              disabled={saving || currentMatch.status === "FINISHED"}
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              Spiel beenden
            </Button>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={openScoreDialog}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E] h-auto py-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Score ändern</div>
              <div className="text-sm text-gray-400 mt-1">
                {currentMatch.score_home} : {currentMatch.score_away}
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setShowStatusDialog(true)}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E] h-auto py-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Status ändern</div>
              <div className="text-sm text-gray-400 mt-1">
                {
                  statusOptions.find((s) => s.value === currentMatch.status)?.label ||
                  currentMatch.status
                }
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setShowTimeDialog(true)}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E] h-auto py-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Startzeit ändern</div>
              <div className="text-sm text-gray-400 mt-1">
                {formatTime(new Date(currentMatch.start_time))}
              </div>
            </div>
          </Button>

          <Button
            onClick={() => {
              if (currentMatch.mvp_voting_end) {
                const date = new Date(currentMatch.mvp_voting_end)
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, "0")
                const day = String(date.getDate()).padStart(2, "0")
                const hours = String(date.getHours()).padStart(2, "0")
                const minutes = String(date.getMinutes()).padStart(2, "0")
                setMvpVotingEnd(`${year}-${month}-${day}T${hours}:${minutes}`)
              }
              setShowMVPDialog(true)
            }}
            variant="outline"
            disabled={currentMatch.status !== "FINISHED"}
            className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E] h-auto py-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">MVP-Voting</div>
              <div className="text-sm text-gray-400 mt-1">Fenster steuern</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              setArenaMode("LIVE_MATCH")
              setShowArenaDialog(true)
            }}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E] h-auto py-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">Arena-Display</div>
              <div className="text-sm text-gray-400 mt-1">Modus ändern</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              resetEventForm()
              setEventTeam(currentMatch.team_home_id)
              setShowEventDialog(true)
            }}
            className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90 h-auto py-4"
          >
            <div className="text-center">
              <div className="text-lg font-semibold">+ Event erstellen</div>
            </div>
          </Button>
        </div>

        {/* Events List */}
        <div className="bg-[#1E1E1E] rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Events ({events.length})
          </h2>
          {events.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Noch keine Events
            </div>
          ) : (
            <div className="space-y-2">
              {events
                .slice()
                .reverse()
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between bg-[#161616] rounded-lg p-3 sm:p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <span className="text-[#EEF757] font-semibold">
                          {event.minute}'
                        </span>
                        <span className="text-white">
                          {eventTypes.find((t) => t.value === event.type)?.label ||
                            event.type}
                        </span>
                        <span className="text-gray-400">
                          {event.team.short_name} {event.team.flag_emoji}
                        </span>
                        {event.player && (
                          <span className="text-gray-300">
                            {event.player.name}
                            {event.player.jersey_number && ` (#${event.player.jersey_number})`}
                          </span>
                        )}
                        {event.description && (
                          <span className="text-gray-500 text-sm">
                            {event.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => openEditEventDialog(event)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        onClick={() => handleDeleteEvent(event.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Create Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Event erstellen</DialogTitle>
              <DialogDescription className="text-gray-400">
                Erstelle ein neues Match-Event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event-Typ</label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="bg-[#161616] border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    {allowedEventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Team</label>
                <Select value={eventTeam} onValueChange={setEventTeam}>
                  <SelectTrigger className="bg-[#161616] border-gray-700">
                    <SelectValue placeholder="Team wählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    <SelectItem value={currentMatch.team_home_id}>
                      {currentMatch.team_home.flag_emoji} {currentMatch.team_home.short_name}
                    </SelectItem>
                    <SelectItem value={currentMatch.team_away_id}>
                      {currentMatch.team_away.flag_emoji} {currentMatch.team_away.short_name}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(eventType === "GOAL" ||
                eventType === "OWN_GOAL" ||
                eventType === "ASSIST" ||
                eventType === "YELLOW" ||
                eventType === "RED" ||
                eventType === "SUBSTITUTION") && (
                <div>
                  <label className="block text-sm font-medium mb-2">Spieler</label>
                  <Select value={eventPlayer} onValueChange={setEventPlayer}>
                    <SelectTrigger className="bg-[#161616] border-gray-700">
                      <SelectValue placeholder="Spieler wählen (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-gray-700 max-h-60">
                      <SelectItem value="none">Kein Spieler</SelectItem>
                      {allPlayers
                        .filter((p) => p.team_id === eventTeam)
                        .map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.jersey_number && `#${player.jersey_number} `}
                            {player.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Minute</label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={eventMinute}
                  onChange={(e) => setEventMinute(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                  placeholder="z.B. 23"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Beschreibung (optional)
                </label>
                <Input
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                  placeholder="Zusätzliche Informationen"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEventDialog(false)}
                className="border-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={saving}
                className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
              >
                {saving ? "Wird gespeichert..." : "Erstellen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog - Similar structure, but with update handler */}
        <Dialog open={showEditEventDialog} onOpenChange={setShowEditEventDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Event bearbeiten</DialogTitle>
              <DialogDescription className="text-gray-400">
                Bearbeite das ausgewählte Event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event-Typ</label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="bg-[#161616] border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    {allowedEventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Team</label>
                <Select value={eventTeam} onValueChange={setEventTeam}>
                  <SelectTrigger className="bg-[#161616] border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    <SelectItem value={currentMatch.team_home_id}>
                      {currentMatch.team_home.flag_emoji} {currentMatch.team_home.short_name}
                    </SelectItem>
                    <SelectItem value={currentMatch.team_away_id}>
                      {currentMatch.team_away.flag_emoji} {currentMatch.team_away.short_name}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(eventType === "GOAL" ||
                eventType === "OWN_GOAL" ||
                eventType === "ASSIST" ||
                eventType === "YELLOW" ||
                eventType === "RED" ||
                eventType === "SUBSTITUTION") && (
                <div>
                  <label className="block text-sm font-medium mb-2">Spieler</label>
                  <Select value={eventPlayer} onValueChange={setEventPlayer}>
                    <SelectTrigger className="bg-[#161616] border-gray-700">
                      <SelectValue placeholder="Spieler wählen (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E1E] border-gray-700 max-h-60">
                      <SelectItem value="none">Kein Spieler</SelectItem>
                      {allPlayers
                        .filter((p) => p.team_id === eventTeam)
                        .map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.jersey_number && `#${player.jersey_number} `}
                            {player.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Minute</label>
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={eventMinute}
                  onChange={(e) => setEventMinute(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Beschreibung (optional)
                </label>
                <Input
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditEventDialog(false)
                  setEditingEvent(null)
                  resetEventForm()
                }}
                className="border-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateEvent}
                disabled={saving}
                className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Score Dialog */}
        <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Score ändern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {currentMatch.team_home.short_name}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={scoreHome}
                    onChange={(e) => setScoreHome(e.target.value)}
                    className="bg-[#161616] border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {currentMatch.team_away.short_name}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={scoreAway}
                    onChange={(e) => setScoreAway(e.target.value)}
                    className="bg-[#161616] border-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Elfmeter {currentMatch.team_home.short_name} (optional)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={penaltiesHome}
                    onChange={(e) => setPenaltiesHome(e.target.value)}
                    className="bg-[#161616] border-gray-700"
                    placeholder="Nur bei KO-Phase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Elfmeter {currentMatch.team_away.short_name} (optional)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={penaltiesAway}
                    onChange={(e) => setPenaltiesAway(e.target.value)}
                    className="bg-[#161616] border-gray-700"
                    placeholder="Nur bei KO-Phase"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowScoreDialog(false)}
                className="border-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateScore}
                disabled={saving}
                className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Dialog */}
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Status ändern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select
                value={currentMatch.status}
                onValueChange={(value) => handleUpdateStatus(value)}
              >
                <SelectTrigger className="bg-[#161616] border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-700">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(false)}
                className="border-gray-700"
              >
                Schließen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Time Dialog */}
        <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Startzeit ändern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                id="start-time"
                type="datetime-local"
                defaultValue={new Date(currentMatch.start_time).toISOString().slice(0, 16)}
                className="bg-[#161616] border-gray-700"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTimeDialog(false)}
                className="border-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateTime}
                disabled={saving}
                className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MVP Dialog */}
        <Dialog open={showMVPDialog} onOpenChange={setShowMVPDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>MVP-Voting-Fenster steuern</DialogTitle>
              <DialogDescription className="text-gray-400">
                Setze das Ende des MVP-Voting-Fensters
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                type="datetime-local"
                value={mvpVotingEnd}
                onChange={(e) => setMvpVotingEnd(e.target.value)}
                className="bg-[#161616] border-gray-700"
                placeholder="Voting-Ende"
              />
              <p className="text-sm text-gray-400">
                Aktuelles Ende:{" "}
                {currentMatch.mvp_voting_end
                  ? formatDateTime(new Date(currentMatch.mvp_voting_end))
                  : "Nicht gesetzt"}
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowMVPDialog(false)}
                className="border-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateMVP}
                disabled={saving}
                className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Arena Dialog */}
        <Dialog open={showArenaDialog} onOpenChange={setShowArenaDialog}>
          <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Arena-Display-Modus ändern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={arenaMode} onValueChange={setArenaMode}>
                <SelectTrigger className="bg-[#161616] border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-700">
                  {arenaModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {arenaMode === "LIVE_MATCH" && (
                <p className="text-sm text-gray-400">
                  Das aktuelle Match wird auf dem Arena-Display angezeigt
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowArenaDialog(false)}
                className="border-gray-700"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleUpdateArena}
                disabled={saving}
                className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
              >
                {saving ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
