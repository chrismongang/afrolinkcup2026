"use client"

import Image from "next/image"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  created_at: string
  news_authors: { username: string }
}

interface ArenaNewsCardProps {
  article: NewsArticle
}

export function ArenaNewsCard({ article }: ArenaNewsCardProps) {
  return (
    <div className="bg-black/70 backdrop-blur-sm rounded-2xl w-full max-w-5xl overflow-hidden">
      {/* Titelbild */}
      <div className="relative w-full aspect-video bg-muted">
        {article.title_image_url ? (
          <Image
            src={article.title_image_url}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl md:text-7xl lg:text-8xl">
            📰
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 md:p-10 lg:p-12">
        {/* Titel */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
          {article.title}
        </h2>

        {/* Autor und Datum */}
        <div className="flex items-center gap-3 text-xl md:text-2xl lg:text-3xl text-white/80">
          <span>Von {article.news_authors.username}</span>
          <span>•</span>
          <span>
            {new Date(article.created_at).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  )
}
