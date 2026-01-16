# Deployment Guide

## GitHub & Vercel Deployment

### Voraussetzungen
- GitHub Account
- Vercel Account (kostenlos)
- Supabase Projekt mit allen Migrationen ausgeführt

### Schritt 1: GitHub Repository

1. Repository wurde bereits erstellt: https://github.com/chrismongang/afrolinkcup2026
2. Code wurde gepusht

### Schritt 2: Vercel Deployment

1. Gehe zu https://vercel.com
2. Klicke auf "Add New..." → "Project"
3. Importiere das Repository `chrismongang/afrolinkcup2026`
4. Setze folgende Environment Variables:

#### Environment Variables (in Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=deine-supabase-anon-key
ADMIN_PASSWORD=dein-admin-passwort
NEWS_PORTAL_PASSWORD=dein-news-portal-passwort
```

**Wichtig:**
- `NEXT_PUBLIC_*` Variablen für alle Environments (Production, Preview, Development)
- `ADMIN_PASSWORD` und `NEWS_PORTAL_PASSWORD` nur für Production (oder alle, wenn gewünscht)

5. Klicke auf "Deploy"
6. Warte auf erfolgreichen Build

### Schritt 3: Supabase CORS konfigurieren

1. Gehe zu Supabase Dashboard → Settings → API
2. Füge zu "Additional Allowed Origins" hinzu:
   - `https://afrolinkcup2026.vercel.app`
   - `https://*.vercel.app` (für Preview-Deployments)

### Schritt 4: Testen

- Öffne die Vercel-URL
- Teste wichtige Funktionen:
  - Homepage lädt
  - Registrierung funktioniert
  - Login funktioniert
  - Matches werden angezeigt
  - Tipps können abgegeben werden
