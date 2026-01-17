-- Fix knockout matches: Remove placeholder teams and allow NULL teams for KO rounds
-- This allows matches to exist with placeholder text until teams are determined

-- ============================================
-- LÖSCHE PLATZHALTER-TEAMS
-- ============================================

DELETE FROM teams WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006'
);

-- ============================================
-- SCHEMA-ÄNDERUNG: Erlaube NULL-Teams für KO-Runden
-- ============================================

-- Entferne NOT NULL Constraint für team_home_id und team_away_id
-- Aber nur für KO-Runden (SEMIFINAL, FINAL)
ALTER TABLE matches
  ALTER COLUMN team_home_id DROP NOT NULL,
  ALTER COLUMN team_away_id DROP NOT NULL;

-- Füge Check-Constraint hinzu: Gruppenspiele müssen Teams haben, KO-Runden können NULL haben
ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_teams_check;

ALTER TABLE matches
  ADD CONSTRAINT matches_teams_check CHECK (
    (stage = 'GROUP' AND team_home_id IS NOT NULL AND team_away_id IS NOT NULL) OR
    (stage IN ('SEMIFINAL', 'FINAL') AND (team_home_id IS NULL OR team_away_id IS NULL OR (team_home_id IS NOT NULL AND team_away_id IS NOT NULL)))
  );

-- ============================================
-- AKTUALISIERE KO-RUNDEN-MATCHES
-- ============================================

-- Setze Halbfinale und Finale auf NULL-Teams
UPDATE matches
SET 
  team_home_id = NULL,
  team_away_id = NULL
WHERE stage IN ('SEMIFINAL', 'FINAL')
  AND match_slug IN ('halbfinale-1-2026-01-17', 'halbfinale-2-2026-01-17', 'finale-2026-01-17');

-- ============================================
-- AKTUALISIERE FUNKTIONEN
-- ============================================

-- Aktualisiere update_semifinal_teams() um mit NULL-Teams zu arbeiten
CREATE OR REPLACE FUNCTION update_semifinal_teams()
RETURNS void AS $$
DECLARE
  group_a_first UUID;
  group_a_second UUID;
  group_b_first UUID;
  group_b_second UUID;
  semifinal1_id UUID;
  semifinal2_id UUID;
BEGIN
  -- Prüfe ob alle Gruppenspiele beendet sind
  IF EXISTS (
    SELECT 1 FROM matches 
    WHERE stage = 'GROUP' 
    AND status != 'FINISHED'
  ) THEN
    -- Gruppenphase noch nicht beendet
    RETURN;
  END IF;

  -- Berechne Gruppen-Tabellen
  SELECT team_id INTO group_a_first
  FROM calculate_group_table('A')
  WHERE team_position = 1
  LIMIT 1;

  SELECT team_id INTO group_a_second
  FROM calculate_group_table('A')
  WHERE team_position = 2
  LIMIT 1;

  SELECT team_id INTO group_b_first
  FROM calculate_group_table('B')
  WHERE team_position = 1
  LIMIT 1;

  SELECT team_id INTO group_b_second
  FROM calculate_group_table('B')
  WHERE team_position = 2
  LIMIT 1;

  -- Update Halbfinale 1: 1. Gruppe A vs 2. Gruppe B
  SELECT id INTO semifinal1_id FROM matches 
  WHERE match_slug = 'halbfinale-1-2026-01-17' 
  LIMIT 1;

  IF semifinal1_id IS NOT NULL AND group_a_first IS NOT NULL AND group_b_second IS NOT NULL THEN
    UPDATE matches
    SET 
      team_home_id = group_a_first,
      team_away_id = group_b_second
    WHERE id = semifinal1_id;
  END IF;

  -- Update Halbfinale 2: 1. Gruppe B vs 2. Gruppe A
  SELECT id INTO semifinal2_id FROM matches 
  WHERE match_slug = 'halbfinale-2-2026-01-17' 
  LIMIT 1;

  IF semifinal2_id IS NOT NULL AND group_b_first IS NOT NULL AND group_a_second IS NOT NULL THEN
    UPDATE matches
    SET 
      team_home_id = group_b_first,
      team_away_id = group_a_second
    WHERE id = semifinal2_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Aktualisiere update_final_teams() um mit NULL-Teams zu arbeiten
CREATE OR REPLACE FUNCTION update_final_teams()
RETURNS void AS $$
DECLARE
  semifinal1_winner UUID;
  semifinal2_winner UUID;
  final_id UUID;
BEGIN
  -- Prüfe ob beide Halbfinale beendet sind
  IF EXISTS (
    SELECT 1 FROM matches 
    WHERE stage = 'SEMIFINAL' 
    AND status != 'FINISHED'
  ) THEN
    -- Halbfinale noch nicht beendet
    RETURN;
  END IF;

  -- Hole Sieger der Halbfinale
  SELECT 
    CASE 
      WHEN score_home > score_away THEN team_home_id
      WHEN score_away > score_home THEN team_away_id
      WHEN score_home_penalties IS NOT NULL AND score_away_penalties IS NOT NULL THEN
        CASE 
          WHEN score_home_penalties > score_away_penalties THEN team_home_id
          ELSE team_away_id
        END
      ELSE NULL
    END INTO semifinal1_winner
  FROM matches
  WHERE match_slug = 'halbfinale-1-2026-01-17'
    AND status = 'FINISHED'
  LIMIT 1;

  SELECT 
    CASE 
      WHEN score_home > score_away THEN team_home_id
      WHEN score_away > score_home THEN team_away_id
      WHEN score_home_penalties IS NOT NULL AND score_away_penalties IS NOT NULL THEN
        CASE 
          WHEN score_home_penalties > score_away_penalties THEN team_home_id
          ELSE team_away_id
        END
      ELSE NULL
    END INTO semifinal2_winner
  FROM matches
  WHERE match_slug = 'halbfinale-2-2026-01-17'
    AND status = 'FINISHED'
  LIMIT 1;

  -- Update Finale
  SELECT id INTO final_id FROM matches 
  WHERE match_slug = 'finale-2026-01-17' 
  LIMIT 1;

  IF final_id IS NOT NULL AND semifinal1_winner IS NOT NULL AND semifinal2_winner IS NOT NULL THEN
    UPDATE matches
    SET 
      team_home_id = semifinal1_winner,
      team_away_id = semifinal2_winner
    WHERE id = final_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
