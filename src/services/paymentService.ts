import { createClient } from "@/lib/supabase";
import { financeService } from "./financeService";

export interface PaymentRequest {
  amount: number;
  currency: string;
  courseId?: string;
  contractId?: string;
  userId: string;
}

export const paymentService = {
  /**
   * Processes a payment and initiates the Escrow lock.
   */
  async processPayment(payload: PaymentRequest) {
    const supabase = createClient();

    // 1. Create the payment record
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert({
        amount: payload.amount,
        currency: payload.currency,
        contractId: payload.contractId,
        createdByUserId: payload.userId,
        status: 'PENDING',
        provider: 'BAI', // Defaulting to BAI for the PACA vision
      })
      .select()
      .single();

    if (payError) throw payError;

    // 2. Trigger the Escrow Lock via financeService
    try {
      await financeService.lockFunds(payment.id, payload.amount, payload.currency);
    } catch (error) {
      console.error("Escrow lock failed:", error);
      // In a real app, we would rollback the payment or mark it as failed
    }

    return payment;
  },

  /**
   * Validates and releases funds from Escrow to the teacher.
   */
  async releasePaymentToTeacher(paymentId: string, teacherUserId: string) {
    const supabase = createClient();

    // 1. Find the escrow transaction associated with this payment
    const { data: escrow, error: escError } = await supabase
      .from("escrow_transactions")
      .select("id, amount, currency")
      .eq("payment_id", paymentId)
      .single();

    if (escError || !escrow) throw new Error("No escrow transaction found for this payment");

    // 2. Release funds via financeService
    return await financeService.releaseFunds(escrow.id, teacherUserId);
  },

  /**
   * Handles payment refunds.
   */
  async refundPayment(paymentId: string) {
    const supabase = createClient();
    
    const { data: escrow, error: escError } = await supabase
      .from("escrow_transactions")
      .select("id, amount, currency")
      .eq("payment_id", paymentId)
      .single();

    if (escError || !escrow) throw new Error("No escrow transaction found for refund");

    // Update escrow status to REFUNDED
    const { error: updateError } = await supabase
      .from("escrow_transactions")
      .update({ status: 'REFUNDED', refunded_at: new Date().toISOString() })
      .eq("id", escrow.id);

    if (updateError) throw updateError;

    // Record refund in ledger
    await financeService.recordTransaction({
      user_id: (await this.getPaymentUserId(paymentId)).id,
      amount: escrow.amount,
      currency: escrow.currency,
      transaction_type: 'CREDIT',
      category: 'REFUND',
      reference_id: escrow.id,
      description: `Refund for payment ${paymentId}`,
    });

    return { success: true };
  },

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
};
