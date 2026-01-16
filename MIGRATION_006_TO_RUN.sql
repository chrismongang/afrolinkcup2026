-- Migration 006: Füge predicted_winner Feld zu tips Tabelle hinzu
-- Führe diese Migration im Supabase SQL Editor aus

-- Füge predicted_winner Spalte hinzu (nullable, da bestehende Tipps noch keinen haben)
ALTER TABLE tips
ADD COLUMN IF NOT EXISTS predicted_winner TEXT CHECK (predicted_winner IN ('HOME', 'AWAY', 'DRAW'));

-- Index für bessere Performance bei Abfragen der Verteilung
CREATE INDEX IF NOT EXISTS idx_tips_predicted_winner ON tips(match_id, predicted_winner);

-- Update Constraint: Ein Tipp muss entweder predicted_winner ODER predicted_home_score/predicted_away_score haben
-- (Anonyme User können nur Gewinner-Tipp abgeben, registrierte User können beides)
-- WICHTIG: Wir müssen zuerst die NOT NULL Constraints entfernen, bevor wir neue Constraints hinzufügen
DO $$ 
BEGIN
  -- Entferne NOT NULL Constraints (falls sie existieren)
  ALTER TABLE tips ALTER COLUMN predicted_home_score DROP NOT NULL;
  ALTER TABLE tips ALTER COLUMN predicted_away_score DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore if columns are already nullable
    NULL;
END $$;

-- Neue Constraint: Mindestens predicted_winner ODER predicted_home_score/predicted_away_score muss gesetzt sein
-- Entferne alte Constraint falls vorhanden
ALTER TABLE tips
DROP CONSTRAINT IF EXISTS tip_has_prediction;

ALTER TABLE tips
ADD CONSTRAINT tip_has_prediction CHECK (
  (predicted_winner IS NOT NULL) OR 
  (predicted_home_score IS NOT NULL AND predicted_away_score IS NOT NULL)
);
