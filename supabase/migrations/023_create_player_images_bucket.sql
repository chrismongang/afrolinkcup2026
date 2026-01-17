-- Storage Bucket für Spieler-Bilder

-- Player Images Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-images', 'player-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für Player Images Storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Player images sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Player images sind öffentlich lesbar"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'player-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authentifizierte User können Spieler-Bilder hochladen'
  ) THEN
    CREATE POLICY "Authentifizierte User können Spieler-Bilder hochladen"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'player-images' 
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'User können Spieler-Bilder löschen'
  ) THEN
    CREATE POLICY "User können Spieler-Bilder löschen"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'player-images'
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'User können Spieler-Bilder aktualisieren'
  ) THEN
    CREATE POLICY "User können Spieler-Bilder aktualisieren"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'player-images'
      AND auth.role() = 'authenticated'
    );
  END IF;
END $$;
