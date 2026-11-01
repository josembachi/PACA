-- Migration: Implement Advanced Communication (WhatsApp-like)
-- This migration adds support for Groups, Communities, and Call logs.

-- 1. Create communities table
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Update conversations table to support groups and communities
-- We add a type to distinguish between private, group, and community chats
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS conversation_type TEXT DEFAULT 'PRIVATE' CHECK (conversation_type IN ('PRIVATE', 'GROUP', 'COMMUNITY'));
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS group_avatar_url TEXT;

-- 3. Create call_logs table
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    caller_id UUID NOT NULL REFERENCES auth.users(id),
    call_type TEXT CHECK (call_type IN ('VOICE', 'VIDEO')),
    status TEXT CHECK (status IN ('MISSED', 'COMPLETED', 'REJECTED', 'BUSY')),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies (Idempotent)

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Communities are viewable by everyone') THEN
        CREATE POLICY "Communities are viewable by everyone" ON public.communities FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Community admins can update their community') THEN
        CREATE POLICY "Community admins can update their community" ON public.communities FOR UPDATE USING (auth.uid() = created_by);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create communities') THEN
        CREATE POLICY "Users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Participants can view call logs') THEN
        CREATE POLICY "Participants can view call logs" ON public.call_logs FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.conversation_participants 
                WHERE conversation_id = call_logs.conversation_id AND user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- 6. Automatic updated_at triggers
DROP TRIGGER IF EXISTS set_updated_at_communities ON public.communities;
CREATE TRIGGER set_updated_at_communities BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
