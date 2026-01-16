# Admin-Bereich Setup

## Admin-User erstellen

Der Admin-Bereich nutzt jetzt **Supabase Auth** für die Authentifizierung. Du musst einen Admin-User in Supabase erstellen.

### Schritt 1: User in Supabase Auth erstellen

**Über Supabase Dashboard:**
1. Gehe zu: Authentication → Users → Add User
2. Erstelle einen neuen User mit E-Mail und Passwort
3. Notiere dir die User-ID (UUID)

**Über SQL:**
```sql
-- Nachdem der User über das Dashboard erstellt wurde,
-- füge ihn zur admin_users Tabelle hinzu:
INSERT INTO admin_users (user_id)
VALUES ('DEINE-USER-ID-HIER')
ON CONFLICT (user_id) DO NOTHING;
```

Siehe auch: `scripts/create-admin-user.md` für detaillierte Anweisungen.

### Schritt 2: Login

1. Navigiere zu `/admin/login`
2. Logge dich mit der E-Mail und dem Passwort ein
3. Nach erfolgreichem Login wirst du zur Admin-Übersicht weitergeleitet

**Wichtig:**
- Der User muss in der `admin_users` Tabelle eingetragen sein, sonst wird der Zugriff verweigert
- E-Mail statt Username: Das Login verwendet E-Mail-Adressen

## Zugriff

1. Navigiere zu `/admin/login`
2. Logge dich mit den konfigurierten Credentials ein
3. Nach erfolgreichem Login wirst du zur Admin-Übersicht weitergeleitet

## Features

### Match-Übersicht (`/admin`)
- Liste aller Matches mit Status und Score
- Direkter Zugriff auf Match-Detailseite

### Match-Detailseite (`/admin/matches/[id]`)
- **Quick Actions**: Spiel starten, Halbzeit, 2. Halbzeit, Spiel beenden
- **Score ändern**: Manuelle Anpassung von Toren und Elfmeter
- **Status ändern**: Match-Status manuell setzen
- **Startzeit ändern**: Match-Startzeit anpassen
- **Event-Management**:
  - Events erstellen (Tor, Karte, etc.)
  - Events bearbeiten
  - Events löschen (Undo)
  - Manuelle Spielminute bei Event-Erstellung
- **MVP-Voting-Steuerung**: Voting-Fenster verlängern/vorzeitig schließen
- **Arena-Display-Steuerung**: Display-Modus ändern und aktuelles Match setzen

## Sicherheit

- Alle Admin-Routen sind durch Middleware geschützt
- Supabase Auth für sichere Authentifizierung (Passwörter werden gehashed)
- Server-seitige Validierung aller Admin-Aktionen
- RLS-Policies in Supabase gewährleisten zusätzliche Sicherheit
- `is_admin()` Funktion prüft automatisch über RLS-Policies
- Kein Service-Role-Key nötig - RLS funktioniert direkt mit `auth.uid()`
