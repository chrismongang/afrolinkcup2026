# TypeScript-Typen manuell generieren

Da die automatische Generierung aufgrund von Sandbox-Beschränkungen nicht funktioniert, hier die manuelle Anleitung:

## Option 1: Über Supabase Dashboard (Empfohlen)

1. **Gehe zu deinem Supabase-Projekt:**
   - Öffne [supabase.com/dashboard](https://supabase.com/dashboard)
   - Wähle dein Projekt (Project ID: `<deine-project-id>`)

2. **Gehe zu Settings → Data API:**
   - In der linken Sidebar unter **"PROJECT SETTINGS"** findest du **"Data API"**
   - Klicke auf **"Data API"** (nicht auf "API Keys")

3. **Scrolle zu "TypeScript types":**
   - Auf der "Data API" Seite findest du verschiedene Abschnitte
   - Scrolle nach unten bis du den Abschnitt **"TypeScript types"** oder **"Generate TypeScript types"** siehst
   - Dort findest du einen Button **"Generate types"** oder bereits generierten Code
   - Falls du einen Code-Block siehst, kopiere den gesamten Inhalt

4. **Kopiere den Code:**
   - Der generierte Code sollte so aussehen:
   ```typescript
   export type Json =
     | string
     | number
     | boolean
     | null
     | { [key: string]: Json | undefined }
     | Json[]

   export interface Database {
     public: {
       Tables: {
         teams: { ... }
         players: { ... }
         // etc.
       }
     }
   }
   ```

5. **Füge den Code in `types/database.types.ts` ein:**
   - Ersetze den gesamten Inhalt der Datei mit dem kopierten Code

## Option 2: Über Terminal (wenn npx funktioniert)

Falls du das Terminal direkt nutzen kannst (außerhalb von Cursor):

```bash
cd /Users/chrismongang/Desktop/afrolinkcup2026
npx supabase gen types typescript --project-id <deine-project-id> > types/database.types.ts
```

## Option 3: Supabase CLI lokal installieren

```bash
# Installiere Supabase CLI global
npm install -g supabase

# Oder mit Homebrew (macOS)
brew install supabase/tap/supabase

# Dann generiere Typen
supabase gen types typescript --project-id <deine-project-id> > types/database.types.ts
```

## Nach der Generierung

Die `types/database.types.ts` sollte folgende Struktur haben:

- `Database` Interface mit allen Tabellen
- Typen für `teams`, `players`, `matches`, `match_events`, `user_profiles`, `tips`, `mvp_votes`, `arena_display`
- Typen für alle Funktionen und Views

## Verwendung in Code

```typescript
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

const supabase = createClient<Database>()
```

