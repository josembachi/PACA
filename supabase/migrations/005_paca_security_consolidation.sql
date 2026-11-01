-- Migration: Security Consolidation for PACA Ecosystem
-- This migration refines RLS policies across all modules to ensure strict access control.

-- 1. Profiles Security
-- Ensure student profiles are only editable by the owner
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own student profile') THEN
        CREATE POLICY "Users can update own student profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. LMS Security Refinement
-- Courses: Only the teacher who created the course can edit it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers can manage their own courses') THEN
        CREATE POLICY "Teachers can manage their own courses" ON public.courses FOR ALL USING (auth.uid() = (SELECT user_id FROM public.tutor_profiles WHERE id = teacher_id));
    END IF;
END $$;

-- Lessons: Students can only view lessons of courses they are enrolled in OR published courses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can view enrolled lessons') THEN
        CREATE POLICY "Students can view enrolled lessons" ON public.lessons FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.enrollments e 
                JOIN public.modules m ON m.course_id = e.course_id 
                WHERE m.id = lessons.module_id AND e.student_id = (SELECT id FROM public.student_profiles WHERE user_id = auth.uid())
            )
            OR 
            EXISTS (
                SELECT 1 FROM public.modules m 
                JOIN public.courses c ON m.course_id = c.id 
                WHERE m.id = lessons.module_id AND c.is_published = true
            )
        );
    END IF;
END $$;

-- 3. Communication Security Refinement
-- Conversations: Only participants can read or send messages
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Participants can view conversations') THEN
        CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.conversation_participants 
                WHERE conversation_id = conversations.id AND user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 4. Financial Security Refinement
-- Ledger: Absolute privacy. Only the user and system admins can see the ledger
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own ledger') THEN
        CREATE POLICY "Users can view own ledger" ON public.financial_ledger FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Escrow: Only the student, the teacher, and the admin can view the escrow status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Involved parties can view escrow') THEN
        CREATE POLICY "Involved parties can view escrow" ON public.escrow_transactions FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.payments p 
                WHERE p.id = escrow_transactions.payment_id 
                AND (p.createdByUserId = auth.uid() OR EXISTS (
                    SELECT 1 FROM public.contracts c 
                    WHERE c.id = p.contractId AND (c.tutorId = auth.uid() OR c.parentId = auth.uid())
                ))
            )
        );
    END IF;
END $$;
