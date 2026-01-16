# Scripts

Dieses Verzeichnis enthält Helper-Scripts für die Entwicklung.

## Scripts

### `apply-migrations.sh`
Zeigt Anleitung zum Anwenden der Migrationen (nur Info, führt nichts aus).

### `generate-types.sh`
Generiert TypeScript-Typen aus dem Supabase-Schema.

**Verwendung:**
```bash
./scripts/generate-types.sh
```

**Voraussetzungen:**
- `.env.local` muss existieren mit `NEXT_PUBLIC_SUPABASE_URL`
- Supabase CLI muss installiert sein: `npm install -g supabase`

### `create-admin-user.sql`
SQL-Script zum Erstellen eines Admin-Users.

**Verwendung:**
1. Registriere dich über die App oder Supabase Dashboard
2. Kopiere deine User ID aus Authentication → Users
3. Öffne `create-admin-user.sql`
4. Ersetze `<DEINE-USER-ID>` mit deiner tatsächlichen User ID
5. Führe das Script im Supabase SQL Editor aus

