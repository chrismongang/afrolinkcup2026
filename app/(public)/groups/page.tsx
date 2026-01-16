"use client"

import { useGroups } from "@/hooks/useGroups"
import { GroupTableCard } from "@/components/features/groups/GroupTableCard"

export default function GroupsPage() {
  const { groupA, groupB, loading, error } = useGroups()

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <h1 className="text-3xl font-bold text-foreground">Gruppen</h1>
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-destructive text-lg">
              Fehler beim Laden der Gruppen: {error.message}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Gruppen</h1>

        <div className="space-y-8">
          {groupA && <GroupTableCard groupData={groupA} />}
          {groupB && <GroupTableCard groupData={groupB} />}
        </div>
      </div>
    </main>
  )
}
