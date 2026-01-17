-- Add match_slug column to matches table

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS match_slug TEXT;

-- Create unique index for match_slug
CREATE UNIQUE INDEX IF NOT EXISTS matches_match_slug_unique ON matches (match_slug) WHERE match_slug IS NOT NULL;

-- Function to generate match slug from team names and date
CREATE OR REPLACE FUNCTION generate_match_slug(
  home_team_name TEXT,
  away_team_name TEXT,
  match_date TIMESTAMPTZ
)
RETURNS TEXT AS $$
DECLARE
  home_slug TEXT;
  away_slug TEXT;
  date_slug TEXT;
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate slugs from team names
  home_slug := LOWER(REGEXP_REPLACE(home_team_name, '[^a-zA-Z0-9]+', '-', 'g'));
  away_slug := LOWER(REGEXP_REPLACE(away_team_name, '[^a-zA-Z0-9]+', '-', 'g'));
  
  -- Generate date slug (YYYY-MM-DD)
  date_slug := TO_CHAR(match_date, 'YYYY-MM-DD');
  
  -- Combine: home-vs-away-YYYY-MM-DD
  base_slug := home_slug || '-vs-' || away_slug || '-' || date_slug;
  
  -- Remove leading/trailing dashes
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Check for uniqueness and add counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM matches WHERE match_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
