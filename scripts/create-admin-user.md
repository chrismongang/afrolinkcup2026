# Admin-User erstellen

Um einen Admin-User zu erstellen, musst du:

## 1. User in Supabase Auth erstellen

**Option A: Über Supabase Dashboard**
1. Gehe zu: Authentication → Users → Add User
2. Erstelle einen neuen User mit E-Mail und Passwort
3. Notiere dir die User-ID (UUID)

**Option B: Über SQL (empfohlen für Entwicklung)**
```sql
-- Erstelle einen User in Supabase Auth
-- Hinweis: Dies muss über die Supabase Auth API oder Dashboard gemacht werden
-- Das Passwort wird automatisch gehashed

-- Nachdem der User erstellt wurde, füge ihn zur admin_users Tabelle hinzu:
INSERT INTO admin_users (user_id)
VALUES ('DEINE-USER-ID-HIER')
ON CONFLICT (user_id) DO NOTHING;
```

**Option C: Über Supabase CLI**
```bash
# Erstelle einen User (wird automatisch in auth.users eingetragen)
supabase auth users create --email admin@example.com --password dein-passwort
```

## 2. User-ID in admin_users Tabelle eintragen

Nachdem du den User erstellt hast, musst du seine ID in die `admin_users` Tabelle eintragen:

```sql
-- Finde die User-ID des gerade erstellten Users
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Füge den User zur admin_users Tabelle hinzu
INSERT INTO admin_users (user_id)
VALUES ('DEINE-USER-ID-HIER')
ON CONFLICT (user_id) DO NOTHING;
```

## 3. Login testen

1. Gehe zu `/admin/login`
2. Logge dich mit der E-Mail und dem Passwort ein
3. Du solltest zur Admin-Übersicht weitergeleitet werden

## Wichtige Hinweise

- **E-Mail statt Username**: Das Login verwendet jetzt E-Mail-Adressen
- **Passwort-Sicherheit**: Supabase hashed Passwörter automatisch
- **Mehrere Admins**: Du kannst mehrere Admin-User erstellen, indem du mehrere Einträge in `admin_users` machst
- **User entfernen**: Um Admin-Rechte zu entfernen, lösche einfach den Eintrag aus `admin_users` (der User bleibt in auth.users bestehen)
