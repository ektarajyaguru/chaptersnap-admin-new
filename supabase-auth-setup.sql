-- =============================================
-- SUPABASE AUTHENTICATION SETUP
-- =============================================

-- Create admin_users table to store admin user information and roles
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own record
CREATE POLICY "Users can view own admin record" ON public.admin_users
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow admins to manage all records
CREATE POLICY "Admins can manage all admin records" ON public.admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE user_id = auth.uid()
            AND role IN ('super_admin', 'admin')
            AND is_active = true
        )
    );

-- =============================================
-- DUMMY ADMIN DATA
-- =============================================

-- Insert dummy admin users (you'll need to create these users in Supabase Auth first)
-- Step 1: Go to Authentication → Users → Add user for each email below
-- Step 2: Run this SQL to assign roles

INSERT INTO public.admin_users (email, full_name, role) VALUES
('admin@chaptersnap.com', 'ChapterSnap Super Admin', 'super_admin'),
('manager@chaptersnap.com', 'Content Manager', 'admin'),
('editor@chaptersnap.com', 'Content Editor', 'editor')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- SETUP INSTRUCTIONS
-- =============================================

-- To set up authentication properly:

-- 1. SUPABASE AUTH USERS (Do this in Dashboard):
--    Go to Authentication → Users → "Add user"
--    Create these users:
--    - Email: admin@chaptersnap.com, Password: admin123
--    - Email: manager@chaptersnap.com, Password: manager123
--    - Email: editor@chaptersnap.com, Password: editor123

-- 2. RUN THIS SQL (after creating auth users):
--    This will link the auth users to the admin_users table with proper roles

-- 3. UPDATE YOUR LOGIN PAGE:
--    The login page will use Supabase Auth to authenticate users
--    After successful login, check their role from admin_users table

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true;

    RETURN COALESCE(user_role, 'guest');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'admin')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
