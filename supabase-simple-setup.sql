-- =============================================
-- SIMPLE SUPABASE SETUP (No custom auth table)
-- =============================================

-- 1. Create the gallery_images table
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    path TEXT NOT NULL,
    title TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON public.gallery_images(created_at DESC);

-- 3. Enable RLS on your table (optional - for future use)
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 4. Create a simple policy (allows all operations for now)
CREATE POLICY "Allow all operations for gallery_images" ON public.gallery_images
    FOR ALL USING (true);

-- =============================================
-- STORAGE SETUP INSTRUCTIONS
-- =============================================

-- For storage, use the Supabase Dashboard:

-- 1. Go to Storage → New bucket → Name: "gallery" → Public: Yes → Create
-- 2. Click on "gallery" bucket → Policies tab
-- 3. Delete any existing policies (if any)
-- 4. Create these 4 policies:

-- Policy 1: INSERT (for uploads)
-- Name: "Allow uploads"
-- Allowed operation: INSERT
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'

-- Policy 2: SELECT (for downloads)
-- Name: "Allow downloads"
-- Allowed operation: SELECT
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'

-- Policy 3: UPDATE (for modifications)
-- Name: "Allow updates"
-- Allowed operation: UPDATE
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'

-- Policy 4: DELETE (for deletions)
-- Name: "Allow deletions"
-- Allowed operation: DELETE
-- Target roles: All (authenticated + anonymous)
-- Policy command: bucket_id = 'gallery'

-- =============================================
-- CREATE AUTH USERS (Do this in Dashboard)
-- =============================================

-- Go to Authentication → Users → "Add user" and create:
-- - Email: admin@chaptersnap.com, Password: admin123
-- - Email: manager@chaptersnap.com, Password: manager123
-- - Email: editor@chaptersnap.com, Password: editor123

-- That's it! The login page will authenticate against these users.
