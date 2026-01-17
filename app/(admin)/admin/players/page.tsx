"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTeams } from "@/hooks/useTeams"
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
import Image from "next/image"
import type { Player, Team } from "@/types"

type PlayerWithTeam = Player & {
  team: Team
}

export default function AdminPlayersPage() {
  const router = useRouter()
  const { teams, loading: teamsLoading } = useTeams()
  const [players, setPlayers] = useState<PlayerWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithTeam | null>(null)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formName, setFormName] = useState("")
  const [formJerseyNumber, setFormJerseyNumber] = useState("")
  const [formPosition, setFormPosition] = useState("Spieler")
  const [formAge, setFormAge] = useState("")
  const [formTeamId, setFormTeamId] = useState("")
  const [formPhotoUrl, setFormPhotoUrl] = useState("")

  // Lade Spieler
  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true)
        setError(null)

        const url =
          selectedTeam === "all"
            ? "/api/admin/players"
            : `/api/admin/players?team_id=${selectedTeam}`

        const response = await fetch(url)
        const data = await response.json()

        if (response.ok && data.data) {
          setPlayers(data.data)
        } else {
          setError("Fehler beim Laden der Spieler")
        }
      } catch (err) {
        setError("Fehler beim Laden der Spieler")
        console.error("Error loading players:", err)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [selectedTeam])

  function resetForm() {
    setFormName("")
    setFormJerseyNumber("")
    setFormPosition("Spieler")
    setFormAge("")
    setFormTeamId("")
    setFormPhotoUrl("")
  }

  function openAddDialog() {
    resetForm()
    setShowAddDialog(true)
  }

  function openEditDialog(player: PlayerWithTeam) {
    setEditingPlayer(player)
    setFormName(player.name)
    setFormJerseyNumber(player.jersey_number?.toString() || "")
    setFormPosition(player.position || "Spieler")
    setFormAge(player.age?.toString() || "")
    setFormTeamId(player.team_id)
    setFormPhotoUrl(player.photo_url || "")
    setShowEditDialog(true)
  }

  async function handleSave() {
    try {
      setSaving(true)
      setError(null)

      if (editingPlayer) {
        // Update
        const response = await fetch(`/api/admin/players/${editingPlayer.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formName,
            jersey_number: formJerseyNumber,
            position: formPosition,
            age: formAge || null,
            photo_url: formPhotoUrl || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Fehler beim Speichern")
        }

        setShowEditDialog(false)
        // Reload players
        const reloadResponse = await fetch(
          selectedTeam === "all"
            ? "/api/admin/players"
            : `/api/admin/players?team_id=${selectedTeam}`
        )
        const reloadData = await reloadResponse.json()
        if (reloadData.data) {
          setPlayers(reloadData.data)
        }
      } else {
        // Create
        if (!formTeamId) {
          setError("Team ist erforderlich")
          return
        }

        const response = await fetch("/api/admin/players", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            team_id: formTeamId,
            name: formName,
            jersey_number: formJerseyNumber,
            position: formPosition,
            age: formAge || null,
            photo_url: formPhotoUrl || null,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Fehler beim Erstellen")
        }

        setShowAddDialog(false)
        resetForm()
        // Reload players
        const reloadResponse = await fetch(
          selectedTeam === "all"
            ? "/api/admin/players"
            : `/api/admin/players?team_id=${selectedTeam}`
        )
        const reloadData = await reloadResponse.json()
        if (reloadData.data) {
          setPlayers(reloadData.data)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
      console.error("Error saving player:", err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(playerId: string) {
    if (!confirm("Möchtest du diesen Spieler wirklich löschen?")) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Fehler beim Löschen")
      }

      // Reload players
      const reloadResponse = await fetch(
        selectedTeam === "all"
          ? "/api/admin/players"
          : `/api/admin/players?team_id=${selectedTeam}`
      )
      const reloadData = await reloadResponse.json()
      if (reloadData.data) {
        setPlayers(reloadData.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Löschen")
      console.error("Error deleting player:", err)
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(playerId: string, file: File) {
    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("player_id", playerId)

      const response = await fetch("/api/admin/players/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Hochladen")
      }

      // Update photo_url in form
      setFormPhotoUrl(data.data.url)

      // Reload players
      const reloadResponse = await fetch(
        selectedTeam === "all"
          ? "/api/admin/players"
          : `/api/admin/players?team_id=${selectedTeam}`
      )
      const reloadData = await reloadResponse.json()
      if (reloadData.data) {
        setPlayers(reloadData.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Hochladen")
      console.error("Error uploading image:", err)
    } finally {
      setUploading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/access")
    router.refresh()
  }

  const filteredPlayers = players

  if (teamsLoading || loading) {
    return (
      <div className="min-h-screen bg-[#161616] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-white text-center py-20">Lädt...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161616] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
              className="mb-4 border-gray-700 text-gray-300 hover:bg-[#1E1E1E]"
            >
              ← Zurück zum Dashboard
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Spieler Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Verwalte Spieler, füge neue hinzu oder bearbeite bestehende
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={openAddDialog}
              variant="primary"
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              + Spieler hinzufügen
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E]"
            >
              Abmelden
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Filter */}
        <div className="bg-[#1E1E1E] rounded-lg p-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-400">Team filtern:</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="bg-[#161616] border-gray-700 text-white w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1E1E] border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-[#161616]">
                  Alle Teams
                </SelectItem>
                {teams.map((team) => (
                  <SelectItem
                    key={team.id}
                    value={team.id}
                    className="text-white hover:bg-[#161616]"
                  >
                    {team.flag_emoji} {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Spieler ({filteredPlayers.length})
          </h2>
          {filteredPlayers.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Keine Spieler gefunden
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="bg-[#161616] rounded-lg p-4 border border-gray-800"
                >
                  <div className="flex items-start gap-4">
                    {/* Player Image */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={player.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {player.jersey_number || "?"}
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">
                          {player.name}
                        </span>
                        {player.jersey_number && (
                          <span className="text-xs text-gray-400">
                            #{player.jersey_number}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {player.team.flag_emoji} {player.team.name}
                      </div>
                      {player.position && (
                        <div className="text-xs text-gray-500">{player.position}</div>
                      )}
                      {player.age && (
                        <div className="text-xs text-gray-500">{player.age} Jahre</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(player)}
                        className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E] text-xs"
                      >
                        Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(player.id)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Spieler hinzufügen</DialogTitle>
            <DialogDescription className="text-gray-400">
              Erstelle einen neuen Spieler
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Team *</label>
              <Select value={formTeamId} onValueChange={setFormTeamId}>
                <SelectTrigger className="bg-[#161616] border-gray-700">
                  <SelectValue placeholder="Team wählen" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-gray-700">
                  {teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      className="text-white hover:bg-[#161616]"
                    >
                      {team.flag_emoji} {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-[#161616] border-gray-700"
                placeholder="Spielername"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trikotnummer *
                </label>
                <Input
                  type="number"
                  value={formJerseyNumber}
                  onChange={(e) => setFormJerseyNumber(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alter</label>
                <Input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                  placeholder="25"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <Input
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                className="bg-[#161616] border-gray-700"
                placeholder="Spieler"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Foto URL</label>
              <Input
                value={formPhotoUrl}
                onChange={(e) => setFormPhotoUrl(e.target.value)}
                className="bg-[#161616] border-gray-700"
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="border-gray-700 text-gray-300 hover:bg-[#161616]"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName || !formJerseyNumber || !formTeamId}
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              {saving ? "Speichere..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1E1E1E] border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Spieler bearbeiten</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bearbeite Spielerdaten
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {editingPlayer && (
              <>
                {/* Current Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Aktuelles Foto</label>
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800">
                    {formPhotoUrl ? (
                      <Image
                        src={formPhotoUrl}
                        alt={editingPlayer.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {editingPlayer.jersey_number || "?"}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file && editingPlayer) {
                        handleImageUpload(editingPlayer.id, file)
                      }
                    }}
                    className="mt-2 text-sm text-gray-400"
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-xs text-gray-400 mt-1">Lädt hoch...</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="bg-[#161616] border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Trikotnummer *
                </label>
                <Input
                  type="number"
                  value={formJerseyNumber}
                  onChange={(e) => setFormJerseyNumber(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alter</label>
                <Input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  className="bg-[#161616] border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Position</label>
              <Input
                value={formPosition}
                onChange={(e) => setFormPosition(e.target.value)}
                className="bg-[#161616] border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Foto URL</label>
              <Input
                value={formPhotoUrl}
                onChange={(e) => setFormPhotoUrl(e.target.value)}
                className="bg-[#161616] border-gray-700"
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-gray-700 text-gray-300 hover:bg-[#161616]"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formName || !formJerseyNumber}
              className="bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
            >
              {saving ? "Speichere..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
