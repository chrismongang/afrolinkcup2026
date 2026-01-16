-- Migration: Performance-Optimierungen für Skalierung (8000+ User)
-- Diese Migration fügt wichtige Indexes hinzu, die für die Performance bei vielen Usern kritisch sind

-- Index für Leaderboard-Sortierung (total_points + created_at)
-- Wichtig: Composite Index für ORDER BY total_points DESC, created_at ASC
-- Dies beschleunigt die Leaderboard-Abfrage erheblich bei vielen Usern
CREATE INDEX IF NOT EXISTS idx_user_profiles_leaderboard 
ON user_profiles(total_points DESC, created_at ASC)
WHERE user_id IS NOT NULL;

-- Index für Tips mit Punkten (für Punkteberechnung und Aggregationen)
CREATE INDEX IF NOT EXISTS idx_tips_points_calculation
ON tips(match_id, user_profile_id, points)
WHERE points IS NOT NULL AND user_profile_id IS NOT NULL;

-- Index für Match Events Sortierung (minute + created_at)
-- Beschleunigt die Sortierung von Events in Match-Detail-Seiten
CREATE INDEX IF NOT EXISTS idx_match_events_sorting
ON match_events(match_id, minute ASC, created_at ASC);

-- Index für News Articles Sortierung (created_at DESC für Homepage)
-- Bereits vorhanden in Migration 012, aber hier zur Sicherheit
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at_desc
ON news_articles(created_at DESC);

-- Index für user_profiles total_points allein (für schnelle Aggregationen)
-- Zusätzlich zum Composite Index für spezifische Queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_points
ON user_profiles(total_points DESC)
WHERE user_id IS NOT NULL;
