-- Arena Screen Configuration
-- Speichert die Konfiguration für Screen 1 und Screen 2

CREATE TABLE IF NOT EXISTS arena_screen_config (
  screen_id TEXT PRIMARY KEY CHECK (screen_id IN ('screen1', 'screen2')),
  view TEXT NOT NULL CHECK (
    view IN ('match', 'tabelle', 'torschuetzen', 'news', 'leaderboard', 'ticker', 'qr-code')
  ),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Initiale Werte setzen
INSERT INTO arena_screen_config (screen_id, view)
VALUES 
  ('screen1', 'match'),
  ('screen2', 'match')
ON CONFLICT (screen_id) DO NOTHING;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_arena_screen_config_screen_id ON arena_screen_config(screen_id);

-- RLS Policies (jeder kann lesen, nur Admins können schreiben)
ALTER TABLE arena_screen_config ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann lesen (für Arena-Screens - keine Auth erforderlich)
CREATE POLICY "Anyone can read arena screen config"
  ON arena_screen_config
  FOR SELECT
  USING (true);

-- Policy: Nur Admins können schreiben
CREATE POLICY "Only admins can update arena screen config"
  ON arena_screen_config
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert arena screen config"
  ON arena_screen_config
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );
