"use client"

import { LiveMatchesSection } from "@/components/features/matches/LiveMatchesSection"
import { UpcomingMatchesSection } from "@/components/features/matches/UpcomingMatchesSection"
import { useGroups } from "@/hooks/useGroups"
import { GroupTableCard } from "@/components/features/groups/GroupTableCard"
import { NewsSection } from "@/components/features/news/NewsSection"
import { TopScorersSection } from "@/components/features/scorers/TopScorersSection"
import { TopLeaderboardSection } from "@/components/features/leaderboard/TopLeaderboardSection"
import { Footer } from "@/components/features/navigation/Footer"
import Image from "next/image"

export default function Home() {
  const { groupA, groupB, loading, error } = useGroups()

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Full Width */}
      <section className="text-center space-y-4 bg-primary py-8 w-full">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/AfroLink-Logo_black.png"
            alt="Afrolink Logo"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Live Matches - Prominent */}
        <section>
          <LiveMatchesSection />
        </section>

        {/* Upcoming Matches */}
        <section>
          <UpcomingMatchesSection />
        </section>

        {/* Gruppen Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Gruppen</h2>
          
          {loading ? (
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-96 bg-card animate-pulse rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-destructive text-lg">
                Fehler beim Laden der Gruppen: {error.message}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupA && <GroupTableCard groupData={groupA} />}
              {groupB && <GroupTableCard groupData={groupB} />}
            </div>
          )}
        </section>

        {/* Top Torschützen Section */}
        <section>
          <TopScorersSection />
        </section>

        {/* Top Leaderboard Section */}
        <section>
          <TopLeaderboardSection />
        </section>

        {/* News Section - Articles without specific match/team */}
        <NewsSection limit={6} horizontal={true} />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}

