-- Migration: Update Tournament Groups
-- Aktualisiert die Gruppen für das Afrolink Cup 2026 Turnier
-- Führe diese Migration NACH 010 aus

-- ============================================
-- GRUPPEN UPDATE
-- ============================================

-- Neue Gruppenstruktur:
-- Gruppe A: Kamerun, Togo, Angola, Senegambia
-- Gruppe B: Ghana, Nigeria, Kongo, Maghreb/Marokko

-- Update Gruppe A Teams
UPDATE teams SET "group" = 'A' WHERE id = '33333333-3333-3333-3333-333333333333'; -- Kamerun (bleibt A)
UPDATE teams SET "group" = 'A' WHERE id = '66666666-6666-6666-6666-666666666666'; -- Togo (B -> A)
UPDATE teams SET "group" = 'A' WHERE id = '77777777-7777-7777-7777-777777777777'; -- Angola (B -> A)
UPDATE teams SET "group" = 'A' WHERE id = '55555555-5555-5555-5555-555555555555'; -- Senegambia (B -> A)

-- Update Gruppe B Teams
UPDATE teams SET "group" = 'B' WHERE id = '22222222-2222-2222-2222-222222222222'; -- Ghana (A -> B)
UPDATE teams SET "group" = 'B' WHERE id = '11111111-1111-1111-1111-111111111111'; -- Nigeria (A -> B)
UPDATE teams SET "group" = 'B' WHERE id = '44444444-4444-4444-4444-444444444444'; -- Kongo (A -> B)
UPDATE teams SET "group" = 'B' WHERE id = '88888888-8888-8888-8888-888888888888'; -- Marokko (bleibt B)

-- Update Marokko Name zu Maghreb/Marokko
UPDATE teams 
SET name = 'Maghreb/Marokko' 
WHERE id = '88888888-8888-8888-8888-888888888888';

-- Update auch die group in matches falls bereits Gruppenspiele existieren
UPDATE matches 
SET "group" = 'A' 
WHERE stage = 'GROUP' 
  AND (team_home_id IN ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555')
    OR team_away_id IN ('33333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', '55555555-5555-5555-5555-555555555555'));

UPDATE matches 
SET "group" = 'B' 
WHERE stage = 'GROUP' 
  AND (team_home_id IN ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888')
    OR team_away_id IN ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888'));
