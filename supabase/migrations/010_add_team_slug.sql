-- Add short slug for team URLs

ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS team_slug TEXT;

-- Generate slugs from team names for existing rows
UPDATE teams
SET team_slug = NULLIF(
  TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))),
  ''
)
WHERE team_slug IS NULL OR team_slug = '';

-- Ensure slug uniqueness and presence
CREATE UNIQUE INDEX IF NOT EXISTS teams_team_slug_unique ON teams (team_slug);

ALTER TABLE teams
  ALTER COLUMN team_slug SET NOT NULL;
