# AfroLink Cup 2026 – Live-Turnierplattform

Turniersoftware für den **AfroLink Cup 2026** am 17. Januar 2026 im **BMW Park München**: 8 Teams, Gruppenphase und KO-Runde an einem Tag.

Die App lief den ganzen Turniertag live auf den Videowürfeln in der Halle und gleichzeitig als Fan-App auf den Handys der Zuschauer. Gesteuert wurde alles aus einem Admin-Panel am Spielfeldrand.

**Am Turniertag (24 h):** rund 220.000 Datenbank-Requests, 40.000 Auth-Requests und 10.000 Realtime-Events.

## Was das System kann

**Arena-Screens (Videowürfel in der Halle)**
- Live-Spielstand, Gruppentabellen, Torschützenliste, Spielplan, News und Leaderboard
- QR-Code zur Fan-App
- Umschaltung der Anzeige in Echtzeit aus dem Admin-Panel über Supabase Realtime, ohne Reload

**Fan-App (öffentlich, mobil)**
- Live-Ticker mit Match-Events (Tore, Karten, Halbzeit)
- Automatisch berechnete Gruppentabellen und KO-Baum
- Tippspiel mit Punktesystem (4/3/2/0) und globalem Leaderboard
- MVP-Voting nach jedem Spiel mit zeitlich begrenztem Fenster
- Team- und Spielerseiten, News

**Admin-Panel**
- Spiele starten, Events erfassen und Status wechseln (Gruppenphase und KO-Phase mit Halbzeiten)
- Steuerung von Screens und Arena-Modus
- Spieler- und Kaderverwaltung, News-Portal für das Social-Media-Team

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage), Row Level Security
- **Datenbank:** 28 SQL-Migrationen, Punkteberechnung und Tabellenlogik direkt in Postgres
- **Hosting:** Vercel

## Projektstruktur

```
app/
  (public)/        Fan-App: Spiele, Gruppen, Teams, Torschützen, Leaderboard, News, Profil
  (arena)/arena/   Ansichten für die Videowürfel (Ticker, Tabelle, Torschützen, News, QR-Code …)
  (admin)/admin/   Admin-Panel: Spiele, Spieler, Screens, Zugänge
  (news-portal)/   Upload-Portal für das News-Team
  api/             Server-Routen für Admin- und News-Aktionen
components/        UI- und Feature-Komponenten
lib/  hooks/       Supabase-Client, Realtime-Hooks, Turnierlogik
supabase/          SQL-Migrationen
docs/              Architektur, Regeln, Setup- und Deployment-Anleitungen
```

## Lokal starten

```bash
npm install
cp .env.example .env.local   # Supabase-URL, Anon-Key und Portal-Passwörter eintragen
npm run dev
```

Migrationen, Admin-Setup und Deployment sind beschrieben in:

- [docs/architecture.md](docs/architecture.md): Datenmodell, Match-Status-Logik, Realtime
- [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) und [supabase/README.md](supabase/README.md)
- [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Design

Dunkles, minimalistisches UI: Hintergrund `#161616`, Karten `#1E1E1E`, Akzent `#EEF757`, Schrift Mulish.

---

Konzipiert und entwickelt von [Chris Mongang](https://www.chrismongang.com).
