"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  body: string
  created_at: string
  news_authors: { username: string }
}

type Props = {
  params: { slug: string }
}

export default function NewsArticlePage({ params }: Props) {
  const router = useRouter()
  const { slug } = params
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    async function fetchArticle() {
      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from("news_articles")
          .select(`
            *,
            news_authors!inner(username)
          `)
          .eq("slug", slug)
          .single()

        if (fetchError) {
          setError("Artikel nicht gefunden")
          return
        }

        setArticle(data as NewsArticle)
      } catch (err) {
        setError("Ein Fehler ist aufgetreten")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  const handleShare = async () => {
    const url = `${window.location.origin}/news/${slug}`

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || "Afrolink Cup 2026 - News",
          text: article?.title || "",
          url: url,
        })
        return
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      alert("Link in Zwischenablage kopiert!")
    } catch (err) {
      console.error("Error copying to clipboard:", err)
      alert(`Link: ${url}`)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <nav className="w-full pt-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-foreground hover:bg-accent"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Zurück</span>
              </Button>
              <h1 className="text-sm font-semibold text-foreground uppercase absolute left-1/2 transform -translate-x-1/2">
                AFROLINK CUP 2026
              </h1>
              <div className="w-10" />
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="h-64 bg-card animate-pulse rounded-xl" />
        </div>
      </main>
    )
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-background">
        <nav className="w-full pt-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-foreground hover:bg-accent"
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Zurück</span>
              </Button>
              <h1 className="text-sm font-semibold text-foreground uppercase absolute left-1/2 transform -translate-x-1/2">
                AFROLINK CUP 2026
              </h1>
              <div className="w-10" />
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">{error || "Artikel nicht gefunden"}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="w-full pt-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-foreground hover:bg-accent"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Zurück</span>
            </Button>

            <h1 className="text-sm font-semibold text-foreground uppercase absolute left-1/2 transform -translate-x-1/2">
              AFROLINK CUP 2026
            </h1>

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

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="space-y-6">
          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground">{article.title}</h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span>
              {new Date(article.created_at).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" um "}
              {new Date(article.created_at).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>•</span>
            <span>{article.news_authors.username}</span>
          </div>

          {/* Title Image */}
          {article.title_image_url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <Image
                src={article.title_image_url}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="prose prose-invert max-w-none">
            <div
              className="text-foreground whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.body.replace(/\n/g, "<br />") }}
            />
          </div>
        </article>
      </div>
    </main>
  )
}
