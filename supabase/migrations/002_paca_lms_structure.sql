-- Migration: Implement LMS (Academy) Structure
-- This migration creates tables for courses, modules, lessons, and enrollments.

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video', 'text', 'document', 'quiz')),
    content_body TEXT,
    video_url TEXT,
    attachment_url TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    
    CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);

-- 5. Create lesson_progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT unique_progress UNIQUE (enrollment_id, lesson_id)
);

-- 6. Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies (Idempotent)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Published courses are viewable by everyone') THEN
        CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (is_published = true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage their own courses') THEN
        CREATE POLICY "Teachers can manage their own courses" ON public.courses FOR ALL USING (auth.uid() = (SELECT user_id FROM public.tutor_profiles WHERE id = teacher_id));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Modules are viewable if course is published') THEN
        CREATE POLICY "Modules are viewable if course is published" ON public.modules FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_published = true));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lessons are viewable if course is published') THEN
        CREATE POLICY "Lessons are viewable if course is published" ON public.lessons FOR SELECT USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON m.course_id = c.id WHERE m.id = module_id AND c.is_published = true));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own enrollments') THEN
        CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.student_profiles WHERE id = student_id AND user_id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can view their course enrollments') THEN
        CREATE POLICY "Teachers can view their course enrollments" ON public.enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.courses c JOIN public.tutor_profiles tp ON c.teacher_id = tp.id WHERE c.id = course_id AND tp.user_id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own lesson progress') THEN
        CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (EXISTS (SELECT 1 FROM public.enrollments e JOIN public.student_profiles sp ON e.student_id = sp.id WHERE e.id = enrollment_id AND sp.user_id = auth.uid()));
    END IF;
END $$;

-- 8. Automatic updated_at triggers
-- Reusing the handle_updated_at function from migration 001
DROP TRIGGER IF EXISTS set_updated_at_courses ON public.courses;
CREATE TRIGGER set_updated_at_courses BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_modules ON public.modules;
CREATE TRIGGER set_updated_at_modules BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_lessons ON public.lessons;
CREATE TRIGGER set_updated_at_lessons BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
