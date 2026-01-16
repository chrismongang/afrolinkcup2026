"use client"

import { useEffect, useState, useMemo } from "react"
import { ArenaNewsCard } from "@/components/features/news/ArenaNewsCard"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  created_at: string
  news_authors: { username: string }
}

export default function ArenaNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)

  // Lade News-Artikel
  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/news-portal/articles`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()

        if (data.data && Array.isArray(data.data)) {
          // Sortiere nach created_at (neueste zuerst)
          const sortedArticles = [...data.data].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          setArticles(sortedArticles)
        } else {
          // Keine Artikel vorhanden, aber kein Fehler
          setArticles([])
        }
      } catch (err) {
        setError("Fehler beim Laden der News")
        console.error("Error fetching news:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()

    // Polling: Lade News alle 30 Sekunden neu
    const interval = setInterval(() => {
      fetchArticles()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Wechsle alle 30 Sekunden zum nächsten Artikel
  useEffect(() => {
    if (articles.length <= 1) return

    const interval = setInterval(() => {
      setCurrentArticleIndex((prev) => (prev + 1) % articles.length)
    }, 30000) // 30 Sekunden

    return () => clearInterval(interval)
  }, [articles.length])

  // Zeige Fehler nach 10 Sekunden Loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowError(true)
      }, 10000)

      return () => clearTimeout(timer)
    } else {
      setShowError(false)
    }
  }, [loading])

  // Automatisch Vollbild beim Laden
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch (error) {
        // Fehler beim Vollbild ignorieren (z.B. wenn nicht erlaubt)
        console.log("Vollbild konnte nicht aktiviert werden:", error)
      }
    }

    enterFullscreen()
  }, [])

  // Zeige Fehler oder Timeout
  if (error || showError) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        {/* Hintergrundbild - unoptimiert für volle Qualität */}
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Fehler State */}
        <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
          <p className="mb-8">
            {showError
              ? "Verbindung zu langsam. Bitte Seite neu laden."
              : "Fehler beim Laden der Daten."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 py-4 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-2xl md:text-3xl font-semibold"
          >
            Seite neu laden
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        {/* Hintergrundbild - unoptimiert für volle Qualität */}
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Loading State */}
        <div className="relative z-10 text-white text-4xl md:text-6xl">Lade...</div>
      </div>
    )
  }

  // Fallback: Keine News
  if (articles.length === 0) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center">
        {/* Hintergrundbild - unoptimiert für volle Qualität */}
        <div className="absolute inset-0">
          <img
            src="/sceen_bg.png"
            alt="Arena Hintergrund"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Keine News */}
        <div className="relative z-10 text-white text-4xl md:text-6xl text-center px-8">
          Keine News
        </div>
      </div>
    )
  }

  // Zeige aktuellen Artikel
  const currentArticle = articles[currentArticleIndex]

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
      {/* Hintergrundbild - unoptimiert für volle Qualität */}
      <div className="absolute inset-0">
        <img
          src="/sceen_bg.png"
          alt="Arena Hintergrund"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content-Bereich: Groß und zentriert für gute Lesbarkeit von den Tribünen */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8">
        <div className="w-full h-full flex items-center justify-center">
          <ArenaNewsCard article={currentArticle} />
        </div>
      </div>
    </div>
  )
}
