"use client"

import { useEffect, useState } from "react"
import { NewsArticleCard } from "./NewsArticleCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  created_at: string
  news_authors: { username: string }
}

interface NewsSectionProps {
  matchId?: string
  teamId?: string
  limit?: number
  showTitle?: boolean
  horizontal?: boolean
}

export function NewsSection({
  matchId,
  teamId,
  limit,
  showTitle = true,
  horizontal = false,
}: NewsSectionProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const params = new URLSearchParams()
        if (matchId) params.append("match_id", matchId)
        if (teamId) params.append("team_id", teamId)
        if (limit) params.append("limit", limit.toString())

        const response = await fetch(`/api/news-portal/articles?${params}`)
        const data = await response.json()

        if (response.ok && data.data) {
          setArticles(data.data.slice(0, limit || data.data.length))
        }
      } catch (err) {
        console.error("Error fetching news:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [matchId, teamId, limit])

  if (loading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-foreground">News</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {horizontal ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 w-80 flex-shrink-0 bg-card animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-card animate-pulse rounded-xl" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (articles.length === 0 && !loading) {
    // Don't show empty state on homepage if showTitle is false
    if (!showTitle) {
      return null
    }
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="text-foreground">News</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Noch keine Artikel vorhanden
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-foreground">News</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {horizontal ? (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-thin">
            <style jsx global>{`
              .overflow-x-auto::-webkit-scrollbar {
                height: 8px;
              }
              .overflow-x-auto::-webkit-scrollbar-track {
                background: transparent;
              }
              .overflow-x-auto::-webkit-scrollbar-thumb {
                background: hsl(var(--primary) / 0.3);
                border-radius: 4px;
              }
              .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                background: hsl(var(--primary) / 0.5);
              }
            `}</style>
            {articles.map((article) => (
              <div key={article.id} className="flex-shrink-0 w-80 snap-start">
                <NewsArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <NewsArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
