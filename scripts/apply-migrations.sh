#!/bin/bash

# Script zum Anwenden der Supabase-Migrationen
# Führe dieses Script aus, nachdem du die .env.local Datei erstellt hast

echo "🚀 Supabase Migrationen anwenden..."
echo ""

# Prüfe ob .env.local existiert
if [ ! -f .env.local ]; then
  echo "❌ Fehler: .env.local Datei nicht gefunden!"
  echo "Bitte erstelle zuerst die .env.local Datei mit deinen Supabase-Credentials."
  exit 1
fi

# Lade Umgebungsvariablen
export $(cat .env.local | grep -v '^#' | xargs)

# Prüfe ob Supabase URL gesetzt ist
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Fehler: NEXT_PUBLIC_SUPABASE_URL nicht in .env.local gefunden!"
  exit 1
fi

echo "📋 Migrationen werden jetzt angewendet..."
echo ""
echo "⚠️  WICHTIG: Führe die Migrationen manuell im Supabase Dashboard aus:"
echo "   1. Gehe zu: $NEXT_PUBLIC_SUPABASE_URL"
echo "   2. Navigiere zu: SQL Editor"
echo "   3. Führe die Dateien in dieser Reihenfolge aus:"
echo "      - supabase/migrations/001_initial_schema.sql"
echo "      - supabase/migrations/002_storage_buckets.sql"
echo "      - supabase/migrations/003_admin_role.sql"
echo "      - supabase/migrations/004_test_data.sql (optional)"
echo ""
echo "📝 Oder nutze die Supabase CLI:"
echo "   supabase db push"
echo ""

