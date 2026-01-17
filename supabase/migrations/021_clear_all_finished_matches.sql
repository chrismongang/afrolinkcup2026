-- Clear all finished matches, events, and tips
-- Führe diese Migration VOR dem offiziellen Turnierstart aus

-- ============================================
-- LÖSCHE ABHÄNGIGE DATEN ZUERST
-- ============================================

-- Lösche alle MVP Votes für abgeschlossene Matches
DELETE FROM mvp_votes 
WHERE match_id IN (
  SELECT id FROM matches WHERE status = 'FINISHED'
);

-- Lösche alle Tips für abgeschlossene Matches
DELETE FROM tips 
WHERE match_id IN (
  SELECT id FROM matches WHERE status = 'FINISHED'
);

-- Lösche alle Match Events für abgeschlossene Matches
DELETE FROM match_events 
WHERE match_id IN (
  SELECT id FROM matches WHERE status = 'FINISHED'
);

-- ============================================
-- LÖSCHE ABGESCHLOSSENE MATCHES
-- ============================================

DELETE FROM matches 
WHERE status = 'FINISHED';

-- ============================================
-- HINWEIS
-- ============================================
-- Nach dem Ausführen dieser Migration sind alle abgeschlossenen Matches,
-- Events und Tipps gelöscht. Die Teams und Spieler bleiben erhalten.
