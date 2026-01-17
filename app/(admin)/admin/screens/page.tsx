"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const VIEW_OPTIONS = [
  { value: "match", label: "Match (Standard)" },
  { value: "tabelle", label: "Tabelle" },
  { value: "torschuetzen", label: "Torschützen" },
  { value: "news", label: "News" },
  { value: "leaderboard", label: "Leaderboard" },
  { value: "ticker", label: "Live Ticker" },
  { value: "qr-code", label: "QR-Code" },
]

export default function AdminScreensPage() {
  const router = useRouter()
  const [screen1View, setScreen1View] = useState<string>("match")
  const [screen2View, setScreen2View] = useState<string>("match")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lade gespeicherte Konfiguration aus der Datenbank
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/admin/arena-screens")
        const data = await response.json()

        if (response.ok && data.data) {
          setScreen1View(data.data.screen1 || "match")
          setScreen2View(data.data.screen2 || "match")
        } else {
          setError("Fehler beim Laden der Konfiguration")
        }
      } catch (err) {
        setError("Fehler beim Laden der Konfiguration")
        console.error("Error loading config:", err)
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  // Speichere und sende Update
  const updateScreen = async (screen: "screen1" | "screen2", view: string) => {
    try {
      setSaving(true)
      setError(null)

      // Update State sofort für bessere UX
      if (screen === "screen1") {
        setScreen1View(view)
      } else {
        setScreen2View(view)
      }

      // Speichere in Datenbank
      const response = await fetch("/api/admin/arena-screens", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [screen]: view,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Speichern")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern")
      console.error("Error saving config:", err)
      // Revert State bei Fehler
      if (screen === "screen1") {
        setScreen1View(screen1View)
      } else {
        setScreen2View(screen2View)
      }
    } finally {
      setSaving(false)
    }
  }

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
              Arena Screen Steuerung
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Steuere die Ansichten für Screen 1 und Screen 2
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-[#1E1E1E]"
          >
            Abmelden
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Saving Indicator */}
        {saving && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
            <p className="text-blue-400 text-sm">Speichere...</p>
          </div>
        )}

        {/* Screen Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Screen 1 */}
          <div className="bg-[#1E1E1E] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Screen 1</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Aktuelle Ansicht
                </label>
                <Select
                  value={screen1View}
                  onValueChange={(value) => updateScreen("screen1", value)}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-[#161616] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    {VIEW_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-[#161616]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Vorschau URL:</p>
                <code className="text-xs text-gray-400 bg-[#161616] px-2 py-1 rounded">
                  /arena/screen1
                </code>
              </div>
            </div>
          </div>

          {/* Screen 2 */}
          <div className="bg-[#1E1E1E] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Screen 2</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Aktuelle Ansicht
                </label>
                <Select
                  value={screen2View}
                  onValueChange={(value) => updateScreen("screen2", value)}
                  disabled={saving}
                >
                  <SelectTrigger className="bg-[#161616] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    {VIEW_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-[#161616]"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Vorschau URL:</p>
                <code className="text-xs text-gray-400 bg-[#161616] px-2 py-1 rounded">
                  /arena/screen2
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Vorschau Section */}
        <div className="bg-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Vorschau</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Screen 1 zeigt:</p>
              <p className="text-lg font-semibold text-white">
                {VIEW_OPTIONS.find((opt) => opt.value === screen1View)?.label ||
                  "Unbekannt"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/arena/screen1", "_blank")}
                className="border-gray-700 text-gray-300 hover:bg-[#161616]"
              >
                Vorschau öffnen
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Screen 2 zeigt:</p>
              <p className="text-lg font-semibold text-white">
                {VIEW_OPTIONS.find((opt) => opt.value === screen2View)?.label ||
                  "Unbekannt"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/arena/screen2", "_blank")}
                className="border-gray-700 text-gray-300 hover:bg-[#161616]"
              >
                Vorschau öffnen
              </Button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-[#1E1E1E] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Info</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>
              • Änderungen werden sofort auf den Arena-Screens übernommen
            </p>
            <p>• Beide Screens können die gleiche Ansicht zeigen</p>
            <p>
              • Die Screens aktualisieren sich automatisch alle 2 Sekunden aus der Datenbank
            </p>
            <p>
              • Öffne /arena/screen1 und /arena/screen2 in separaten
              Browser-Fenstern für die Live-Ansicht
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
