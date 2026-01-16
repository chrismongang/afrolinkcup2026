-- News System: Articles, Authors, and Team Relations

-- News Authors (simple username/password system)
CREATE TABLE IF NOT EXISTS news_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News Articles
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title_image_url TEXT,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES news_authors(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction Table: News Articles <-> Teams (Many-to-Many)
CREATE TABLE IF NOT EXISTS news_article_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_article_team UNIQUE (article_id, team_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON news_articles(slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_author_id ON news_articles(author_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_match_id ON news_articles(match_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_article_teams_article_id ON news_article_teams(article_id);
CREATE INDEX IF NOT EXISTS idx_news_article_teams_team_id ON news_article_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_news_authors_username ON news_authors(username);

-- Function: Generate slug from title
CREATE OR REPLACE FUNCTION generate_news_slug(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug
  base_slug := TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(title_text, '[^a-zA-Z0-9]+', '-', 'g')));
  
  -- Ensure it's not empty
  IF base_slug = '' THEN
    base_slug := 'article';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM news_articles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at automatically
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_articles_updated_at'
  ) THEN
    CREATE TRIGGER update_news_articles_updated_at
      BEFORE UPDATE ON news_articles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS Policies
ALTER TABLE news_authors ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_authors'
      AND policyname = 'News authors sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "News authors sind öffentlich lesbar" ON news_authors
      FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_articles'
      AND policyname = 'News articles sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "News articles sind öffentlich lesbar" ON news_articles
      FOR SELECT USING (true);
  END IF;
END $$;

ALTER TABLE news_article_teams ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_article_teams'
      AND policyname = 'News article teams sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "News article teams sind öffentlich lesbar" ON news_article_teams
      FOR SELECT USING (true);
  END IF;
END $$;
