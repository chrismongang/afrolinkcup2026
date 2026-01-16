-- Test-Daten für Afrolink Cup 2026
-- Führe diese Migration NACH 001, 002, 003 aus

-- ============================================
-- TEAMS (8 Teams, 2 Gruppen)
-- ============================================

INSERT INTO teams (id, name, short_name, flag_emoji, "group", mascot_key) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Nigeria', 'NGA', '🇳🇬', 'A', 'nigeria'),
  ('22222222-2222-2222-2222-222222222222', 'Ghana', 'GHA', '🇬🇭', 'A', 'ghana'),
  ('33333333-3333-3333-3333-333333333333', 'Kamerun', 'CMR', '🇨🇲', 'A', 'kamerun'),
  ('44444444-4444-4444-4444-444444444444', 'Kongo', 'COG', '🇨🇬', 'A', 'kongo'),
  ('55555555-5555-5555-5555-555555555555', 'Senegal', 'SEN', '🇸🇳', 'B', 'senegal'),
  ('66666666-6666-6666-6666-666666666666', 'Togo', 'TOG', '🇹🇬', 'B', 'togo'),
  ('77777777-7777-7777-7777-777777777777', 'Angola', 'AGO', '🇦🇴', 'B', 'angola'),
  ('88888888-8888-8888-8888-888888888888', 'Marokko', 'MAR', '🇲🇦', 'B', 'marokko')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SPIELER (Beispiel-Spieler für jedes Team)
-- ============================================

-- Nigeria (Gruppe A)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Victor Osimhen', 25, 9, 'Stürmer'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Alex Iwobi', 28, 18, 'Mittelfeld'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'William Troost-Ekong', 30, 5, 'Verteidiger'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'Francis Uzoho', 25, 23, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Ghana (Gruppe A)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Mohammed Kudus', 24, 10, 'Mittelfeld'),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Thomas Partey', 31, 5, 'Mittelfeld'),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Inaki Williams', 30, 9, 'Stürmer'),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'Lawrence Ati-Zigi', 27, 1, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Kamerun (Gruppe A)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Vincent Aboubakar', 32, 10, 'Stürmer'),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'André-Frank Zambo Anguissa', 28, 8, 'Mittelfeld'),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'Joel Matip', 32, 4, 'Verteidiger'),
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'André Onana', 28, 1, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Kongo (Gruppe A)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Cédric Bakambu', 33, 9, 'Stürmer'),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Youssouf Mulumbu', 37, 6, 'Mittelfeld'),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Chancel Mbemba', 30, 3, 'Verteidiger'),
  (uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'Lionel Mpasi', 29, 1, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Senegal (Gruppe B)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Sadio Mané', 32, 10, 'Stürmer'),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Idrissa Gueye', 34, 5, 'Mittelfeld'),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Kalidou Koulibaly', 33, 3, 'Verteidiger'),
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', 'Édouard Mendy', 32, 16, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Togo (Gruppe B)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', 'Emmanuel Adebayor', 40, 9, 'Stürmer'),
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', 'Floyd Ayité', 35, 10, 'Mittelfeld'),
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', 'Djene Dakonam', 32, 5, 'Verteidiger'),
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', 'Malcolm Barcola', 26, 1, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Angola (Gruppe B)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '77777777-7777-7777-7777-777777777777', 'Gelson Dala', 27, 9, 'Stürmer'),
  (uuid_generate_v4(), '77777777-7777-7777-7777-777777777777', 'Fredy', 30, 10, 'Mittelfeld'),
  (uuid_generate_v4(), '77777777-7777-7777-7777-777777777777', 'Jonathan Buatu', 30, 4, 'Verteidiger'),
  (uuid_generate_v4(), '77777777-7777-7777-7777-777777777777', 'Neblú', 28, 1, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- Marokko (Gruppe B)
INSERT INTO players (id, team_id, name, age, jersey_number, position) VALUES
  (uuid_generate_v4(), '88888888-8888-8888-8888-888888888888', 'Achraf Hakimi', 25, 2, 'Verteidiger'),
  (uuid_generate_v4(), '88888888-8888-8888-8888-888888888888', 'Hakim Ziyech', 31, 7, 'Mittelfeld'),
  (uuid_generate_v4(), '88888888-8888-8888-8888-888888888888', 'Youssef En-Nesyri', 27, 9, 'Stürmer'),
  (uuid_generate_v4(), '88888888-8888-8888-8888-888888888888', 'Yassine Bounou', 33, 1, 'Torwart')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MATCHES (Beispiel-Spielplan für 17.01.2026)
-- ============================================

-- Gruppenphase - Gruppe A
INSERT INTO matches (id, team_home_id, team_away_id, stage, "group", start_time, status) VALUES
  -- Gruppe A - Match 1
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'GROUP', 'A', '2026-01-17 10:00:00+00', 'SCHEDULED'),
  -- Gruppe A - Match 2
  (uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'GROUP', 'A', '2026-01-17 10:00:00+00', 'SCHEDULED'),
  -- Gruppe A - Match 3
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'GROUP', 'A', '2026-01-17 13:00:00+00', 'SCHEDULED'),
  -- Gruppe A - Match 4
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'GROUP', 'A', '2026-01-17 13:00:00+00', 'SCHEDULED'),
  -- Gruppe A - Match 5
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'GROUP', 'A', '2026-01-17 16:00:00+00', 'SCHEDULED'),
  -- Gruppe A - Match 6
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'GROUP', 'A', '2026-01-17 16:00:00+00', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

-- Gruppenphase - Gruppe B
INSERT INTO matches (id, team_home_id, team_away_id, stage, "group", start_time, status) VALUES
  -- Gruppe B - Match 1
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'GROUP', 'B', '2026-01-17 11:00:00+00', 'SCHEDULED'),
  -- Gruppe B - Match 2
  (uuid_generate_v4(), '77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'GROUP', 'B', '2026-01-17 11:00:00+00', 'SCHEDULED'),
  -- Gruppe B - Match 3
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'GROUP', 'B', '2026-01-17 14:00:00+00', 'SCHEDULED'),
  -- Gruppe B - Match 4
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 'GROUP', 'B', '2026-01-17 14:00:00+00', 'SCHEDULED'),
  -- Gruppe B - Match 5
  (uuid_generate_v4(), '55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 'GROUP', 'B', '2026-01-17 17:00:00+00', 'SCHEDULED'),
  -- Gruppe B - Match 6
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'GROUP', 'B', '2026-01-17 17:00:00+00', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

-- KO-Phase (Platzhalter - werden später mit echten Team-IDs gefüllt)
-- Halbfinale 1: A1 vs B2
INSERT INTO matches (id, team_home_id, team_away_id, stage, start_time, status) VALUES
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'SEMIFINAL', '2026-01-17 19:00:00+00', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

-- Halbfinale 2: A2 vs B1
INSERT INTO matches (id, team_home_id, team_away_id, stage, start_time, status) VALUES
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'SEMIFINAL', '2026-01-17 19:00:00+00', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

-- Spiel um Platz 3
INSERT INTO matches (id, team_home_id, team_away_id, stage, start_time, status) VALUES
  (uuid_generate_v4(), '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'THIRD_PLACE', '2026-01-17 21:00:00+00', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

-- Finale
INSERT INTO matches (id, team_home_id, team_away_id, stage, start_time, status) VALUES
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'FINAL', '2026-01-17 22:00:00+00', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

