# Afrolink Cup 2026

Deutschsprachige Turnierplattform für den Afrolink Cup 2026 (17.01.2026).

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage)
- **UI**: shadcn/ui (optional, minimalistisch)

## Setup

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren:**
   ```bash
   cp .env.example .env.local
   ```
   
   Dann die Supabase-Credentials eintragen:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Development Server starten:**
   ```bash
   npm run dev
   ```

4. **Supabase TypeScript-Typen generieren:**
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
   ```

## Projektstruktur

```
/app                    # Next.js App Router Pages
  /(public)             # Öffentliche Fan-Views
  /(admin)/admin        # Admin-Panel
  /(arena)/arena        # Stadion-Ansicht
/components             # React-Komponenten
  /ui                   # UI-Basis-Komponenten
  /features             # Feature-spezifische Komponenten
/hooks                  # Custom React Hooks
/lib                    # Utilities und Supabase-Client
  /supabase             # Supabase-Client-Konfiguration
/types                  # TypeScript-Typen
/public                 # Statische Assets
/docs                   # Dokumentation
```

## Dokumentation

- `docs/architecture.md` - Architektur und Datenmodell
- `docs/rules.md` - Projekt-Richtlinien und Konventionen

## Design-System

- **Hintergrund**: `#161616`
- **Karten/Container**: `#1E1E1E`
- **Primärfarbe**: `#EEF757`
- **Font**: Mulish
- **Stil**: Minimalistisch, modern, abgerundete Kanten

