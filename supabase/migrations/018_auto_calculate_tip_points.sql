-- Migration: Automatische Punkteberechnung für Tipps nach Match-Ende
-- Diese Funktion wird automatisch ausgelöst, wenn ein Match auf "FINISHED" gesetzt wird

-- Funktion: Berechne Punkte für alle Tipps eines beendeten Matches
CREATE OR REPLACE FUNCTION calculate_tips_for_finished_match()
RETURNS TRIGGER AS $$
DECLARE
  tip_record RECORD;
  calculated_points INTEGER;
BEGIN
  -- Nur ausführen, wenn Status auf FINISHED gesetzt wurde
  IF NEW.status = 'FINISHED' AND (OLD.status IS NULL OR OLD.status != 'FINISHED') THEN
    -- Iteriere über alle Tipps für dieses Match, die noch keine Punkte haben oder aktualisiert werden müssen
    FOR tip_record IN
      SELECT id, predicted_home_score, predicted_away_score
      FROM tips
      WHERE match_id = NEW.id
        AND predicted_home_score IS NOT NULL
        AND predicted_away_score IS NOT NULL
    LOOP
      -- Berechne Punkte mit der bestehenden Funktion
      calculated_points := calculate_tip_points(
        tip_record.predicted_home_score,
        tip_record.predicted_away_score,
        NEW.score_home,
        NEW.score_away
      );

      -- Update Tipp mit berechneten Punkten
      UPDATE tips
      SET points = calculated_points
      WHERE id = tip_record.id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Wird ausgelöst, wenn ein Match aktualisiert wird
DROP TRIGGER IF EXISTS auto_calculate_tip_points ON matches;
CREATE TRIGGER auto_calculate_tip_points
  AFTER UPDATE OF status, score_home, score_away ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'FINISHED')
  EXECUTE FUNCTION calculate_tips_for_finished_match();

-- Optional: Berechne Punkte für bereits beendete Matches (falls nötig)
-- Diese Funktion kann manuell aufgerufen werden, um bestehende Matches zu verarbeiten
CREATE OR REPLACE FUNCTION recalculate_all_finished_matches()
RETURNS void AS $$
DECLARE
  match_record RECORD;
  tip_record RECORD;
  calculated_points INTEGER;
BEGIN
  FOR match_record IN
    SELECT id, score_home, score_away
    FROM matches
    WHERE status = 'FINISHED'
  LOOP
    FOR tip_record IN
      SELECT id, predicted_home_score, predicted_away_score
      FROM tips
      WHERE match_id = match_record.id
        AND predicted_home_score IS NOT NULL
        AND predicted_away_score IS NOT NULL
    LOOP
      calculated_points := calculate_tip_points(
        tip_record.predicted_home_score,
        tip_record.predicted_away_score,
        match_record.score_home,
        match_record.score_away
      );

      UPDATE tips
      SET points = calculated_points
      WHERE id = tip_record.id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
