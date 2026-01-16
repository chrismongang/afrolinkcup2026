# Migration-Anleitung

Nachdem du die manuellen Setup-Schritte abgeschlossen hast, führe die SQL-Migrationen aus.

## Option 1: Über Supabase Dashboard (Empfohlen)

1. **Gehe zu deinem Supabase-Projekt**
   - Öffne [supabase.com/dashboard](https://supabase.com/dashboard)
   - Wähle dein Projekt

2. **Öffne den SQL Editor**
   - Klicke auf **"SQL Editor"** in der linken Sidebar
   - Klicke auf **"New query"**

3. **Führe die Migrationen nacheinander aus:**
   
   **a) Initial Schema:**
   - Öffne `supabase/migrations/001_initial_schema.sql`
   - Kopiere den gesamten Inhalt
   - Füge ihn in den SQL Editor ein
   - Klicke auf **"Run"** (oder `Cmd/Ctrl + Enter`)
   - Warte, bis die Ausführung abgeschlossen ist (sollte "Success" anzeigen)

   **b) Storage Buckets:**
   - Öffne `supabase/migrations/002_storage_buckets.sql`
   - Kopiere den Inhalt
   - Führe im SQL Editor aus

   **c) Admin Role:**
   - Öffne `supabase/migrations/003_admin_role.sql`
   - Kopiere den Inhalt
   - Führe im SQL Editor aus

   **d) Test-Daten (Optional):**
   - Öffne `supabase/migrations/004_test_data.sql`
   - Kopiere den Inhalt
   - Führe im SQL Editor aus
   - ⚠️ **Hinweis**: Diese Migration erstellt Test-Daten (Teams, Spieler, Matches)

4. **Prüfe die Tabellen:**
   - Gehe zu **"Table Editor"** in der Sidebar
   - Du solltest jetzt alle Tabellen sehen: `teams`, `players`, `matches`, etc.

## Option 2: Über Supabase CLI

```bash
# Installiere Supabase CLI (falls noch nicht installiert)
npm install -g supabase

# Login
supabase login

# Linke dein Projekt (du brauchst die Project Reference ID)
supabase link --project-ref <deine-project-id>

# Führe alle Migrationen aus
supabase db push
```

## Nach den Migrationen

### 1. Admin-User erstellen

Nachdem du einen User über Supabase Auth registriert hast:

1. Gehe zu **"Authentication"** → **"Users"**
2. Finde deinen User und kopiere die **User ID** (UUID)
3. Gehe zum **SQL Editor** und führe aus:

```sql
-- Ersetze <user-id> mit deiner tatsächlichen User ID
INSERT INTO admin_users (user_id) VALUES ('<user-id>');
```

### 2. TypeScript-Typen generieren

```bash
# Nutze das Script
./scripts/generate-types.sh

# Oder manuell:
npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
```

### 3. Test-Daten prüfen

Gehe zu **"Table Editor"** und prüfe:
- `teams`: Sollte 8 Teams enthalten
- `players`: Sollte Spieler für jedes Team enthalten
- `matches`: Sollte Beispiel-Matches enthalten

## Troubleshooting

**Fehler: "relation already exists"**
- Die Tabelle existiert bereits. Das ist OK, die Migration nutzt `IF NOT EXISTS`.

**Fehler: "permission denied"**
- Prüfe, ob du als Projekt-Owner eingeloggt bist.

**Fehler: "function already exists"**
- Die Funktion existiert bereits. Das ist OK.

**RLS-Policies funktionieren nicht:**
- Prüfe, ob RLS für die Tabelle aktiviert ist: `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;`

## Nächste Schritte

Nach erfolgreichen Migrationen:
1. ✅ TypeScript-Typen generieren
2. ✅ Admin-User erstellen
3. ✅ Test-Daten prüfen
4. ✅ Development Server starten: `npm run dev`

