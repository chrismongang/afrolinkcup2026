-- Create tournament matches for Afrolink Cup 2026
-- WICHTIG: Passe die start_time Werte basierend auf dem offiziellen Turnierplan an!

-- ============================================
-- GRUPPENSPIELE
-- ============================================

-- Gruppe A: Kamerun, Togo, Senegambia, Angola
-- Gruppe B: Nigeria, Kongo, Maghreb, Ghana

-- Get Team IDs
DO $$
DECLARE
  -- Gruppe A
  kamerun_id UUID;
  togo_id UUID;
  senegambia_id UUID;
  angola_id UUID;
  
  -- Gruppe B
  nigeria_id UUID;
  kongo_id UUID;
  maghreb_id UUID;
  ghana_id UUID;
BEGIN
  -- Get Team IDs
  SELECT id INTO kamerun_id FROM teams WHERE name = 'Kamerun' LIMIT 1;
  SELECT id INTO togo_id FROM teams WHERE name = 'Togo' LIMIT 1;
  SELECT id INTO senegambia_id FROM teams WHERE name = 'Senegambia' LIMIT 1;
  SELECT id INTO angola_id FROM teams WHERE name = 'Angola' LIMIT 1;
  SELECT id INTO nigeria_id FROM teams WHERE name = 'Nigeria' LIMIT 1;
  SELECT id INTO kongo_id FROM teams WHERE name = 'Kongo' LIMIT 1;
  SELECT id INTO maghreb_id FROM teams WHERE name = 'Maghreb' LIMIT 1;
  SELECT id INTO ghana_id FROM teams WHERE name = 'Ghana' LIMIT 1;

  -- ============================================
  -- GRUPPE A - 6 Spiele
  -- ============================================
  -- Passe die start_time Werte an!
  
  -- Match 1: Kamerun vs Togo
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    kamerun_id, togo_id, 'GROUP', 'A',
    ('2026-01-17 13:45:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'kamerun-vs-togo-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'kamerun-vs-togo-2026-01-17'
  );

  -- Match 2: Senegambia vs Angola
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    senegambia_id, angola_id, 'GROUP', 'A',
    ('2026-01-17 13:15:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'senegambia-vs-angola-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'senegambia-vs-angola-2026-01-17'
  );

  -- Match 3: Kamerun vs Senegambia
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    kamerun_id, senegambia_id, 'GROUP', 'A',
    ('2026-01-17 16:15:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'kamerun-vs-senegambia-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'kamerun-vs-senegambia-2026-01-17'
  );

  -- Match 4: Togo vs Angola
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    togo_id, angola_id, 'GROUP', 'A',
    ('2026-01-17 15:45:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'togo-vs-angola-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'togo-vs-angola-2026-01-17'
  );

  -- Match 5: Kamerun vs Angola
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    kamerun_id, angola_id, 'GROUP', 'A',
    ('2026-01-17 14:15:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'kamerun-vs-angola-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'kamerun-vs-angola-2026-01-17'
  );

  -- Match 6: Togo vs Senegambia
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    togo_id, senegambia_id, 'GROUP', 'A',
    ('2026-01-17 14:45:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'togo-vs-senegambia-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'togo-vs-senegambia-2026-01-17'
  );

  -- ============================================
  -- GRUPPE B - 6 Spiele
  -- ============================================
  -- Passe die start_time Werte an!

  -- Match 1: Nigeria vs Kongo
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    nigeria_id, kongo_id, 'GROUP', 'B',
    ('2026-01-17 15:00:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'nigeria-vs-kongo-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'nigeria-vs-kongo-2026-01-17'
  );

  -- Match 2: Maghreb vs Ghana
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    maghreb_id, ghana_id, 'GROUP', 'B',
    ('2026-01-17 14:30:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'maghreb-vs-ghana-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'maghreb-vs-ghana-2026-01-17'
  );

  -- Match 3: Nigeria vs Maghreb
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    nigeria_id, maghreb_id, 'GROUP', 'B',
    ('2026-01-17 14:00:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'nigeria-vs-maghreb-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'nigeria-vs-maghreb-2026-01-17'
  );

  -- Match 4: Kongo vs Ghana
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    kongo_id, ghana_id, 'GROUP', 'B',
    ('2026-01-17 13:30:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'kongo-vs-ghana-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'kongo-vs-ghana-2026-01-17'
  );

  -- Match 5: Nigeria vs Ghana
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    nigeria_id, ghana_id, 'GROUP', 'B',
    ('2026-01-17 16:00:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'nigeria-vs-ghana-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'nigeria-vs-ghana-2026-01-17'
  );

  -- Match 6: Kongo vs Maghreb
  INSERT INTO matches (team_home_id, team_away_id, stage, "group", start_time, status, match_slug)
  SELECT
    kongo_id, maghreb_id, 'GROUP', 'B',
    ('2026-01-17 16:30:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'kongo-vs-maghreb-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'kongo-vs-maghreb-2026-01-17'
  );

  -- ============================================
  -- KO-RUNDEN
  -- ============================================
  -- Diese Matches werden automatisch mit den Teams befüllt, die aus den Gruppen kommen
  -- Die Team-IDs sind Platzhalter und werden später aktualisiert

  -- Halbfinale 1: 1. Gruppe A vs 2. Gruppe B (17:40 Uhr)
  -- Teams werden NULL sein, bis die Gruppenphase beendet ist
  INSERT INTO matches (team_home_id, team_away_id, stage, start_time, status, match_slug)
  SELECT
    NULL, -- Wird automatisch durch 1. Gruppe A ersetzt
    NULL, -- Wird automatisch durch 2. Gruppe B ersetzt
    'SEMIFINAL',
    ('2026-01-17 17:40:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'halbfinale-1-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'halbfinale-1-2026-01-17'
  );

  -- Halbfinale 2: 1. Gruppe B vs 2. Gruppe A (17:55 Uhr)
  -- Teams werden NULL sein, bis die Gruppenphase beendet ist
  INSERT INTO matches (team_home_id, team_away_id, stage, start_time, status, match_slug)
  SELECT
    NULL, -- Wird automatisch durch 1. Gruppe B ersetzt
    NULL, -- Wird automatisch durch 2. Gruppe A ersetzt
    'SEMIFINAL',
    ('2026-01-17 17:55:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'halbfinale-2-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'halbfinale-2-2026-01-17'
  );

  -- Finale: Sieger HF1 vs Sieger HF2 (19:20 Uhr)
  -- Teams werden NULL sein, bis beide Halbfinale beendet sind
  INSERT INTO matches (team_home_id, team_away_id, stage, start_time, status, match_slug)
  SELECT
    NULL, -- Wird automatisch durch Sieger HF1 ersetzt
    NULL, -- Wird automatisch durch Sieger HF2 ersetzt
    'FINAL',
    ('2026-01-17 19:20:00+00'::timestamptz - INTERVAL '1 hour'),
    'SCHEDULED',
    'finale-2026-01-17'
  WHERE NOT EXISTS (
    SELECT 1 FROM matches WHERE match_slug = 'finale-2026-01-17'
  );

END $$;

-- ============================================
-- HINWEIS
-- ============================================
-- Diese Migration erstellt die Matches mit Platzhalter-Zeiten.
-- Bitte passe die start_time Werte basierend auf dem offiziellen Turnierplan an!
-- Die KO-Runden-Matches haben Platzhalter-Teams, die später automatisch
-- durch die tatsächlichen Teams ersetzt werden müssen.
