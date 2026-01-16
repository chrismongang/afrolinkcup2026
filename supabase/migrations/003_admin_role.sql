-- Admin-Rolle und Helper-Funktionen

-- Erstelle eine Tabelle für Admin-User (optional, alternativ über Supabase Auth Metadata)
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS für admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_users'
      AND policyname = 'Admin users sind nur für Admins sichtbar'
  ) THEN
    CREATE POLICY "Admin users sind nur für Admins sichtbar" ON admin_users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM admin_users WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Helper-Funktion: Prüfe ob User Admin ist
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erweitere RLS-Policies für Admin-Zugriff auf Matches
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'matches'
      AND policyname = 'Admins können Matches erstellen/updaten'
  ) THEN
    CREATE POLICY "Admins können Matches erstellen/updaten" ON matches
      FOR INSERT WITH CHECK (is_admin());
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'matches'
      AND policyname = 'Admins können Matches updaten'
  ) THEN
    CREATE POLICY "Admins können Matches updaten" ON matches
      FOR UPDATE USING (is_admin());
  END IF;
END $$;

-- Erweitere RLS-Policies für Admin-Zugriff auf Match Events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_events'
      AND policyname = 'Admins können Events erstellen'
  ) THEN
    CREATE POLICY "Admins können Events erstellen" ON match_events
      FOR INSERT WITH CHECK (is_admin());
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_events'
      AND policyname = 'Admins können Events updaten'
  ) THEN
    CREATE POLICY "Admins können Events updaten" ON match_events
      FOR UPDATE USING (is_admin());
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_events'
      AND policyname = 'Admins können Events löschen'
  ) THEN
    CREATE POLICY "Admins können Events löschen" ON match_events
      FOR DELETE USING (is_admin());
  END IF;
END $$;

-- Erweitere RLS-Policies für Admin-Zugriff auf Arena Display
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'arena_display'
      AND policyname = 'Admins können Arena Display updaten'
  ) THEN
    CREATE POLICY "Admins können Arena Display updaten" ON arena_display
      FOR UPDATE USING (is_admin());
  END IF;
END $$;

-- Erweitere RLS-Policies für Admin-Zugriff auf Teams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'teams'
      AND policyname = 'Admins können Teams erstellen/updaten'
  ) THEN
    CREATE POLICY "Admins können Teams erstellen/updaten" ON teams
      FOR ALL WITH CHECK (is_admin());
  END IF;
END $$;

-- Erweitere RLS-Policies für Admin-Zugriff auf Players
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'players'
      AND policyname = 'Admins können Players erstellen/updaten'
  ) THEN
    CREATE POLICY "Admins können Players erstellen/updaten" ON players
      FOR ALL WITH CHECK (is_admin());
  END IF;
END $$;

