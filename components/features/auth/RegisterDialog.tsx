"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

interface RegisterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RegisterDialog({ open, onOpenChange, onSuccess }: RegisterDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Nur Bilddateien sind erlaubt")
      return
    }

    setAvatarFile(file)
    setError("")

    // Create preview and crop to 1:1
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        // Calculate crop dimensions for 1:1
        const size = Math.min(img.width, img.height)
        const x = (img.width - size) / 2
        const y = (img.height - size) / 2

        // Create canvas and crop
        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, x, y, size, size, 0, 0, size, size)
          const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9)
          setAvatarPreview(croppedDataUrl)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Generate email from username (Supabase Auth requires email)
      // Using example.com domain (reserved for examples, valid format but not real)
      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@afrolinkcup.example.com`

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError("Registrierung fehlgeschlagen")
        setLoading(false)
        return
      }

      // Upload avatar if provided
      let avatarUrl = "/images/default_profilpic.png"
      if (avatarFile && avatarPreview) {
        try {
          // Convert data URL to blob
          const response = await fetch(avatarPreview)
          const blob = await response.blob()

          // Upload to Supabase Storage
          const timestamp = Date.now()
          const randomString = Math.random().toString(36).substring(2, 15)
          const fileName = `${authData.user.id}-${timestamp}-${randomString}.jpg`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, blob, {
              contentType: "image/jpeg",
              upsert: false,
            })

          if (uploadError) {
            console.error("Avatar upload error:", uploadError)
            // Continue with default avatar
          } else {
            const {
              data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(fileName)
            avatarUrl = publicUrl
          }
        } catch (uploadErr) {
          console.error("Avatar upload error:", uploadErr)
          // Continue with default avatar
        }
      }

      // Create user profile
      const { error: profileError } = await supabase.from("user_profiles").insert({
        user_id: authData.user.id,
        username,
        avatar_url: avatarUrl,
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      // Success - user is automatically logged in
      setLoading(false)
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      } else {
        router.refresh()
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten")
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setUsername("")
      setPassword("")
      setAvatarFile(null)
      setAvatarPreview(null)
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrieren</DialogTitle>
          <DialogDescription>
            Erstelle ein Konto, um Tipps abzugeben und am Leaderboard teilzunehmen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Benutzername *
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Dein Benutzername"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Passwort *
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              autoComplete="new-password"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Profilbild (optional)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Dieses Bild erscheint im Leaderboard
            </p>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
              />
              {avatarPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border">
                  <Image
                    src={avatarPreview}
                    alt="Profilbild Vorschau"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                    }}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-border bg-muted hover:bg-muted/80 flex items-center justify-center text-3xl text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Wird erstellt..." : "Registrieren"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
