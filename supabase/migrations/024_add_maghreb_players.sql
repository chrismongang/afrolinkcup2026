-- Add Maghreb players roster

-- Get Maghreb team ID
DO $$
DECLARE
  maghreb_team_id UUID;
BEGIN
  SELECT id INTO maghreb_team_id FROM teams WHERE name = 'Maghreb' LIMIT 1;
  
  IF maghreb_team_id IS NULL THEN
    RAISE EXCEPTION 'Maghreb team not found';
  END IF;

  -- Insert Maghreb players
  INSERT INTO players (team_id, name, jersey_number, position, role) VALUES
    (maghreb_team_id, 'Abdelaziz Abdane', 10, 'Spieler', 'player'),
    (maghreb_team_id, 'Audai Elghatous', 8, 'Spieler', 'player'),
    (maghreb_team_id, 'Eren Emirgan', 9, 'Spieler', 'player'),
    (maghreb_team_id, 'Mert Sahin', 7, 'Spieler', 'player'),
    (maghreb_team_id, 'Ishaq Khalil', 5, 'Spieler', 'player'),
    (maghreb_team_id, 'Amir Hedider', 4, 'Spieler', 'player'),
    (maghreb_team_id, 'Hazem Ibrahim', 2, 'Spieler', 'player'),
    (maghreb_team_id, 'Mhammed Sanawar', 6, 'Spieler', 'player'),
    (maghreb_team_id, 'Youssuf Elbelouny', 3, 'Spieler', 'player'),
    (maghreb_team_id, 'Abdelilah Erraji', 11, 'Spieler', 'player'),
    (maghreb_team_id, 'Aladin Bedoui', 1, 'Spieler', 'player')
  ON CONFLICT DO NOTHING;
END $$;
