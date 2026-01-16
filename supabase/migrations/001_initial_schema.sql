-- Afrolink Cup 2026 - Initial Database Schema
-- Erstellt alle Tabellen, Constraints, und RLS-Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELLEN
-- ============================================

-- Teams
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  "group" TEXT NOT NULL CHECK ("group" IN ('A', 'B')),
  colors JSONB,
  mascot_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  jersey_number INTEGER NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_home_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team_away_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('GROUP', 'SEMIFINAL', 'THIRD_PLACE', 'FINAL')),
  "group" TEXT CHECK ("group" IN ('A', 'B')),
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (
    status IN (
      'SCHEDULED', 'LIVE', 'LIVE_FIRST_HALF', 'HALF_TIME',
      'LIVE_SECOND_HALF', 'EXTRA_TIME', 'PENALTIES', 'FINISHED'
    )
  ),
  score_home INTEGER NOT NULL DEFAULT 0,
  score_away INTEGER NOT NULL DEFAULT 0,
  score_home_penalties INTEGER,
  score_away_penalties INTEGER,
  mvp_voting_start TIMESTAMPTZ,
  mvp_voting_end TIMESTAMPTZ,
  mvp_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT group_only_for_group_stage CHECK (
    (stage = 'GROUP' AND "group" IS NOT NULL) OR
    (stage != 'GROUP' AND "group" IS NULL)
  )
);

-- Match Events
CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (
    type IN (
      'GOAL', 'OWN_GOAL', 'ASSIST', 'YELLOW', 'RED',
      'START', 'HT', 'FT', 'ET_START', 'PEN_START', 'SUBSTITUTION'
    )
  ),
  minute INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT NOT NULL UNIQUE,
  favorite_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  avatar_type TEXT NOT NULL DEFAULT 'none' CHECK (avatar_type IN ('preset', 'custom', 'none')),
  avatar_key TEXT,
  anonymous_session_id TEXT,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tips
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  anonymous_session_id TEXT,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points INTEGER CHECK (points IN (0, 2, 3, 4)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT tip_user_or_session CHECK (
    (user_profile_id IS NOT NULL) OR (anonymous_session_id IS NOT NULL)
  ),
  CONSTRAINT unique_tip_per_user_per_match UNIQUE (match_id, user_profile_id),
  CONSTRAINT unique_tip_per_session_per_match UNIQUE (match_id, anonymous_session_id)
);

-- MVP Votes
CREATE TABLE IF NOT EXISTS mvp_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  anonymous_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vote_user_or_session CHECK (
    (user_profile_id IS NOT NULL) OR (anonymous_session_id IS NOT NULL)
  ),
  CONSTRAINT unique_vote_per_user_per_match UNIQUE (match_id, user_profile_id),
  CONSTRAINT unique_vote_per_session_per_match UNIQUE (match_id, anonymous_session_id)
);

-- Arena Display (Singleton)
CREATE TABLE IF NOT EXISTS arena_display (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mode TEXT NOT NULL DEFAULT 'LIVE_MATCH' CHECK (
    mode IN ('LIVE_MATCH', 'TABLE', 'SCORERS', 'SCHEDULE', 'MVP_PROMO')
  ),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT arena_display_singleton CHECK (id = '00000000-0000-0000-0000-000000000001')
);

-- ============================================
-- INDEXES (für Performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_home_id ON matches(team_home_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_away_id ON matches(team_away_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_events_team_id ON match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_events_player_id ON match_events(player_id);
CREATE INDEX IF NOT EXISTS idx_tips_match_id ON tips(match_id);
CREATE INDEX IF NOT EXISTS idx_tips_user_profile_id ON tips(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_tips_anonymous_session_id ON tips(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_mvp_votes_match_id ON mvp_votes(match_id);
CREATE INDEX IF NOT EXISTS idx_mvp_votes_player_id ON mvp_votes(player_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- ============================================
-- FUNKTIONEN
-- ============================================

-- Funktion: Aktualisiere updated_at automatisch
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für match_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_match_events_updated_at'
  ) THEN
    CREATE TRIGGER update_match_events_updated_at
      BEFORE UPDATE ON match_events
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger für tips
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_tips_updated_at'
  ) THEN
    CREATE TRIGGER update_tips_updated_at
      BEFORE UPDATE ON tips
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Funktion: Berechne Tipp-Punkte (CHECK24-System)
CREATE OR REPLACE FUNCTION calculate_tip_points(
  predicted_home INTEGER,
  predicted_away INTEGER,
  actual_home INTEGER,
  actual_away INTEGER
) RETURNS INTEGER AS $$
DECLARE
  predicted_diff INTEGER;
  actual_diff INTEGER;
  predicted_result TEXT;
  actual_result TEXT;
BEGIN
  -- Exaktes Ergebnis: 4 Punkte
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 4;
  END IF;

  predicted_diff := predicted_home - predicted_away;
  actual_diff := actual_home - actual_away;

  -- Bestimme Ergebnis (Heim-Sieg, Unentschieden, Auswärts-Sieg)
  IF predicted_diff > 0 THEN
    predicted_result := 'HOME_WIN';
  ELSIF predicted_diff < 0 THEN
    predicted_result := 'AWAY_WIN';
  ELSE
    predicted_result := 'DRAW';
  END IF;

  IF actual_diff > 0 THEN
    actual_result := 'HOME_WIN';
  ELSIF actual_diff < 0 THEN
    actual_result := 'AWAY_WIN';
  ELSE
    actual_result := 'DRAW';
  END IF;

  -- Unentschieden korrekt: 3 Punkte
  IF predicted_result = 'DRAW' AND actual_result = 'DRAW' THEN
    RETURN 3;
  END IF;

  -- Richtige Differenz + richtige Tendenz: 3 Punkte
  IF predicted_diff = actual_diff AND predicted_result = actual_result THEN
    RETURN 3;
  END IF;

  -- Richtige Tendenz: 2 Punkte
  IF predicted_result = actual_result THEN
    RETURN 2;
  END IF;

  -- Falsch: 0 Punkte
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Funktion: Aktualisiere total_points nach Tipp-Berechnung
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_profile_id IS NOT NULL AND NEW.points IS NOT NULL THEN
    UPDATE user_profiles
    SET total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM tips
      WHERE user_profile_id = NEW.user_profile_id
        AND points IS NOT NULL
    )
    WHERE id = NEW.user_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für tips
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_total_points_after_tip'
  ) THEN
    CREATE TRIGGER update_total_points_after_tip
      AFTER INSERT OR UPDATE OF points ON tips
      FOR EACH ROW
      WHEN (NEW.points IS NOT NULL)
      EXECUTE FUNCTION update_user_total_points();
  END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Teams: Öffentlich lesbar
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'teams'
      AND policyname = 'Teams sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Teams sind öffentlich lesbar" ON teams
      FOR SELECT USING (true);
  END IF;
END $$;

-- Players: Öffentlich lesbar
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'players'
      AND policyname = 'Players sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Players sind öffentlich lesbar" ON players
      FOR SELECT USING (true);
  END IF;
END $$;

-- Matches: Öffentlich lesbar
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'matches'
      AND policyname = 'Matches sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Matches sind öffentlich lesbar" ON matches
      FOR SELECT USING (true);
  END IF;
END $$;

-- Match Events: Öffentlich lesbar
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_events'
      AND policyname = 'Match events sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Match events sind öffentlich lesbar" ON match_events
      FOR SELECT USING (true);
  END IF;
END $$;

-- User Profiles: Öffentlich lesbar (für Leaderboard)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'User profiles sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "User profiles sind öffentlich lesbar" ON user_profiles
      FOR SELECT USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'User kann eigenes Profil erstellen'
  ) THEN
    CREATE POLICY "User kann eigenes Profil erstellen" ON user_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'User kann eigenes Profil updaten'
  ) THEN
    CREATE POLICY "User kann eigenes Profil updaten" ON user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Tips: Öffentlich lesbar, jeder kann eigene Tipps erstellen/updaten
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tips'
      AND policyname = 'Tips sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Tips sind öffentlich lesbar" ON tips
      FOR SELECT USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tips'
      AND policyname = 'Jeder kann Tipps erstellen'
  ) THEN
    CREATE POLICY "Jeder kann Tipps erstellen" ON tips
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tips'
      AND policyname = 'User kann eigene Tipps updaten'
  ) THEN
    CREATE POLICY "User kann eigene Tipps updaten" ON tips
      FOR UPDATE USING (
        (user_profile_id IS NOT NULL AND user_profile_id IN (
          SELECT id FROM user_profiles WHERE user_id = auth.uid()
        ))
        OR anonymous_session_id IS NOT NULL
      );
  END IF;
END $$;

-- MVP Votes: Öffentlich lesbar, jeder kann voten
ALTER TABLE mvp_votes ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mvp_votes'
      AND policyname = 'MVP votes sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "MVP votes sind öffentlich lesbar" ON mvp_votes
      FOR SELECT USING (true);
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mvp_votes'
      AND policyname = 'Jeder kann MVP voten'
  ) THEN
    CREATE POLICY "Jeder kann MVP voten" ON mvp_votes
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Arena Display: Öffentlich lesbar
ALTER TABLE arena_display ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'arena_display'
      AND policyname = 'Arena display ist öffentlich lesbar'
  ) THEN
    CREATE POLICY "Arena display ist öffentlich lesbar" ON arena_display
      FOR SELECT USING (true);
  END IF;
END $$;

-- ============================================
-- INITIAL DATA (Singleton für arena_display)
-- ============================================

-- Erstelle Singleton für arena_display
INSERT INTO arena_display (id, mode) 
VALUES ('00000000-0000-0000-0000-000000000001', 'LIVE_MATCH')
ON CONFLICT DO NOTHING;

-- ============================================
-- REALTIME ENABLE (nach allen Tabellen)
-- ============================================

-- Enable Realtime für bestimmte Tabellen
-- Hinweis: Diese Statements müssen NACH dem Erstellen der Tabellen ausgeführt werden
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE matches;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'match_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE match_events;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'arena_display'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE arena_display;
  END IF;
END $$;

