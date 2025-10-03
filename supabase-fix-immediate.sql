-- =============================================
-- SAFE IMMEDIATE FIX
-- =============================================

-- 1. Create the gallery_images table (this should work)
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

-- 3. Enable RLS on your table
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- 4. Create a simple policy for your table
CREATE POLICY "Allow all operations for gallery_images" ON public.gallery_images
    FOR ALL USING (true);

-- =============================================
-- STORAGE SETUP (Do this in Dashboard)
-- =============================================

-- For storage issues, please use the Supabase Dashboard:

-- 1. Go to Storage → Buckets → New bucket
-- 2. Name: "gallery", Public: Yes
-- 3. Go to Policies tab in the bucket
-- 4. Delete any existing policies
-- 5. Create new policies for ALL operations (INSERT, SELECT, UPDATE, DELETE)
-- 6. Set Target roles to "All (authenticated + anonymous)"
-- 7. Policy command: bucket_id = 'gallery'
