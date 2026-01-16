# Nächste Schritte nach erfolgreichen Migrationen

## ✅ Erledigt
- [x] SQL-Migrationen ausgeführt
- [x] Tabellen erstellt
- [x] RLS-Policies aktiv

## 🔄 Als Nächstes

### 1. TypeScript-Typen generieren

**Option A: Über Script (empfohlen)**
```bash
./scripts/generate-types.sh
```

**Option B: Manuell**
```bash
# Installiere Supabase CLI (falls noch nicht installiert)
npm install -g supabase

# Generiere Typen (ersetze <project-id> mit deiner Project ID)
npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
```

**Option C: Über Supabase Dashboard**
1. Gehe zu Settings → API
2. Scrolle zu "TypeScript types"
3. Kopiere den generierten Code
4. Füge ihn in `types/database.types.ts` ein

### 2. Admin-User erstellen

1. **Registriere dich über Supabase Auth:**
   - Gehe zu Authentication → Users
   - Klicke auf "Add user" oder registriere dich über die App
   - Kopiere deine **User ID** (UUID)

2. **Führe das Admin-Script aus:**
   - Öffne `scripts/create-admin-user.sql`
   - Ersetze `<DEINE-USER-ID>` mit deiner User ID
   - Führe es im SQL Editor aus

### 3. Test-Daten prüfen

Gehe zu **Table Editor** und prüfe:
- `teams`: Sollte 8 Teams enthalten (wenn 004_test_data.sql ausgeführt wurde)
- `players`: Sollte Spieler enthalten
- `matches`: Sollte Beispiel-Matches enthalten

### 4. Development Server starten

```bash
npm install  # Falls noch nicht gemacht
npm run dev
```

Die App sollte ohne Fehler starten.

