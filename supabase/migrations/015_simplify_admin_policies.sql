-- Vereinfache Admin-Policies: Ersetze is_admin() durch true
-- Damit kann jeder mit dem Admin-Passwort alles steuern

-- Matches: Ersetze is_admin() durch true
DROP POLICY IF EXISTS "Admins können Matches erstellen/updaten" ON matches;
CREATE POLICY "Admins können Matches erstellen/updaten" ON matches
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins können Matches updaten" ON matches;
CREATE POLICY "Admins können Matches updaten" ON matches
  FOR UPDATE USING (true);

-- Match Events: Ersetze is_admin() durch true
DROP POLICY IF EXISTS "Admins können Events erstellen" ON match_events;
CREATE POLICY "Admins können Events erstellen" ON match_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins können Events updaten" ON match_events;
CREATE POLICY "Admins können Events updaten" ON match_events
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins können Events löschen" ON match_events;
CREATE POLICY "Admins können Events löschen" ON match_events
  FOR DELETE USING (true);

-- Arena Display: Ersetze is_admin() durch true
DROP POLICY IF EXISTS "Admins können Arena Display updaten" ON arena_display;
CREATE POLICY "Admins können Arena Display updaten" ON arena_display
  FOR UPDATE USING (true);

-- Teams: Ersetze is_admin() durch true
DROP POLICY IF EXISTS "Admins können Teams erstellen/updaten" ON teams;
CREATE POLICY "Admins können Teams erstellen/updaten" ON teams
  FOR ALL WITH CHECK (true);

-- Players: Ersetze is_admin() durch true
DROP POLICY IF EXISTS "Admins können Players erstellen/updaten" ON players;
CREATE POLICY "Admins können Players erstellen/updaten" ON players
  FOR ALL WITH CHECK (true);
