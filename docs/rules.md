# Projekt-Richtlinien: Afrolink Cup 2026

## Tech Stack & Libraries

### Erlaubt

- **Frontend**: Next.js App Router, TypeScript, TailwindCSS
- **Backend**: Supabase (Postgres, Auth, Realtime, Storage)
- **UI-Library**: Minimalistische Libraries wie shadcn/ui erlaubt, aber nur wenn konsistent und schlicht
- **Icons**: Konsistente Icon-Library (z.B. lucide-react)

### Verboten

- Keine komplexen UI-Frameworks (z.B. Material-UI, Ant Design)
- Keine State-Management-Libraries ohne klaren Bedarf (Redux, Zustand nur wenn nötig)
- Keine generischen "Utils"-Libraries ohne spezifischen Zweck
- Keine neuen Tabellen/DB-Felder ohne vorherige Anpassung von `docs/architecture.md`

## Projektstruktur & Namenskonventionen

### Verzeichnisstruktur

```
/app                    # Next.js App Router Pages
  /(public)             # Öffentliche Fan-Views (ohne Login)
  /(admin)/admin        # Admin-Panel (nur für Admins)
  /(arena)/arena        # Stadion-Ansicht (öffentlich, für große Displays)
/components             # React-Komponenten
  /ui                   # UI-Basis-Komponenten (z.B. shadcn/ui)
  /features             # Feature-spezifische Komponenten
/hooks                  # Custom React Hooks
/lib                    # Utilities und Supabase-Client
  /supabase             # Supabase-Client-Konfiguration
/types                  # TypeScript-Typen
/public                 # Statische Assets
/docs                   # Dokumentation
```

### Namenskonventionen

- **Komponenten**: PascalCase (z.B. `MatchCard.tsx`, `TipForm.tsx`)
- **Hooks**: camelCase mit "use"-Prefix (z.B. `useMatchData.ts`, `useRealtimeUpdates.ts`)
- **Utilities**: camelCase (z.B. `calculatePoints.ts`, `formatMatchTime.ts`)
- **Typen/Interfaces**: PascalCase (z.B. `Match`, `Tip`, `UserProfile`)
- **Dateien**: Gleiche Konvention wie Export (Komponente → PascalCase, Hook → camelCase)
- **Verzeichnisse**: kebab-case für Feature-Gruppen (z.B. `match-details/`, `leaderboard/`)

### Code-Organisation

- **Kleine, gut benannte Komponenten**: Jede Komponente sollte einen klaren, spezifischen Zweck haben
- **Keine generischen Utils**: Jede Utility-Funktion muss einen klaren, dokumentierten Zweck haben
- **Feature-basierte Gruppierung**: Verwandte Komponenten/Hooks zusammen gruppieren

## Styling & UI-Regeln

### Design-System

**Farben:**
- Background: `#161616`
- Cards/Container: `#1E1E1E`
- Primary: `#EEF757`
- Text: Weiß/Grau (z.B. `#FFFFFF`, `#E5E5E5`, `#A0A0A0` für sekundären Text)

**Typografie:**
- Font: Mulish
- Font-Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

**Stil:**
- Minimalistisch und modern
- Leichte Rundungen (z.B. `rounded-lg`, `rounded-xl`)
- Klare Hierarchie durch Größen und Abstände
- Konsistente Abstände (Tailwind-Spacing-System)

### Komponenten-Patterns

- **Konsistente Abstände**: Nutze Tailwind-Spacing-System (p-4, gap-4, etc.)
- **Responsive Design**: Mobile-first Ansatz
- **Dark Mode**: Projekt ist grundsätzlich Dark Mode, keine Light-Mode-Variante
- **Zugänglichkeit**: Semantisches HTML, ARIA-Labels wo nötig

### UI-Library-Integration

- Wenn shadcn/ui verwendet wird: Alle Komponenten müssen an Design-System angepasst werden
- Keine Standard-Farben der Library verwenden, immer Projekt-Farben nutzen
- Komponenten sollten schlicht und minimalistisch bleiben

## Daten- & API-Regeln

### Supabase-Client

- **Client-Erstellung**: Zentraler Supabase-Client in `/lib/supabase/`
- **Server vs. Client**: Separate Clients für Server Components und Client Components
- **Type-Safety**: Nutze Supabase TypeScript-Generierung für Type-Safety
- **Fehlerhandling**: Immer try-catch bei Supabase-Operationen, sinnvolle Fehlermeldungen

### Realtime-Verwendung

- **Abonnements**: Nur für `match_events`, `matches` (Status/Score), `arena_display`
- **Cleanup**: Immer `unsubscribe()` in useEffect cleanup
- **Performance**: Nicht zu viele Channels gleichzeitig abonnieren
- **Fallback**: Bei Realtime-Fehlern auf Polling zurückfallen

### Datenbank-Zugriffe

- **Row Level Security (RLS)**: RLS-Policies für alle Tabellen definieren
- **Queries**: Nutze Supabase Query Builder, keine Raw SQL ohne Notwendigkeit
- **Optimistic Updates**: Wo sinnvoll (z.B. Tipp-Abgabe)
- **Caching**: Next.js Caching-Strategien nutzen (revalidate, cache)

### Fehlerhandling

- **User-freundliche Meldungen**: Keine technischen Fehlermeldungen an Nutzer
- **Logging**: Fehler server-seitig loggen, nicht client-seitig
- **Fallbacks**: Sinnvolle Fallback-UI bei Fehlern (z.B. "Daten konnten nicht geladen werden")

## UX- & Produktregeln

### Navigation

- **Mobile-first**: Burger-Menü statt Bottom-Navigation
- **Kern-Navigation im Burger-Menü**: "Live", "Spiele", "Teams", "Torjäger", "Leaderboard", "Über / Rules"
- **Responsive**: Navigation muss auf allen Bildschirmgrößen funktionieren
- **Aktive States**: Klare visuelle Indikatoren für aktive Route
- **Sprache**: Deutschsprachig (alle Texte, UI-Elemente, Fehlermeldungen)

### Auth & Profile

- **E-Mail Auth**: Supabase E-Mail-Authentifizierung (E-Mail + Passwort oder Magic Link)
- **Username**: Unique, nach Signup **nicht änderbar** (immutable, UI-Hinweis bei Erstellung)
- **Avatar**: Optional, entweder:
  - Preset-Maskottchen (8 Nationen-Maskottchen: nigeria, ghana, kamerun, kongo, senegal, togo, angola, marokko)
  - Eigenes Bild (Upload/Kamera) via Supabase Storage
  - Kein Avatar (`avatar_type = 'none'`)
- **Lieblings-Team**: Optional, kann später geändert werden
- **Session-Management**: Supabase Session-Handling nutzen

### Voting-Regeln

**Ergebnis-Tipp:**
- Exaktes Ergebnis: 4 Punkte
- Richtige Differenz: 3 Punkte
- Richtige Tendenz: 2 Punkte
- Falsch: 0 Punkte
- Tipps anonym erlaubt, aber nur Profile kommen ins Leaderboard
- Tippänderung nur bis Spielstart (Status nicht LIVE)
- Ein Tipp pro Match pro Nutzer/Session

**MVP-Voting:**
- Anonyme Votes erlaubt
- Ein Vote pro Match pro Nutzer/Session
- Begrenztes Zeitfenster nach Spielende: **10 Minuten** (Standard, Admin kann verlängern/vorzeitig schließen)
- Nur verfügbar wenn Match Status 'FINISHED' und innerhalb des Voting-Fensters

### Anonyme Nutzer

- **Session-ID**: Client-seitig generiert (UUID), im LocalStorage gespeichert
- **Zuordnung**: Beim Signup werden anonyme Tipps/Votes dem Profil zugeordnet
- **Leaderboard**: Anonyme Tipps zählen nicht für Leaderboard, nur für persönliche Statistik nach Zuordnung

### Admin vs. User

- **Admin-Bereich**: Separate Route `/admin` mit Admin-Checks
- **Admin-Interface**: 
  - **Mobile-optimiert** (handy-optimiert für Smartphones am Spielfeldrand)
  - **Parallel nutzbar** für mehrere Admins gleichzeitig
  - **Live-Konsole** für Event-Erfassung (Tor, Karte, etc.)
  - **Undo/Edit-Funktionen** für Events und Scores (Fehlerkorrektur)
  - **Manuelle Spielminute** bei Event-Erstellung (falls verzögert eingetragen)
- **Arena-Display**: Nur Admins können Display-Modus ändern
- **Match-Management**: Nur Admins können Matches/Events erstellen/bearbeiten
- **MVP-Voting-Steuerung**: Admin kann Voting-Fenster verlängern oder vorzeitig schließen
- **Moderation**: 
  - Admin kann Profilbilder aus Supabase Storage löschen
  - Admin kann Benutzerkonten löschen/anonymisieren
- **Rechte-Prüfung**: Server-seitige Prüfung der Admin-Rechte (Supabase RLS + Custom Checks)

### Arena-Screen

- **Route**: `/arena`
- **Modi**: 
  - `LIVE_MATCH`: Großes Scoreboard (Teams, Score, Minute/Status) + letzte Events + Branding-/QR-Leiste
  - `TABLE`: Gruppenstände A & B als große Tabellen (gut lesbare Schrift)
  - `SCORERS`: Top-Torschützen (Top 3 prominent, Rest kleiner)
  - `SCHEDULE`: Nächste Spiele (Namen, Uhrzeiten)
  - `MVP_PROMO`: After-Match-Hinweis auf MVP-Voting mit QR-Code zum Match
- **Steuerung**: Manuell durch Admin umschaltbar (keine automatische Rotation)
- **Realtime**: Abonniert `arena_display` für automatische Updates
- **Fullscreen**: Optimiert für große Displays (läuft im Vollbild auf Mac, Chrome/Safari)

### Allgemeine UX-Regeln

- **Loading States**: Immer Loading-Indikatoren bei Datenladevorgängen
- **Optimistic Updates**: Wo sinnvoll (z.B. Tipp-Abgabe)
- **Feedback**: Klare Bestätigungen bei Aktionen (z.B. "Tipp gespeichert")
- **Fehlerbehandlung**: User-freundliche Fehlermeldungen, keine technischen Details
- **CTAs**: 
  - Nach einem Tipp: "Jetzt Profil anlegen & im Leaderboard erscheinen"
  - Bei laufendem MVP-Voting: Countdown + "Jetzt deinen MVP wählen"
- **Performance**: Ziel: Unterstützung von bis zu **8.000 gleichzeitigen Nutzern** während Spitzenzeiten
- **Rate-Limiting**: 
  - Max. 1 Tipp/MVP-Vote pro Match pro Device/User
  - IP-basiertes Rate-Limiting gegen Spam

## TypeScript-Regeln

- **Kein `any`**: Immer typen-sicherer Code, `any` ist verboten
- **Strict Mode**: TypeScript strict mode aktiviert
- **Typen-Definitionen**: Alle Typen in `/types` oder direkt in Komponenten/Hooks
- **Supabase-Typen**: Nutze generierte Supabase-Typen für Datenbank-Schema

## Wie mit Erweiterungen umgehen

### Prozess für neue Features

1. **Architektur-Dokumentation**: Zuerst `docs/architecture.md` anpassen
   - Neue Tabellen/Felder dokumentieren
   - Neue Flows beschreiben
   - Constraints & Business Rules aktualisieren

2. **Richtlinien prüfen**: Prüfen ob neue Feature zu `docs/rules.md` passt
   - Neue Libraries? → In Tech Stack aufnehmen oder begründen warum nicht
   - Neue UI-Patterns? → In Styling-Regeln dokumentieren
   - Neue UX-Regeln? → In UX-Regeln aufnehmen

3. **Code-Implementierung**: Erst nach Dokumentation Code schreiben
   - Konsistent mit bestehenden Patterns
   - Type-Safe
   - Folgt Namenskonventionen

### Prozess für Bugfixes

- Keine Architektur-Änderungen ohne Dokumentation
- Kleine Bugfixes können direkt implementiert werden
- Größere Refactorings: Erst Architektur-Dokumentation prüfen/anpassen

### Prozess für neue Tabellen/Felder

- **Niemals** neue Tabellen/Felder anlegen ohne vorherige Anpassung von `docs/architecture.md`
- In Architektur-Dokumentation: Tabellen-Struktur, Beziehungen, Zweck dokumentieren
- Nach Implementierung: Dokumentation mit tatsächlicher Implementierung abgleichen

## Code-Qualität

- **Kleine Komponenten**: Komponenten sollten fokussiert und wiederverwendbar sein
- **DRY-Prinzip**: Code-Duplikation vermeiden, aber nicht um jeden Preis
- **Lesbarkeit**: Code sollte selbsterklärend sein, Kommentare nur wo nötig
- **Performance**: Keine vorzeitige Optimierung, aber sinnvolle Performance-Überlegungen (z.B. Realtime vs. Polling)

