#!/bin/bash

# Script zum Generieren der TypeScript-Typen aus Supabase

echo "🔧 TypeScript-Typen generieren..."
echo ""

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
  echo "❌ Fehler: .env.local Datei nicht gefunden!"
  exit 1
fi

# Lade Umgebungsvariablen
export $(cat .env.local | grep -v '^#' | xargs)

# Extrahiere Project ID aus URL
PROJECT_URL="$NEXT_PUBLIC_SUPABASE_URL"
PROJECT_ID=$(echo $PROJECT_URL | sed 's|https://||' | sed 's|\.supabase\.co||')

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Fehler: Konnte Project ID nicht aus URL extrahieren!"
  echo "   URL: $PROJECT_URL"
  exit 1
fi

echo "📦 Project ID: $PROJECT_ID"
echo ""

# Generiere Typen
echo "🔄 Generiere TypeScript-Typen..."
npx supabase gen types typescript --project-id "$PROJECT_ID" > types/database.types.ts

if [ $? -eq 0 ]; then
  echo "✅ Typen erfolgreich generiert: types/database.types.ts"
else
  echo "❌ Fehler beim Generieren der Typen!"
  echo ""
  echo "💡 Alternative: Manuell im Supabase Dashboard:"
  echo "   1. Gehe zu: Settings → API"
  echo "   2. Scrolle zu 'TypeScript types'"
  echo "   3. Kopiere den generierten Code nach types/database.types.ts"
  exit 1
fi

