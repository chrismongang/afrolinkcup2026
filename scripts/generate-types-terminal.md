# TypeScript-Typen über Terminal generieren

Da die Typen im Supabase Dashboard nicht mehr verfügbar sind, nutze die Supabase CLI.

## Schritt-für-Schritt Anleitung

### 1. Öffne dein Terminal (außerhalb von Cursor)

Öffne Terminal.app oder iTerm auf deinem Mac.

### 2. Navigiere zum Projekt

```bash
cd /Users/chrismongang/Desktop/afrolinkcup2026
```

### 3. Installiere Supabase CLI (falls noch nicht installiert)

**Option A: Mit npm (empfohlen)**
```bash
npm install -g supabase
```

**Option B: Mit Homebrew (macOS)**
```bash
brew install supabase/tap/supabase
```

### 4. Login bei Supabase

```bash
supabase login
```

Du wirst aufgefordert, deinen Access Token einzugeben. Folge den Anweisungen im Terminal.

### 5. Linke dein Projekt

```bash
supabase link --project-ref <deine-project-id>
```

### 6. Generiere die Typen

```bash
supabase gen types typescript --linked > types/database.types.ts
```

Oder ohne Linking (direkt mit Project ID):

```bash
supabase gen types typescript --project-id <deine-project-id> > types/database.types.ts
```

## Alternative: Ohne Login (nur mit Project ID)

Falls der Login nicht funktioniert, kannst du auch direkt mit der Project ID arbeiten:

```bash
npx supabase gen types typescript --project-id <deine-project-id> > types/database.types.ts
```

## Nach der Generierung

Die Datei `types/database.types.ts` wird mit den offiziellen Typen von Supabase überschrieben.

## Hinweis

Die bereits vorhandene `types/database.types.ts` Datei basiert auf deinem Schema und sollte identisch sein. Falls du sicherstellen möchtest, dass alles korrekt ist, kannst du die offiziellen Typen generieren und vergleichen.

