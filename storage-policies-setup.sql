-- =============================================
-- STORAGE POLICIES FOR EXISTING BUCKET
-- Run this if you already have the 'gallery' bucket
-- =============================================

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Drop any existing policies for gallery bucket (if they exist)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletions" ON storage.objects;

-- Create new policies for gallery bucket
CREATE POLICY "gallery_bucket_insert" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_bucket_select" ON storage.objects
    FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "gallery_bucket_update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'gallery');

CREATE POLICY "gallery_bucket_delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'gallery');

-- Grant permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO anon;
GRANT SELECT ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
