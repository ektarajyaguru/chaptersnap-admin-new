-- =============================================
-- SAFE SETUP - Run this in Supabase Dashboard
-- =============================================

-- 1. Create the gallery_images table (safe to run)
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path TEXT NOT NULL,
    title TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for better performance (safe to run)
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON public.gallery_images(created_at DESC);

-- 3. Enable RLS on your table (safe to run)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 4. Create a simple policy for your table (safe to run)
-- This allows all operations for all users (public access)
CREATE POLICY "Allow all operations for gallery_images" ON public.gallery_images
    FOR ALL USING (true);

-- 5. Create storage bucket through Dashboard instead of SQL
-- Go to Storage → Buckets → Create new bucket
-- Name: gallery
-- Public bucket: Yes

-- =============================================
-- ALTERNATIVE: Use Supabase Dashboard for Storage
-- =============================================

-- Instead of running storage commands here, please:

-- 1. Go to your Supabase Dashboard
-- 2. Navigate to "Storage" in the left sidebar
-- 3. Click "New bucket"
-- 4. Create a bucket named "gallery"
-- 5. Set it as "Public bucket"
-- 6. In the bucket settings, go to "Policies" tab
-- 7. Delete any existing policies
-- 8. Create new policies with these settings:
--
-- Policy 1 - Allow uploads:
-- Name: "Allow uploads"
-- Allowed operation: INSERT
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'
--
-- Policy 2 - Allow downloads:
-- Name: "Allow downloads"
-- Allowed operation: SELECT
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'
--
-- Policy 3 - Allow updates:
-- Name: "Allow updates"
-- Allowed operation: UPDATE
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'
--
-- Policy 4 - Allow deletions:
-- Name: "Allow deletions"
-- Allowed operation: DELETE
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'
