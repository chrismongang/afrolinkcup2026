-- Helper-Script: Admin-User erstellen
-- 
-- Anleitung:
-- 1. Registriere dich über die App oder Supabase Auth Dashboard
-- 2. Kopiere deine User ID (UUID) aus Authentication → Users
-- 3. Ersetze <DEINE-USER-ID> unten mit deiner tatsächlichen User ID
-- 4. Führe dieses Script im Supabase SQL Editor aus

-- Ersetze <DEINE-USER-ID> mit deiner User ID aus Supabase Auth
INSERT INTO admin_users (user_id) 
VALUES ('<DEINE-USER-ID>')
ON CONFLICT (user_id) DO NOTHING;

-- Prüfe ob es funktioniert hat
SELECT 
  u.email,
  u.id as user_id,
  CASE WHEN au.user_id IS NOT NULL THEN '✅ Admin' ELSE '❌ Kein Admin' END as status
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.user_id
WHERE u.id = '<DEINE-USER-ID>';

