-- Fix admin_users RLS policy to avoid recursive check
-- Führe diese Migration NACH 007 aus

-- Entferne alte Policy (rekursiv und kann Admin-Login blockieren)
DROP POLICY IF EXISTS "Admin users sind nur für Admins sichtbar" ON admin_users;

-- Erlaube Admin-Usern, ihren eigenen Eintrag zu lesen
CREATE POLICY "Admin users können eigenen Eintrag lesen" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);
