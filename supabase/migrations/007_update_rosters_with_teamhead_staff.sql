-- Migration: Update Rosters with Teamhead and Staff
-- Fügt neue Rollen (teamhead, staff) hinzu und aktualisiert alle Kaderlisten
-- Führe diese Migration NACH 006 aus

-- ============================================
-- SCHEMA ÄNDERUNGEN
-- ============================================

-- Füge role-Spalte hinzu (Standard: 'player')
-- Zuerst als nullable hinzufügen, dann Standard setzen, dann NOT NULL
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS role TEXT;

-- Setze Standard für bestehende Zeilen
UPDATE players SET role = 'player' WHERE role IS NULL;

-- Setze Standard und NOT NULL Constraint
ALTER TABLE players 
ALTER COLUMN role SET DEFAULT 'player',
ALTER COLUMN role SET NOT NULL;

-- Füge Check Constraint hinzu (falls noch nicht vorhanden)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'players_role_check'
  ) THEN
    ALTER TABLE players 
    ADD CONSTRAINT players_role_check CHECK (role IN ('player', 'teamhead', 'staff'));
  END IF;
END $$;

-- Mache position nullable (wird nicht mehr benötigt)
ALTER TABLE players 
ALTER COLUMN position DROP NOT NULL;

-- Mache jersey_number nullable (teamhead und staff haben keine)
ALTER TABLE players 
ALTER COLUMN jersey_number DROP NOT NULL;

-- Mache age nullable (optional für alle)
-- (age ist bereits nullable, aber zur Sicherheit)

-- ============================================
-- TEAM NAME UPDATE
-- ============================================

-- Stelle sicher, dass Teams existieren (für FK in players)
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

-- Update Senegal zu Senegambia
UPDATE teams 
SET name = 'Senegambia', short_name = 'SEN'
WHERE id = '55555555-5555-5555-5555-555555555555';

-- ============================================
-- LÖSCHE ALLE BESTEHENDEN SPIELER
-- ============================================

DELETE FROM players;

-- ============================================
-- KADER KAMERUN
-- ============================================

-- Teamhead
INSERT INTO players (team_id, name, role) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Mohamadou', 'teamhead');

-- Staff
INSERT INTO players (team_id, name, role) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Nelson Dongmo', 'staff'),
  ('33333333-3333-3333-3333-333333333333', 'Jordan Ouabo', 'staff'),
  ('33333333-3333-3333-3333-333333333333', 'Josua Amegnonvo', 'staff'),
  ('33333333-3333-3333-3333-333333333333', 'Amyra Hartl', 'staff'),
  ('33333333-3333-3333-3333-333333333333', 'Zia Zorlak', 'staff');

-- Spieler
INSERT INTO players (team_id, name, jersey_number, position, role) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Devlin-Jairus Nganwa', 1, 'TW', 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Kongni djaleu', NULL, 'C', 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Lucky jilg', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Niveto Caciel', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Faris Hapi', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Jean Daniel Monty Mendama', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Ivan ssemaganda', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Johann Bleriot Ndjongang', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Johann Ngounou Djayo', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Fabien Ngounou Djayo', NULL, NULL, 'player'),
  ('33333333-3333-3333-3333-333333333333', 'Frank Seuyong Tchoukoua', NULL, NULL, 'player');

-- ============================================
-- KADER SENEGAMBIA (früher Senegal)
-- ============================================

-- Teamhead
INSERT INTO players (team_id, name, role) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Mamin Sanyang', 'teamhead');

-- Spieler
INSERT INTO players (team_id, name, jersey_number, role) VALUES
  ('55555555-5555-5555-5555-555555555555', 'Muhamad Sanyang', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Omar Konteh', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Batuow Jaiteh', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Muhamed Barry', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Fallou Nguer', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Mass Barrow', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Alpha Jallow', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Banta Gumaneh', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Ibrahim Camara', NULL, 'player'),
  ('55555555-5555-5555-5555-555555555555', 'Sheriff Camara', NULL, 'player');

-- ============================================
-- KADER TOGO
-- ============================================

-- Spieler
INSERT INTO players (team_id, name, jersey_number, role) VALUES
  ('66666666-6666-6666-6666-666666666666', 'Manuel Mutove', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Yassin Idrissou', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Tahrek Bako', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Baldwin Wilson', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Fadhel Mourou', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Hakeem Do Rego', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Lahid Issa', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Yazid Tambo', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Yazid Ouro', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Djamal Aboulaye', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Djamal', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Rachid Teouri', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Sahid Gobitaka', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Nouroudine', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Moustapha', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Abdoul Falilou', NULL, 'player'),
  ('66666666-6666-6666-6666-666666666666', 'Aboubacar-Traore', NULL, 'player');

-- ============================================
-- KADER GHANA
-- ============================================

-- Spieler
INSERT INTO players (team_id, name, jersey_number, role) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Jasal Mansaray', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Marvin Boachie', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Michael Appiah', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Eleazer Mensah', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Flávio Cuna', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Manfred Kwadwo', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Kastin Basoah', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Isaac Okwubor', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Terry Danso', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Zidane Sani', NULL, 'player'),
  ('22222222-2222-2222-2222-222222222222', 'Simon Sai', NULL, 'player');

-- ============================================
-- KADER ANGOLA
-- ============================================

-- Teamhead
INSERT INTO players (team_id, name, role) VALUES
  ('77777777-7777-7777-7777-777777777777', 'Anderson Lucoqui', 'teamhead');

-- Spieler (mit Geburtsdaten wo angegeben)
INSERT INTO players (team_id, name, age, jersey_number, position, role) VALUES
  ('77777777-7777-7777-7777-777777777777', 'Joel Malungo', 17, NULL, NULL, 'player'), -- 06.03.2007
  ('77777777-7777-7777-7777-777777777777', 'Valter Medina Do Amaral', 30, NULL, NULL, 'player'), -- 23.01.1994
  ('77777777-7777-7777-7777-777777777777', 'Jomarçio Luis Augusto', 17, NULL, NULL, 'player'), -- 18.10.2006
  ('77777777-7777-7777-7777-777777777777', 'Christ Emanuel Makangilu Da costa', 20, NULL, NULL, 'player'), -- 28.04.2004
  ('77777777-7777-7777-7777-777777777777', 'Lukas Da Silva Freundorfer', 19, NULL, NULL, 'player'), -- 06.02.2005
  ('77777777-7777-7777-7777-777777777777', 'Ezechiel Mbala', 24, NULL, NULL, 'player'), -- 13.06.2000
  ('77777777-7777-7777-7777-777777777777', 'Ivanilson Guerra Matias', 21, NULL, NULL, 'player'), -- 31.05.2003
  ('77777777-7777-7777-7777-777777777777', 'Mardoche Calemba', 23, NULL, NULL, 'player'), -- 05.01.2001
  ('77777777-7777-7777-7777-777777777777', 'Milonga José', 19, NULL, NULL, 'player'), -- 16.09.2005
  ('77777777-7777-7777-7777-777777777777', 'Domenico de marco', 21, NULL, NULL, 'player'), -- 14.05.2003
  ('77777777-7777-7777-7777-777777777777', 'Pedro Sumbo', 20, NULL, 'C', 'player'), -- 05.02.2004 (C)
  ('77777777-7777-7777-7777-777777777777', 'Kudy Silvestre zombo', 18, NULL, NULL, 'player'); -- 4.1.2006

-- ============================================
-- KADER KONGO
-- ============================================

-- Teamhead
INSERT INTO players (team_id, name, role) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Paris Brunner', 'teamhead');

-- Staff
INSERT INTO players (team_id, name, role) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Rude', 'staff'),
  ('44444444-4444-4444-4444-444444444444', 'Gafonso', 'staff'),
  ('44444444-4444-4444-4444-444444444444', 'Kevin Ngusu', 'staff'),
  ('44444444-4444-4444-4444-444444444444', 'Alex Belinga', 'staff');

-- Spieler
INSERT INTO players (team_id, name, jersey_number, role) VALUES
  ('44444444-4444-4444-4444-444444444444', 'Cerro', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Erwin Ndombe', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Gravidi Rogerio', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Jonas Ngusu', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Manace Mbombo', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Kevin Mbuta', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Mardo Mourera', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Yesua Matongo', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Benny Nanga', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Prince Luaka', NULL, 'player'),
  ('44444444-4444-4444-4444-444444444444', 'Marcus Kass', NULL, 'player');

-- ============================================
-- KADER NIGERIA
-- ============================================

-- Teamhead
INSERT INTO players (team_id, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Wisdom Mike', 'teamhead');

-- Staff
INSERT INTO players (team_id, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Jeremi Kitenda', 'staff'),
  ('11111111-1111-1111-1111-111111111111', 'Mike Swin', 'staff'),
  ('11111111-1111-1111-1111-111111111111', 'Molaye Muteba', 'staff');

-- Spieler
INSERT INTO players (team_id, name, jersey_number, position, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Victor Obika', 1, 'TW', 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Nicholas Onyia', NULL, 'C', 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Kelvin Onuigwe', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Azim Tchagouni', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Wesley Parasole', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Samuel O''bryant', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Noah Shawn', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Gianmauro Masella', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Roger soyen', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Abdul gueye', NULL, NULL, 'player'),
  ('11111111-1111-1111-1111-111111111111', 'Alexis Alban fambo', NULL, NULL, 'player');

-- ============================================
-- HINWEIS
-- ============================================
-- Alle Kaderlisten wurden aktualisiert.
-- Die Position-Spalte ist jetzt optional und wird in der UI nicht mehr angezeigt.
-- Teamhead und Staff haben keine Trikotnummern, Altersangaben oder Fotos.
