"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Generate email from username (same as registration)
      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@afrolinkcup.example.com`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const user = data.user
      if (!user) {
        setError("Login fehlgeschlagen.")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        setError(profileError.message)
        return
      }

      if (!profile) {
        const username = user.user_metadata?.username
        if (!username) {
          setError("Profil nicht gefunden. Bitte registriere dich erneut.")
          return
        }

        const { error: insertError } = await supabase.from("user_profiles").insert({
          user_id: user.id,
          username,
        })

        if (insertError) {
          setError(insertError.message)
          return
        }
      }

      router.push("/")
    } catch (err) {
      setError("Ein Fehler ist aufgetreten.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Benutzername
              </label>
              <Input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Dein Benutzername"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Passwort
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Passwort"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird eingeloggt..." : "Anmelden"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            Noch kein Konto?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registrieren
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
