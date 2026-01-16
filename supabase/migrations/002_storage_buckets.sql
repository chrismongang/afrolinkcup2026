-- Storage Buckets für Avatar-Uploads

-- Avatar Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für Avatar Storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Avatar-Uploads sind öffentlich lesbar'
  ) THEN
    CREATE POLICY "Avatar-Uploads sind öffentlich lesbar"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authentifizierte User können Avatare hochladen'
  ) THEN
    CREATE POLICY "Authentifizierte User können Avatare hochladen"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'avatars' 
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
      AND policyname = 'User können eigene Avatare löschen'
  ) THEN
    CREATE POLICY "User können eigene Avatare löschen"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'avatars'
      AND auth.role() = 'authenticated'
      -- Optional: Prüfe ob der User der Besitzer ist
    );
  END IF;
END $$;

