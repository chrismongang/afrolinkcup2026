# Supabase Migrations

Dieses Verzeichnis enthält SQL-Migrationen für das Supabase-Datenbank-Schema.

## Migrationen

1. **001_initial_schema.sql** - Erstellt alle Tabellen, Constraints, Indexes, Funktionen und RLS-Policies
2. **002_storage_buckets.sql** - Erstellt Storage-Buckets für Avatar-Uploads
3. **003_admin_role.sql** - Erstellt Admin-Rolle und erweitert RLS-Policies
4. **004_test_data.sql** - Fügt Test-Daten ein (8 Teams, 32 Spieler, 16 Matches) - **Nur für Entwicklung**
5. **005_clear_test_data.sql** - Löscht alle Test-Daten - **Vor dem offiziellen Turnierstart ausführen**

## Anwendung der Migrationen

### Option 1: Über Supabase Dashboard (Empfohlen für den Start)

1. Gehe zu deinem Supabase-Projekt
2. Navigiere zu **SQL Editor**
3. Öffne die Migration-Dateien nacheinander
4. Kopiere den Inhalt und führe ihn im SQL Editor aus
5. Führe die Migrationen in dieser Reihenfolge aus:
   - `001_initial_schema.sql`
   - `002_storage_buckets.sql`
   - `003_admin_role.sql`
   - `004_test_data.sql` (optional, nur für Entwicklung)

### Option 2: Über Supabase CLI

```bash
# Installiere Supabase CLI (falls noch nicht installiert)
npm install -g supabase

# Login
supabase login

# Linke dein Projekt
supabase link --project-ref <deine-project-id>

# Führe Migrationen aus
supabase db push
```

## Nach den Migrationen

1. **Admin-User erstellen:**
   ```sql
   -- Ersetze <user-id> mit der UUID deines Supabase Auth Users
   INSERT INTO admin_users (user_id) VALUES ('<user-id>');
   ```

2. **Test-Daten (optional):**
   - Die Migration `004_test_data.sql` fügt bereits Test-Daten ein (8 Teams, 32 Spieler, 16 Matches)
   - Für den offiziellen Turnierstart: Führe `005_clear_test_data.sql` aus, um alle Test-Daten zu löschen
   - Dann füge die offiziellen Teams, Spieler und Matches ein

3. **TypeScript-Typen generieren:**
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
   ```

