-- Migration: Implement Financial Ledger and Escrow System
-- This migration creates the infrastructure for protected payments and BAI integration.

-- 1. Create financial_ledger table
-- This is a double-entry bookkeeping system to track all movements of funds
CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('CREDIT', 'DEBIT')),
    category TEXT NOT NULL CHECK (category IN ('COURSE_PAYMENT', 'TUTOR_PAYOUT', 'PLATFORM_FEE', 'REFUND', 'ESCROW_LOCK', 'ESCROW_RELEASE')),
    reference_id UUID, -- ID of the related payment, contract, or escrow transaction
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create escrow_transactions table
-- Specifically for the "Deposit Guarantee" flow (BAI Integration)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT DEFAULT 'LOCKED' CHECK (status IN ('LOCKED', 'RELEASED', 'REFUNDED', 'DISPUTED')),
    locked_at TIMESTAMPTZ DEFAULT now(),
    released_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    bank_reference TEXT, -- Reference from BAI
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Ledger: Users can only see their own financial history
CREATE POLICY "Users can view own ledger" ON public.financial_ledger FOR SELECT USING (auth.uid() = user_id);

-- Escrow: Only involved parties (Student, Teacher, Admin) can view
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

-- 5. Automatic updated_at triggers
CREATE TRIGGER set_updated_at_escrow BEFORE UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
