"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, LogOut, Edit, Trash2 } from "lucide-react"
import Image from "next/image"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  body: string
  created_at: string
  news_authors: { username: string }
  news_article_teams: { team_id: string }[]
  match_id: string | null
}

export default function NewsPortalDashboard() {
  const router = useRouter()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    try {
      const response = await fetch("/api/news-portal/articles")
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/news-portal/access")
          return
        }
        setError(data.error || "Fehler beim Laden der Artikel")
        setArticles([]) // Set empty array on error
        return
      }

      setArticles(data.data || [])
      setError("") // Clear error on success
    } catch (err) {
      console.error("Error fetching articles:", err)
      setError("Ein Fehler ist aufgetreten. Bitte prüfe die Konsole.")
      setArticles([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/news-portal/logout", { method: "POST" })
    router.push("/news-portal/access")
  }

  async function handleDelete(id: string) {
    if (!confirm("Artikel wirklich löschen?")) return

    try {
      const response = await fetch(`/api/news-portal/articles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        alert("Fehler beim Löschen")
        return
      }

      fetchArticles()
    } catch (err) {
      alert("Ein Fehler ist aufgetreten")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161616] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-white">Lade Artikel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#161616] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">News Portal</h1>
            <p className="text-gray-400 text-sm sm:text-base">Artikel verwalten</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/news-portal/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#EEF757] text-[#161616] hover:bg-[#EEF757]/90">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Artikel
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full sm:w-auto border-gray-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Articles List */}
        {articles.length === 0 ? (
          <Card className="bg-[#1E1E1E] border-gray-800">
            <CardContent className="p-8 text-center text-gray-400">
              Noch keine Artikel vorhanden. Erstelle deinen ersten Artikel!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="bg-[#1E1E1E] border-gray-800">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {article.title_image_url && (
                      <div className="relative w-full sm:w-32 h-48 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={article.title_image_url}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        Von {article.news_authors.username} •{" "}
                        {new Date(article.created_at).toLocaleDateString("de-DE")}
                      </p>
                      <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                        {article.body.substring(0, 150)}...
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={`/news-portal/edit/${article.id}`} className="flex-1 sm:flex-initial">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto border-gray-700 text-white"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                          className="w-full sm:w-auto border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Löschen
                        </Button>
                        <Link href={`/news/${article.slug}`} target="_blank" className="flex-1 sm:flex-initial">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto border-gray-700 text-white">
                            Ansehen
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
