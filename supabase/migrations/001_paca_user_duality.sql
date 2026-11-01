-- Migration: Implement User Role Duality (Student/Teacher)
-- This migration creates the student_profiles table and ensures the system supports dual roles.

-- 1. Create student_profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    grade_level INTEGER,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_student_user UNIQUE (user_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can view any student profile (publicly available info)
CREATE POLICY "Student profiles are viewable by everyone" 
ON public.student_profiles FOR SELECT 
USING (true);

-- Users can only update their own student profile
CREATE POLICY "Users can update own student profile" 
ON public.student_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only insert their own student profile
CREATE POLICY "Users can insert own student profile" 
ON public.student_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Add a trigger to automatically create a student profile on signup
-- This ensures every user starts as a student by default
CREATE OR REPLACE FUNCTION public.handle_new_user_student_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.student_profiles (user_id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger should be applied to auth.users. 
-- Since we are in a migration file, we assume the trigger is managed via Supabase Dashboard or a separate auth migration.
-- To apply it via SQL:
-- CREATE TRIGGER on_auth_user_created_student
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_student_profile();

-- 5. Update existing tutor_profiles to ensure they are linked to the new logic
-- (Assuming tutor_profiles already exists from TutorHub)
-- No changes needed to tutor_profiles table structure, but we now treat it as an optional "Teacher Mode" profile.
