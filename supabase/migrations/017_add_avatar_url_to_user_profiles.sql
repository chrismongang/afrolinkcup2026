-- Migration: Füge avatar_url Feld zu user_profiles hinzu
-- Dies speichert die URL zum Profilbild (entweder Supabase Storage URL oder default_profilpic.png)

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Setze default für bestehende User
UPDATE user_profiles
SET avatar_url = '/images/default_profilpic.png'
WHERE avatar_url IS NULL;
