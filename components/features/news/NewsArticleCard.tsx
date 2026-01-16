"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface NewsArticle {
  id: string
  title: string
  slug: string
  title_image_url: string | null
  created_at: string
  news_authors: { username: string }
}

interface NewsArticleCardProps {
  article: NewsArticle
}

export function NewsArticleCard({ article }: NewsArticleCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let the Link handle navigation naturally
    // Scroll will happen on the new page via useEffect
    // No need to preventDefault or use router.push
  }

  return (
    <Link href={`/news/${article.slug}`}>
      <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden h-full">
        <div className="relative w-full aspect-video bg-muted">
          {article.title_image_url ? (
            <Image
              src={article.title_image_url}
              alt={article.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              📰
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {article.title}
          </h3>
        </CardContent>
      </Card>
    </Link>
  )
}
