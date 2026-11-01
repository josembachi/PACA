import { createClient } from "@/lib/supabase";

export interface LedgerEntry {
  user_id: string;
  amount: number;
  currency: string;
  transaction_type: 'CREDIT' | 'DEBIT';
  category: 'COURSE_PAYMENT' | 'TUTOR_PAYOUT' | 'PLATFORM_FEE' | 'REFUND' | 'ESCROW_LOCK' | 'ESCROW_RELEASE';
  reference_id?: string;
  description: string;
}

export interface EscrowUpdate {
  status: 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  bank_reference?: string;
}

export const financeService = {
  /**
   * Records a financial movement in the double-entry ledger.
   */
  async recordTransaction(entry: LedgerEntry) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("financial_ledger")
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Locks funds in escrow for a specific payment.
   */
  async lockFunds(paymentId: string, amount: number, currency: string) {
    const supabase = createClient();

    // 1. Create Escrow Transaction
    const { data: escrow, error: escrowError } = await supabase
      .from("escrow_transactions")
      .insert({
        payment_id: paymentId,
        amount: amount,
        currency: currency,
        status: 'LOCKED',
      })
      .select()
      .single();

    if (escrowError) throw escrowError;

    // 2. Record in Ledger as ESCROW_LOCK
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        user_id: (await this.getPaymentUserId(paymentId)).id,
        amount: -amount,
        currency: currency,
        transaction_type: 'DEBIT',
        category: 'ESCROW_LOCK',
        reference_id: escrow.id,
        description: `Funds locked in escrow for payment ${paymentId}`,
      });

    if (ledgerError) throw ledgerError;

    return escrow;
  },

  /**
   * Releases funds from escrow to the teacher.
   */
  async releaseFunds(escrowId: string, teacherUserId: string) {
    const supabase = createClient();

    // 1. Update Escrow Status
    const { data: escrow, error: updateError } = await supabase
      .from("escrow_transactions")
      .update({ 
        status: 'RELEASED', 
        released_at: new Date().toISOString() 
      })
      .eq("id", escrowId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Record Credit to Teacher in Ledger
    const { error: ledgerError } = await supabase
      .from("financial_ledger")
      .insert({
        user_id: teacherUserId,
        amount: escrow.amount,
        currency: escrow.currency,
        transaction_type: 'CREDIT',
        category: 'ESCROW_RELEASE',
        reference_id: escrow.id,
        description: `Funds released from escrow for transaction ${escrow.id}`,
      });

    if (ledgerError) throw ledgerError;

    return { success: true };
  },

  /**
   * Helper to get the user ID associated with a payment.
   */
  async getPaymentUserId(paymentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payments")
      .select("createdByUserId")
      .eq("id", paymentId)
      .single();

    if (error) throw error;
    return { id: data.createdByUserId };
  },

  /**
   * Retrieves the financial history for a user.
   */
  async getUserLedger(userId: string, params: { page: number; limit: number }) {
    const supabase = createClient();
    const from = params.page * params.limit;
    const to = from + params.limit - 1;

    const { data, error } = await supabase
      .from("financial_ledger")
      .select("*")
      .eq("user_id", userId)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
