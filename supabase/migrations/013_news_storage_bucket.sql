-- Storage Bucket für News-Bilder

-- News Images Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für News Images Storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'News-Bilder sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "News-Bilder sind öffentlich lesbar"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'news-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'News-Autoren können Bilder hochladen'
  ) THEN
    CREATE POLICY "News-Autoren können Bilder hochladen"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'news-images'
      -- Note: Authentication will be handled via API route with env var check
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'News-Autoren können Bilder löschen'
  ) THEN
    CREATE POLICY "News-Autoren können Bilder löschen"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'news-images'
      -- Note: Authentication will be handled via API route with env var check
    );
  END IF;
END $$;
