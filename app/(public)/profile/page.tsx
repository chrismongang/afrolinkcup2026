"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useUserProfile } from "@/hooks/useUserProfile"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils/format"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { profile, tips, loading, error } = useUserProfile()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push("/")
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleDelete = async () => {
    if (!profile) return

    setIsDeleting(true)
    try {
      // Delete avatar from storage if it's not the default
      if (profile.avatar_url && !profile.avatar_url.includes("default_profilpic.png")) {
        try {
          // Extract filename from URL
          const urlParts = profile.avatar_url.split("/")
          const fileName = urlParts[urlParts.length - 1]
          if (fileName) {
            await supabase.storage.from("avatars").remove([fileName])
          }
        } catch (storageError) {
          console.error("Error deleting avatar:", storageError)
          // Continue with profile deletion even if avatar deletion fails
        }
      }

      // Delete user profile (this will cascade delete tips due to ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", profile.id)

      if (deleteError) throw deleteError

      // Sign out and delete auth user
      await supabase.auth.signOut()

      // Redirect to home
      router.push("/")
    } catch (err) {
      console.error("Error deleting profile:", err)
      alert("Fehler beim Löschen des Profils")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("Error logging out:", err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="h-32 bg-card animate-pulse rounded-xl" />
                <div className="h-64 bg-card animate-pulse rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive text-lg">
                {error ? `Fehler: ${error.message}` : "Profil nicht gefunden"}
              </p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Zur Startseite
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const avatarUrl = profile.avatar_url || "/images/default_profilpic.png"
  const totalTips = tips.length

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border">
                <Image
                  src={avatarUrl}
                  alt={profile.username}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.username}</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.created_at && `Registriert am ${formatDate(profile.created_at)}`}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtpunkte</p>
                <p className="text-3xl font-bold text-foreground">{profile.total_points}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abgegebene Tipps</p>
                <p className="text-3xl font-bold text-foreground">{totalTips}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Meine Tipps</CardTitle>
          </CardHeader>
          <CardContent>
            {tips.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Tipps abgegeben
              </p>
            ) : (
              <div className="space-y-4">
                {tips.map((tip) => {
                  const match = tip.match as any
                  return (
                    <Link
                      key={tip.id}
                      href={`/matches/${tip.match_id}`}
                      className="block"
                    >
                      <Card className="transition-colors hover:bg-card/80 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{match.team_home.flag_emoji}</span>
                                <span className="font-semibold text-foreground">
                                  {match.team_home.short_name}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className="font-semibold text-foreground">
                                  {match.team_away.short_name}
                                </span>
                                <span className="text-xl">{match.team_away.flag_emoji}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  Dein Tipp: {tip.predicted_home_score} : {tip.predicted_away_score}
                                </p>
                                {tip.points !== null && tip.points !== undefined && (
                                  <p className="mt-1">
                                    Punkte:{" "}
                                    <span className="font-semibold text-foreground">
                                      {tip.points}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                            {tip.points !== null && tip.points !== undefined && (
                              <div className="text-2xl font-bold text-primary ml-4">
                                {tip.points}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Aktionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full"
            >
              {isLoggingOut ? "Wird abgemeldet..." : "Abmelden"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="w-full"
            >
              Profil löschen
            </Button>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profil löschen?</DialogTitle>
              <DialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Dein Profil und alle deine
                Tipps werden permanent gelöscht.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Abbrechen
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Wird gelöscht..." : "Löschen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
