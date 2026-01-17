-- Create placeholder teams for knockout rounds and auto-update function

-- ============================================
-- PLATZHALTER-TEAMS ERSTELLEN
-- ============================================

-- Erstelle Platzhalter-Teams für KO-Runden (falls noch nicht vorhanden)
INSERT INTO teams (id, name, short_name, flag_emoji, "group", team_slug) VALUES
  ('00000000-0000-0000-0000-000000000001', '1. Gruppe A', '1. Gr. A', '🏆', 'A', '1-gruppe-a'),
  ('00000000-0000-0000-0000-000000000002', '2. Gruppe A', '2. Gr. A', '🥈', 'A', '2-gruppe-a'),
  ('00000000-0000-0000-0000-000000000003', '1. Gruppe B', '1. Gr. B', '🏆', 'B', '1-gruppe-b'),
  ('00000000-0000-0000-0000-000000000004', '2. Gruppe B', '2. Gr. B', '🥈', 'B', '2-gruppe-b'),
  ('00000000-0000-0000-0000-000000000005', 'Sieger HF1', 'Sieger HF1', '🏆', 'A', 'sieger-hf1'),
  ('00000000-0000-0000-0000-000000000006', 'Sieger HF2', 'Sieger HF2', '🏆', 'B', 'sieger-hf2')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FUNKTION: Berechne Gruppen-Tabelle
-- ============================================

CREATE OR REPLACE FUNCTION calculate_group_table(group_name TEXT)
RETURNS TABLE (
  team_id UUID,
  team_position INTEGER,
  points INTEGER,
  goal_difference INTEGER,
  goals_for INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH team_stats AS (
    SELECT 
      t.id AS team_id,
      SUM(CASE 
        WHEN m.status = 'FINISHED' AND m.team_home_id = t.id THEN
          CASE 
            WHEN m.score_home > m.score_away THEN 3
            WHEN m.score_home = m.score_away THEN 1
            ELSE 0
          END
        WHEN m.status = 'FINISHED' AND m.team_away_id = t.id THEN
          CASE 
            WHEN m.score_away > m.score_home THEN 3
            WHEN m.score_away = m.score_home THEN 1
            ELSE 0
          END
        ELSE 0
      END) AS points,
      SUM(CASE 
        WHEN m.status = 'FINISHED' AND m.team_home_id = t.id THEN m.score_home
        WHEN m.status = 'FINISHED' AND m.team_away_id = t.id THEN m.score_away
        ELSE 0
      END) AS goals_for,
      SUM(CASE 
        WHEN m.status = 'FINISHED' AND m.team_home_id = t.id THEN m.score_away
        WHEN m.status = 'FINISHED' AND m.team_away_id = t.id THEN m.score_home
        ELSE 0
      END) AS goals_against
    FROM teams t
    LEFT JOIN matches m ON (m.team_home_id = t.id OR m.team_away_id = t.id) 
      AND m."group" = group_name
      AND m.stage = 'GROUP'
    WHERE t."group" = group_name
      AND t.id NOT IN (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000006'
      )
    GROUP BY t.id
  ),
  ranked_teams AS (
    SELECT 
      team_id,
      COALESCE(points, 0) AS points,
      COALESCE(goals_for, 0) - COALESCE(goals_against, 0) AS goal_difference,
      COALESCE(goals_for, 0) AS goals_for,
      ROW_NUMBER() OVER (
        ORDER BY 
          COALESCE(points, 0) DESC,
          (COALESCE(goals_for, 0) - COALESCE(goals_against, 0)) DESC,
          COALESCE(goals_for, 0) DESC
      ) AS team_position
    FROM team_stats
  )
  SELECT 
    team_id,
    team_position::INTEGER,
    points::INTEGER,
    goal_difference::INTEGER,
    goals_for::INTEGER
  FROM ranked_teams
  ORDER BY team_position;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNKTION: Aktualisiere Halbfinale-Teams
-- ============================================

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

  -- Hole Platzhalter-Team-IDs
  SELECT id INTO group_a_first FROM teams WHERE id = '00000000-0000-0000-0000-000000000001';
  SELECT id INTO group_a_second FROM teams WHERE id = '00000000-0000-0000-0000-000000000002';
  SELECT id INTO group_b_first FROM teams WHERE id = '00000000-0000-0000-0000-000000000003';
  SELECT id INTO group_b_second FROM teams WHERE id = '00000000-0000-0000-0000-000000000004';

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
    WHERE id = semifinal1_id
      AND (team_home_id = '00000000-0000-0000-0000-000000000001' 
           OR team_away_id = '00000000-0000-0000-0000-000000000004');
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
    WHERE id = semifinal2_id
      AND (team_home_id = '00000000-0000-0000-0000-000000000003' 
           OR team_away_id = '00000000-0000-0000-0000-000000000002');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNKTION: Aktualisiere Finale-Teams
-- ============================================

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
    WHERE id = final_id
      AND (team_home_id = '00000000-0000-0000-0000-000000000005' 
           OR team_away_id = '00000000-0000-0000-0000-000000000006');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Automatische Aktualisierung
-- ============================================

CREATE OR REPLACE FUNCTION trigger_update_knockout_teams()
RETURNS TRIGGER AS $$
BEGIN
  -- Wenn ein Gruppenspiel beendet wird, prüfe ob alle beendet sind
  IF NEW.stage = 'GROUP' AND NEW.status = 'FINISHED' THEN
    PERFORM update_semifinal_teams();
  END IF;

  -- Wenn ein Halbfinale beendet wird, prüfe ob beide beendet sind
  IF NEW.stage = 'SEMIFINAL' AND NEW.status = 'FINISHED' THEN
    PERFORM update_final_teams();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Erstelle Trigger
DROP TRIGGER IF EXISTS update_knockout_teams_trigger ON matches;
CREATE TRIGGER update_knockout_teams_trigger
  AFTER UPDATE OF status ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'FINISHED')
  EXECUTE FUNCTION trigger_update_knockout_teams();
