-- Fix Players RLS Policy: Ensure UPDATE operations work correctly
-- The previous policy "FOR ALL WITH CHECK (true)" doesn't properly handle UPDATE operations
-- which require both USING (to check existing rows) and WITH CHECK (to check new values)

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins können Players erstellen/updaten" ON players;

-- Create separate policies for each operation to ensure proper coverage
CREATE POLICY "Admins können Players erstellen" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins können Players updaten" ON players
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Admins können Players löschen" ON players
  FOR DELETE USING (true);
