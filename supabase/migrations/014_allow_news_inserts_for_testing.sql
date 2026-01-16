-- Temporäre RLS-Policies für News-System (für Testing ohne Authentifizierung)
-- TODO: Diese Policies später durch sichere, authentifizierte Policies ersetzen

-- Allow INSERT into news_authors for everyone (temporarily)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_authors'
      AND policyname = 'Jeder kann Autoren erstellen (TEMPORÄR)'
  ) THEN
    CREATE POLICY "Jeder kann Autoren erstellen (TEMPORÄR)" ON news_authors
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow INSERT into news_articles for everyone (temporarily)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_articles'
      AND policyname = 'Jeder kann Artikel erstellen (TEMPORÄR)'
  ) THEN
    CREATE POLICY "Jeder kann Artikel erstellen (TEMPORÄR)" ON news_articles
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow UPDATE and DELETE on news_articles for everyone (temporarily)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_articles'
      AND policyname = 'Jeder kann Artikel bearbeiten (TEMPORÄR)'
  ) THEN
    CREATE POLICY "Jeder kann Artikel bearbeiten (TEMPORÄR)" ON news_articles
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_articles'
      AND policyname = 'Jeder kann Artikel löschen (TEMPORÄR)'
  ) THEN
    CREATE POLICY "Jeder kann Artikel löschen (TEMPORÄR)" ON news_articles
      FOR DELETE USING (true);
  END IF;
END $$;

-- Allow INSERT into news_article_teams for everyone (temporarily)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_article_teams'
      AND policyname = 'Jeder kann Team-Verknüpfungen erstellen (TEMPORÄR)'
  ) THEN
    CREATE POLICY "Jeder kann Team-Verknüpfungen erstellen (TEMPORÄR)" ON news_article_teams
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Allow DELETE on news_article_teams for everyone (temporarily)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'news_article_teams'
      AND policyname = 'Jeder kann Team-Verknüpfungen löschen (TEMPORÄR)'
  ) THEN
    CREATE POLICY "Jeder kann Team-Verknüpfungen löschen (TEMPORÄR)" ON news_article_teams
      FOR DELETE USING (true);
  END IF;
END $$;
