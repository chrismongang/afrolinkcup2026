#!/usr/bin/env node

/**
 * Script zum Ausführen der Migration 006_add_predicted_winner_to_tips.sql
 * Führt die SQL-Migration direkt über Supabase aus
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('❌ Fehler: NEXT_PUBLIC_SUPABASE_URL nicht gefunden in .env.local')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ Fehler: SUPABASE_SERVICE_ROLE_KEY oder NEXT_PUBLIC_SUPABASE_ANON_KEY nicht gefunden')
  console.error('   Hinweis: Für ALTER TABLE Befehle wird normalerweise die Service Role Key benötigt')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Führe Migration 006 aus...\n')

  // Lese die Migration-Datei
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '006_add_predicted_winner_to_tips.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

  // Teile die SQL-Statements (durch Semikolon getrennt, aber beachte DO-Blöcke)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  try {
    // Führe jeden Statement aus
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length === 0) continue

      console.log(`📝 Führe Statement ${i + 1}/${statements.length} aus...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        // Versuche es direkt über die REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql: statement })
        })

        if (!response.ok) {
          // Fallback: Versuche es über postgrest direkt
          console.log(`   ⚠️  RPC nicht verfügbar, versuche direkten SQL-Zugriff...`)
          throw new Error(`SQL Execution failed: ${error.message}`)
        }
      }
    }

    console.log('\n✅ Migration erfolgreich ausgeführt!')
  } catch (error) {
    console.error('\n❌ Fehler beim Ausführen der Migration:')
    console.error(error.message)
    console.error('\n💡 Alternative: Führe die Migration manuell im Supabase Dashboard aus:')
    console.error('   1. Gehe zu: SQL Editor')
    console.error('   2. Kopiere den Inhalt von: supabase/migrations/006_add_predicted_winner_to_tips.sql')
    console.error('   3. Führe ihn aus')
    process.exit(1)
  }
}

runMigration()
