# Architektur: Afrolink Cup 2026

## Overview

Die Afrolink Cup 2026 App ist eine **deutschsprachige, einmalige Turnierplattform** für ein eintägiges Fußballturnier (17.01.2026) mit 8 Teams. Sie dient als **mobiler Live-Hub für Zuschauer im BMW Park** und bietet zusätzlich eine **Arena-Ansicht für die großen Screens**. Die App ermöglicht Fans die Verfolgung von Live-Spielen, das Abgeben von Ergebnis-Tipps und das Voten für MVP-Spieler. Die App nutzt Next.js mit App Router, TypeScript und TailwindCSS für das Frontend sowie Supabase als Backend-as-a-Service für Datenbank, Authentifizierung, Realtime-Updates und Datei-Speicherung. Alle Fan-Seiten sind öffentlich zugänglich, während Login und Profil nur für die Teilnahme am Leaderboard erforderlich sind.

**Turnier-Details:**
- Datum: 17.01.2026
- Format: Eintagesturnier
- Teams: 8 Teams
- Struktur: 2 Gruppen (A & B) mit je 4 Teams, KO-Phase mit Halbfinals und Finale
- Spieldauer: Gruppenspiele 10 Minuten ohne Halbzeit, Halbfinale & Finale mit Halbzeit

## Domain & Scope

**Teilnehmende Teams:**

**Gruppe A:**
- Kamerun
- Togo
- Angola
- Senegambia

**Gruppe B:**
- Ghana
- Nigeria
- Kongo
- Maghreb/Marokko

**Was diese App kann:**
- Live-Ticker für alle Spiele mit Match-Events (Tore, Karten, etc.)
- Ergebnis-Tipp-System mit 4/3/2/0-Punktesystem
- MVP-Voting pro Match mit zeitlich begrenztem Fenster nach Spielende
- Anonyme Tipps und MVP-Votes (spätere Zuordnung zu Profil möglich)
- Globales Leaderboard basierend auf Tipp-Punkten
- Arena-Display-Screen mit verschiedenen Anzeige-Modi
- Gruppenphase und KO-Phase mit unterschiedlichen Match-Status-Logiken
- Automatische Berechnung von Gruppen-Tabellen (Sp, P, S, U, N, T, GT, TD)

**Was diese App bewusst NICHT kann:**
- Mehrere Turniere gleichzeitig
- Mehrere Turniertage
- Team-Management oder Spieler-Verwaltung durch Nutzer
- Chat oder Social-Features
- Historische Daten aus vorherigen Turnieren
- Generischer Turnier-Editor (Turnierstruktur ist fest im Code definiert)

## Data Model

### Tabellen

#### `teams`
- `id` (UUID, PK): Eindeutige Team-ID
- `name` (String): Team-Name
- `short_name` (String): Kurzform für Anzeige
- `flag_emoji` (String): Flaggen-Emoji
- `team_slug` (String, unique): Kurz-URL-Slug (z.B. 'nigeria')
- `group` (String): Gruppenbezeichnung (A oder B)
- `colors` (String/JSON, nullable): Team-Farben (z.B. für Branding)
- `mascot_key` (String, nullable): Key für Preset-Maskottchen (z.B. 'nigeria', 'ghana', etc.)
- `created_at` (Timestamp): Erstellungszeitpunkt

#### `players`
- `id` (UUID, PK): Eindeutige Spieler-ID
- `team_id` (UUID, FK → teams.id): Zugehöriges Team
- `name` (String): Spieler-Name
- `age` (Integer, nullable): Alter des Spielers
- `jersey_number` (Integer): Trikotnummer
- `position` (String): Position
- `photo_url` (String, nullable): Foto-URL (mit Default-Avatar falls null)
- `created_at` (Timestamp): Erstellungszeitpunkt

#### `matches`
- `id` (UUID, PK): Eindeutige Match-ID
- `team_home_id` (UUID, FK → teams.id): Heim-Team
- `team_away_id` (UUID, FK → teams.id): Auswärts-Team
- `stage` (String): 'GROUP', 'SEMIFINAL', 'FINAL'
- `group` (String, nullable): Gruppenbezeichnung (nur bei GROUP)
- `start_time` (Timestamp): Geplante Startzeit
- `status` (String): Status-Werte (siehe Match-Status-Logik)
- `score_home` (Integer, default: 0): Heim-Tore
- `score_away` (Integer, default: 0): Auswärts-Tore
- `score_home_penalties` (Integer, nullable): Heim-Elfmeter (nur KO)
- `score_away_penalties` (Integer, nullable): Auswärts-Elfmeter (nur KO)
- `mvp_voting_start` (Timestamp, nullable): Start des MVP-Voting-Fensters
- `mvp_voting_end` (Timestamp, nullable): Ende des MVP-Voting-Fensters
- `mvp_player_id` (UUID, nullable, FK → players.id): Gewählter MVP-Spieler
- `created_at` (Timestamp): Erstellungszeitpunkt

**Beziehungen:**
- `team_home_id` → `teams.id`
- `team_away_id` → `teams.id`

#### `match_events`
- `id` (UUID, PK): Eindeutige Event-ID
- `match_id` (UUID, FK → matches.id): Zugehöriges Match
- `player_id` (UUID, FK → players.id, nullable): Verantwortlicher Spieler
- `team_id` (UUID, FK → teams.id): Betroffenes Team
- `type` (String): Event-Typ (siehe Event-Typen)
- `minute` (Integer): Spielminute (Admin kann manuell anpassen)
- `description` (String, nullable): Zusätzliche Beschreibung
- `created_at` (Timestamp): Erstellungszeitpunkt
- `updated_at` (Timestamp): Letzte Änderung (für Undo/Edit)

**Event-Typen:**
- `GOAL`: Tor
- `OWN_GOAL`: Eigentor
- `ASSIST`: Torvorlage (als Attribut zum Tor)
- `YELLOW`: Gelbe Karte
- `RED`: Rote Karte
- `START`: Spielstart
- `HT`: Halbzeit
- `FT`: Spielende
- `ET_START`: Verlängerung beginnt
- `PEN_START`: Elfmeterschießen beginnt
- `SUBSTITUTION`: Auswechslung (optional)

**Beziehungen:**
- `match_id` → `matches.id`
- `player_id` → `players.id`
- `team_id` → `teams.id`

#### `user_profiles`
- `id` (UUID, PK): Eindeutige Profil-ID (verknüpft mit Supabase Auth)
- `user_id` (UUID, FK → auth.users.id): Supabase Auth User-ID
- `username` (String, unique, immutable): Benutzername (nach Erstellung nicht änderbar)
- `favorite_team_id` (UUID, nullable, FK → teams.id): Lieblings-Team
- `avatar_type` (String): 'preset' | 'custom' | 'none'
- `avatar_key` (String, nullable): Preset-Key (z.B. 'nigeria') oder Storage-URL für Custom-Avatar
- `anonymous_session_id` (String, nullable): Session-ID für anonyme Zuordnung
- `total_points` (Integer, default: 0): Gesamtpunktzahl aus Tipps
- `created_at` (Timestamp): Erstellungszeitpunkt (für Tie-Breaking im Leaderboard)

**Beziehungen:**
- `user_id` → `auth.users.id`

#### `tips`
- `id` (UUID, PK): Eindeutige Tipp-ID
- `match_id` (UUID, FK → matches.id): Zugehöriges Match
- `user_profile_id` (UUID, FK → user_profiles.id, nullable): Profil (null bei anonymen Tipps)
- `anonymous_session_id` (String, nullable): Session-ID für anonyme Tipps
- `predicted_home_score` (Integer): Getippte Heim-Tore
- `predicted_away_score` (Integer): Getippte Auswärts-Tore
- `points` (Integer, nullable): Erreichte Punkte (4/3/2/0, berechnet nach Spielende)
- `created_at` (Timestamp): Erstellungszeitpunkt
- `updated_at` (Timestamp): Letzte Änderung

**Constraints:**
- Pro Match + (user_profile_id oder anonymous_session_id) nur ein Datensatz

**Beziehungen:**
- `match_id` → `matches.id`
- `user_profile_id` → `user_profiles.id`

#### `mvp_votes`
- `id` (UUID, PK): Eindeutige Vote-ID
- `match_id` (UUID, FK → matches.id): Zugehöriges Match
- `player_id` (UUID, FK → players.id): Gewählter Spieler
- `user_profile_id` (UUID, FK → user_profiles.id, nullable): Profil (null bei anonymen Votes)
- `anonymous_session_id` (String, nullable): Session-ID für anonyme Votes
- `created_at` (Timestamp): Erstellungszeitpunkt

**Beziehungen:**
- `match_id` → `matches.id`
- `player_id` → `players.id`
- `user_profile_id` → `user_profiles.id`

#### `arena_display`
- `id` (UUID, PK): Eindeutige Display-ID (Singleton-Pattern, nur ein Datensatz)
- `mode` (String): Aktueller Anzeige-Modus ('LIVE_MATCH', 'TABLE', 'SCORERS', 'SCHEDULE', 'MVP_PROMO')
- `match_id` (UUID, FK → matches.id, nullable): Aktuelles Match (für LIVE_MATCH)
- `updated_at` (Timestamp): Letzte Änderung
- `updated_by` (UUID, nullable): Admin-User-ID

**Beziehungen:**
- `match_id` → `matches.id`

## Core Application Flows

### Live-Ticker-Flow

1. Admin erstellt Match-Events über **mobile-optimiertes Admin-Interface** (handy-optimiert, parallel nutzbar für mehrere Admins)
2. Admin kann Spielminute manuell anpassen (falls Event verzögert eingetragen wird)
3. Event wird in `match_events` gespeichert
4. Supabase Realtime Channel `match_events` sendet Update an alle abonnierte Clients
5. Fan-Seiten empfangen Update und aktualisieren Live-Ticker in Echtzeit
6. Match-Status wird automatisch oder manuell durch Admin aktualisiert
7. **Undo/Edit**: Admin kann Events und Scores editieren oder löschen, um Fehler zu korrigieren

### Ergebnis-Tipp-Flow

1. Nutzer wählt Match auf Tipp-Seite
2. Nutzer gibt Tipp ab (Heim- und Auswärts-Tore)
3. System prüft: Existiert bereits ein Tipp für dieses Match von diesem Nutzer/Session?
4. System prüft: Ist Match-Status noch 'SCHEDULED'? (Tippänderung nur bis Anpfiff)
5. Tipp wird in `tips` gespeichert (mit `user_profile_id` oder `anonymous_session_id`)
6. Nach Spielende: System berechnet Punkte automatisch (analog CHECK24 EM-Tippspiel):
   - **4 Punkte**: Exaktes Ergebnis korrekt (z.B. Tipp 2:1, Ergebnis 2:1)
   - **3 Punkte**: Richtige Tordifferenz + richtige Tendenz (z.B. Tipp 2:1, Ergebnis 3:2) ODER Unentschieden korrekt als "Remis" (z.B. Tipp 1:1, Ergebnis 2:2)
   - **2 Punkte**: Richtige Tendenz (richtiger Sieger, aber falsche Tordifferenz, z.B. Tipp 2:1, Ergebnis 1:0)
   - **0 Punkte**: Falsche Tendenz (z.B. Tipp 2:1, Ergebnis 0:2)
7. `points` wird in `tips` aktualisiert
8. `total_points` in `user_profiles` wird aktualisiert (nur für nicht-anonyme Tipps)
9. Leaderboard wird automatisch aktualisiert

### MVP-Flow

1. Match endet (Status → 'FINISHED')
2. System setzt automatisch `mvp_voting_start` (aktueller Zeitpunkt) und `mvp_voting_end` (aktueller Zeitpunkt + 10 Minuten)
3. MVP-Voting-Fenster öffnet sich für **10 Minuten** (Standard)
4. Admin kann im Admin-Panel das Fenster manuell verlängern oder vorzeitig schließen (aktualisiert `mvp_voting_end`)
5. Nutzer wählt MVP-Spieler aus Liste der Spieler beider Teams
6. System prüft: Existiert bereits ein Vote für dieses Match von diesem Nutzer/Session?
7. System prüft: Ist aktueller Zeitpunkt innerhalb von `mvp_voting_start` und `mvp_voting_end`?
8. Vote wird in `mvp_votes` gespeichert (mit `user_profile_id` oder `anonymous_session_id`)
9. Nach Ablauf des Voting-Fensters: System berechnet Turnier-MVP
10. **Turnier-MVP-Berechnung**: Gewichtung nach Phase:
    - Gruppenphase: Faktor **1.0**
    - Halbfinals: Faktor **1.5**
    - Finale: Faktor **2.0**
11. Spieler mit höchster gewichteter Vote-Anzahl wird Turnier-MVP

### Anonymous → Profile-Zuordnung

1. Anonymer Nutzer gibt Tipps/Votes ab → `anonymous_session_id` wird gespeichert
2. Nutzer registriert sich später → `user_profile` wird erstellt
3. Beim Signup: System sucht alle `tips` und `mvp_votes` mit passender `anonymous_session_id`
4. System aktualisiert diese Einträge: `anonymous_session_id` → `user_profile_id`
5. System berechnet `total_points` neu basierend auf zugeordneten Tipps
6. Nutzer erscheint im Leaderboard

## Routing / Pages

**App-Router-Organisation:**
- `app/(public)/...` - Fan-Views (öffentlich zugänglich, ohne Login)
- `app/(admin)/admin/...` - Admin-Panel (nur für Admins)
- `app/(arena)/arena/...` - Stadion-Ansicht (öffentlich, aber für große Displays optimiert)

**Öffentliche Routes (Fan-Views):**
- `/`: Startseite mit Turnier-Übersicht und nächsten Spielen
- `/matches`: Übersicht aller Matches mit Status und Ergebnissen
- `/matches/[id]`: Detail-Seite eines Matches mit Live-Ticker, Events und MVP-Voting
- `/tips`: Tipp-Übersicht mit allen Matches und Möglichkeit Tipps abzugeben/zu ändern
- `/leaderboard`: Globales Leaderboard sortiert nach `total_points`, bei Gleichstand nach `created_at`
- `/groups`: Gruppen-Tabellen (A und B) mit automatisch berechneten Werten (Sp, P, S, U, N, T, GT, TD)
- `/teams`: Liste aller 8 Teams mit Flagge & Gruppe
- `/teams/[slug]`: Team-Detailseite (Kader, Statistiken, Spiele)
- `/scorers`: Torjäger-Rangliste (Aggregation aller GOAL-Events)
- `/schedule`: Spielplan mit Bracket-Ansicht
- `/arena`: Arena-Display-Screen mit verschiedenen Modi (LIVE_MATCH, TABLE, SCORERS, SCHEDULE, MVP_PROMO)
- `/login`: Login-Seite (Supabase Auth, E-Mail + Passwort oder Magic Link)
- `/profile`: Profil-Seite mit persönlicher Tipp-Statistik (nur für eingeloggte User)

**Admin Routes:**
- `/admin`: Admin-Interface für Match-Management, Event-Erstellung und Arena-Display-Steuerung (mobile-optimiert, parallel nutzbar)

## Realtime & Updates

### Realtime Channels (Supabase Realtime)

- `match_events`: Alle Clients abonnieren Updates für Match-Events → Live-Ticker aktualisiert sich automatisch
- `matches`: Alle Clients abonnieren Status- und Score-Updates → Match-Karten aktualisieren sich automatisch
- `arena_display`: Arena-Screen abonniert Display-Mode-Änderungen → Umschaltung erfolgt automatisch

### Polling / Fetch

- `tips`: Tipps werden bei Seitenaufruf gefetcht, keine Realtime-Updates (zu viele individuelle Updates)
- `mvp_votes`: Votes werden bei Seitenaufruf gefetcht, keine Realtime-Updates
- `user_profiles` / Leaderboard: Wird bei Seitenaufruf gefetcht, periodisches Polling alle 30 Sekunden auf Leaderboard-Seite
- `teams`, `players`: Statische Daten, nur bei Seitenaufruf gefetcht

## Constraints & Business Rules

### Tipps

- **Ein Tipp pro Match**: Ein Nutzer/Session kann nur einen Tipp pro Match abgeben
- **Tippänderung nur bis Anpfiff**: Tipps können nur geändert werden, solange `matches.status = 'SCHEDULED'`
- **Anonyme Tipps zählen nicht für Leaderboard**: Nur Tipps mit `user_profile_id` werden in `total_points` einberechnet
- **Punkte-Berechnung nach Spielende**: Punkte werden automatisch berechnet, sobald `matches.status = 'FINISHED'`

### MVP-Voting

- **Ein Vote pro Match**: Ein Nutzer/Session kann nur einen MVP-Vote pro Match abgeben
- **Zeitlich begrenztes Fenster**: MVP-Voting ist nur verfügbar, wenn Match Status 'FINISHED' ist und aktueller Zeitpunkt zwischen `mvp_voting_start` und `mvp_voting_end` liegt
- **Standard-Fenster**: 10 Minuten nach Spielende (automatisch gesetzt)
- **Admin-Steuerung**: Admin kann Fenster im Admin-Panel manuell verlängern oder vorzeitig schließen
- **Anonyme Votes zählen für Turnier-MVP**: Auch anonyme Votes werden in der Turnier-MVP-Berechnung berücksichtigt
- **Gewichtung nach Phase**: 
  - Gruppenphase: Faktor 1.0
  - Halbfinals: Faktor 1.5
  - Finale: Faktor 2.0

### Match-Status

**Status-Werte:**

**Gruppenphase:**
- `SCHEDULED`: Geplant
- `LIVE`: Spiel läuft (keine Halbzeit notwendig)
- `FINISHED`: Beendet

**KO-Phase (Halbfinals, Finale):**
- `SCHEDULED`: Geplant
- `LIVE_FIRST_HALF`: Erste Halbzeit läuft
- `HALF_TIME`: Halbzeitpause
- `LIVE_SECOND_HALF`: Zweite Halbzeit läuft
- `EXTRA_TIME`: Verlängerung
- `PENALTIES`: Elfmeterschießen
- `FINISHED`: Beendet

**Status-Transitions:**
- Status kann nur in definierter Reihenfolge geändert werden (z.B. nicht von 'FINISHED' zurück zu 'LIVE')
- Admin kann Status manuell setzen über Admin-Interface

### Gruppen-Tabellen

- **Automatische Berechnung**: Gruppen-Tabellen werden automatisch aus Match-Ergebnissen berechnet
- **Sortierung**: Nach Punkten (P), dann Tordifferenz (TD), dann erzielte Tore (GT)
- **Felder**: Sp (Spiele), P (Punkte: Sieg 3, Unentschieden 1, Niederlage 0), S (Siege), U (Unentschieden), N (Niederlagen), T (Tore), GT (Gegentore), TD (Tordifferenz)

### Leaderboard

- **Nur registrierte Nutzer**: Nur `user_profiles` mit `user_id` (nicht null) erscheinen im Leaderboard
- **Sortierung**: Primär nach `total_points` (absteigend), bei Gleichstand nach `created_at` (aufsteigend - frühere Profile zuerst)
- **Aktualisierung**: Leaderboard aktualisiert sich automatisch nach Punkte-Berechnung

### Arena-Display

- **Manuelle Steuerung**: Nur Admins können den Display-Modus ändern
- **Modi**: LIVE_MATCH, TABLE, SCORERS, SCHEDULE, MVP_PROMO
- **Aktuelles Match**: Bei LIVE_MATCH-Modus muss `current_match_id` gesetzt sein

### Anonymous Sessions

- **Session-ID Generation**: `anonymous_session_id` wird clientseitig generiert (UUID) und im LocalStorage/Cookie gespeichert
- **Zuordnung beim Signup**: Beim Signup wird `anonymous_session_id` aus LocalStorage gelesen und in `user_profiles.anonymous_session_id` gespeichert
- **Automatische Zuordnung**: System sucht beim Signup alle Tipps/Votes mit passender `anonymous_session_id` und ordnet sie dem neuen Profil zu (aktualisiert `user_profile_id`, setzt `anonymous_session_id` auf null)
- **Punkte-Berechnung**: Nach Zuordnung werden `total_points` neu berechnet basierend auf zugeordneten Tipps

### Avatar-System

- **Preset-Avatare**: 8 Nationen-Maskottchen (Keys: 'nigeria', 'ghana', 'kamerun', 'kongo', 'senegal', 'togo', 'angola', 'marokko')
- **Custom-Avatar**: Upload via Supabase Storage (Kamera oder Datei)
- **Optional**: Profil kann ohne Avatar existieren (`avatar_type = 'none'`)
- **Moderation**: Admin kann unangemessene Profilbilder aus Storage löschen

### Rate-Limiting & Moderation

- **Rate-Limiting**: 
  - Max. 1 Tipp/MVP-Vote pro Match pro Device/User
  - IP-basiertes Rate-Limiting gegen Spam
- **Moderation**:
  - Admin kann Profilbilder aus Supabase Storage löschen
  - Admin kann Benutzerkonten löschen oder anonymisieren (inkl. ihrer Votes/Tips)
  - Bei wiederholtem Missbrauch: Account-Deaktivierung

