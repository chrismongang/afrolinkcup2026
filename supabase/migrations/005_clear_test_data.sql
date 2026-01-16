-- Cleanup-Migration: Löscht alle Test-Daten
-- Führe diese Migration VOR dem offiziellen Turnierstart aus, um alle Test-Daten zu entfernen
-- WICHTIG: Diese Migration löscht ALLE Test-Daten (Teams, Players, Matches)
-- und alle damit verbundenen Daten (Tips, MVP Votes, Match Events)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM matches WHERE id IN (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbf',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'cccccccc-cccc-cccc-cccc-cccccccccccd',
      'dddddddd-dddd-dddd-dddd-dddddddddddd',
      'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
    )
  ) THEN

-- ============================================
-- LÖSCHE ABHÄNGIGE DATEN ZUERST
-- ============================================

-- Lösche alle MVP Votes für Test-Matches
DELETE FROM mvp_votes 
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbf',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
  )
);

-- Lösche alle Tips für Test-Matches
DELETE FROM tips 
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbf',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
  )
);

-- Lösche alle Match Events für Test-Matches
DELETE FROM match_events 
WHERE match_id IN (
  SELECT id FROM matches 
  WHERE id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbf',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccd',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
  )
);

-- ============================================
-- LÖSCHE MATCHES
-- ============================================

DELETE FROM matches 
WHERE id IN (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaae',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaf',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbe',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbf',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'cccccccc-cccc-cccc-cccc-cccccccccccd',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- ============================================
-- LÖSCHE PLAYERS
-- ============================================

DELETE FROM players 
WHERE id IN (
  -- Nigeria
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111113',
  '11111111-1111-1111-1111-111111111114',
  -- Ghana
  '22222222-2222-2222-2222-222222222221',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222224',
  -- Kamerun
  '33333333-3333-3333-3333-333333333331',
  '33333333-3333-3333-3333-333333333332',
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333334',
  -- Kongo
  '44444444-4444-4444-4444-444444444441',
  '44444444-4444-4444-4444-444444444442',
  '44444444-4444-4444-4444-444444444443',
  '44444444-4444-4444-4444-444444444444',
  -- Senegal
  '55555555-5555-5555-5555-555555555551',
  '55555555-5555-5555-5555-555555555552',
  '55555555-5555-5555-5555-555555555553',
  '55555555-5555-5555-5555-555555555554',
  -- Togo
  '66666666-6666-6666-6666-666666666661',
  '66666666-6666-6666-6666-666666666662',
  '66666666-6666-6666-6666-666666666663',
  '66666666-6666-6666-6666-666666666664',
  -- Angola
  '77777777-7777-7777-7777-777777777771',
  '77777777-7777-7777-7777-777777777772',
  '77777777-7777-7777-7777-777777777773',
  '77777777-7777-7777-7777-777777777774',
  -- Marokko
  '88888888-8888-8888-8888-888888888881',
  '88888888-8888-8888-8888-888888888882',
  '88888888-8888-8888-8888-888888888883',
  '88888888-8888-8888-8888-888888888884'
);

-- ============================================
-- LÖSCHE TEAMS
-- ============================================

DELETE FROM teams 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111', -- Nigeria
  '22222222-2222-2222-2222-222222222222', -- Ghana
  '33333333-3333-3333-3333-333333333333', -- Kamerun
  '44444444-4444-4444-4444-444444444444', -- Kongo
  '55555555-5555-5555-5555-555555555555', -- Senegal
  '66666666-6666-6666-6666-666666666666', -- Togo
  '77777777-7777-7777-7777-777777777777', -- Angola
  '88888888-8888-8888-8888-888888888888'  -- Marokko
);

  END IF;
END $$;

-- ============================================
-- HINWEIS
-- ============================================
-- Nach dem Ausführen dieser Migration sind alle Test-Daten gelöscht.
-- Du kannst nun die offiziellen Teams, Players und Matches für das
-- Afrolink Cup 2026 Turnier einfügen.

