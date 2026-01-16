-- Füge actual_start_time Feld zur matches Tabelle hinzu
-- Dieses Feld wird gesetzt, wenn das Spiel im Admin-Bereich gestartet wird

ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ;

-- Kommentar hinzufügen
COMMENT ON COLUMN matches.actual_start_time IS 'Tatsächliche Startzeit des Spiels, gesetzt wenn Status auf LIVE oder LIVE_FIRST_HALF geändert wird';
