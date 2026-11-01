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
-- We use DO blocks to ensure policies are only created if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Student profiles are viewable by everyone') THEN
        CREATE POLICY "Student profiles are viewable by everyone" 
        ON public.student_profiles FOR SELECT 
        USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own student profile') THEN
        CREATE POLICY "Users can update own student profile" 
        ON public.student_profiles FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own student profile') THEN
        CREATE POLICY "Users can insert own student profile" 
        ON public.student_profiles FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

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

-- 5. Add a trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid duplication errors
DROP TRIGGER IF EXISTS set_updated_at_student_profiles ON public.student_profiles;

CREATE TRIGGER set_updated_at_student_profiles
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- Note: The signup trigger should be applied to auth.users. 
-- To apply it via SQL:
-- CREATE TRIGGER on_auth_user_created_student
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_student_profile();

-- 6. Update existing tutor_profiles to ensure they are linked to the new logic
-- (Assuming tutor_profiles already exists from TutorHub)
-- No changes needed to tutor_profiles table structure, but we now treat it as an optional "Teacher Mode" profile.
