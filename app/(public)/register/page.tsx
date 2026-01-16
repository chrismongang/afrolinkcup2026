"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Generate email from username (Supabase Auth requires email)
      // Using example.com domain (reserved for examples, valid format but not real)
      const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@afrolinkcup.example.com`

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user && data.session) {
        const { error: profileError } = await supabase.from("user_profiles").insert({
          user_id: data.user.id,
          username,
          avatar_url: "/images/default_profilpic.png",
        })

        if (profileError) {
          setError(profileError.message)
          return
        }

        router.push("/")
        return
      }

      setSuccess("Registrierung erfolgreich! Du wirst weitergeleitet...")
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
          <CardTitle>Registrieren</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Benutzername *
              </label>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Dein Benutzername"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Passwort *
              </label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Passwort"
                autoComplete="new-password"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-foreground bg-muted rounded-lg p-3">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird erstellt..." : "Registrieren"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            Du hast bereits ein Konto?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Anmelden
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
