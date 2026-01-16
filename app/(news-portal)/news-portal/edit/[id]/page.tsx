"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Team, Match } from "@/types"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  body: string
  author_id: string
  match_id: string | null
  news_authors: { username: string }
  news_article_teams: { team_id: string }[]
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const articleId = params.id as string

  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [author, setAuthor] = useState("")
  const [matchId, setMatchId] = useState<string>("")
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [titleImageUrl, setTitleImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch article
        const response = await fetch(`/api/news-portal/articles/${articleId}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/news-portal/access")
            return
          }
          setError(data.error || "Fehler beim Laden")
          return
        }

        const articleData = data.data
        setArticle(articleData)
        setTitle(articleData.title)
        setBody(articleData.body)
        setAuthor(articleData.news_authors.username)
        setMatchId(articleData.match_id || "")
        setTitleImageUrl(articleData.title_image_url || "")
        setSelectedTeamIds(
          articleData.news_article_teams?.map((t: { team_id: string }) => t.team_id) || []
        )

        // Fetch teams
        const { data: teamsData } = await supabase
          .from("teams")
          .select("*")
          .order("name", { ascending: true })

        if (teamsData) setTeams(teamsData as Team[])

        // Fetch matches
        const { data: matchesData } = await supabase
          .from("matches")
          .select("*")
          .order("start_time", { ascending: false })

        if (matchesData) setMatches(matchesData as Match[])
      } catch (err) {
        setError("Ein Fehler ist aufgetreten")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [articleId, router, supabase])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/news-portal/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Fehler beim Hochladen")
        return
      }

      setTitleImageUrl(data.url)
    } catch (err) {
      setError("Fehler beim Hochladen des Bildes")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)

    if (!title || !body || !author) {
      setError("Titel, Text und Autor sind erforderlich")
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/news-portal/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          author_username: author,
          title_image_url: titleImageUrl || null,
          match_id: matchId === "none" || matchId === "" ? null : matchId,
          team_ids: selectedTeamIds,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/news-portal/access")
          return
        }
        setError(data.error || "Fehler beim Speichern")
        return
      }

      router.push("/news-portal")
    } catch (err) {
      setError("Ein Fehler ist aufgetreten")
    } finally {
      setSaving(false)
    }
  }

  function toggleTeam(teamId: string) {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161616] p-8">
        <div className="max-w-4xl mx-auto text-white">Lade Artikel...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#161616] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-400">Artikel nicht gefunden</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161616] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white hover:bg-[#1E1E1E]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <Card className="bg-[#1E1E1E] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Artikel bearbeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titel *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-[#161616] border-gray-700 text-white"
                  placeholder="Artikel-Titel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Titelbild
                </label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="bg-[#161616] border-gray-700 text-white"
                  />
                  {uploading && (
                    <p className="text-sm text-gray-400">Wird hochgeladen...</p>
                  )}
                  {titleImageUrl && (
                    <div className="mt-2">
                      <img
                        src={titleImageUrl}
                        alt="Vorschau"
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text *
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  rows={15}
                  className="bg-[#161616] border-gray-700 text-white"
                  placeholder="Artikel-Text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Autor/in *
                </label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="bg-[#161616] border-gray-700 text-white"
                  placeholder="Name des Autors/der Autorin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Spiel (optional)
                </label>
                <Select value={matchId || "none"} onValueChange={(value) => setMatchId(value === "none" ? "" : value)}>
                  <SelectTrigger className="bg-[#161616] border-gray-700 text-white">
                    <SelectValue placeholder="Spiel auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E1E] border-gray-700">
                    <SelectItem value="none">Kein Spiel</SelectItem>
                    {matches.map((match) => {
                      const homeTeam = teams.find((t) => t.id === match.team_home_id)
                      const awayTeam = teams.find((t) => t.id === match.team_away_id)
                      return (
                        <SelectItem key={match.id} value={match.id}>
                          {homeTeam?.name} vs {awayTeam?.name} -{" "}
                          {new Date(match.start_time).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teams (optional, mehrere möglich)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-700 rounded-lg bg-[#161616]">
                  {teams.map((team) => (
                    <label
                      key={team.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-[#1E1E1E] p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeamIds.includes(team.id)}
                        onChange={() => toggleTeam(team.id)}
                        className="rounded"
                      />
                      <span className="text-white text-sm">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90"
                >
                  {saving ? "Wird gespeichert..." : "Änderungen speichern"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto border-gray-700 text-white"
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
