"use client";

import React, { useState } from "react";
import { X, CreditCard, Lock, CheckCircle } from "lucide-react";
import { paymentService } from "@/services/paymentService";

interface PaymentModalProps {
  amount: number;
  currency: string;
  userId: string;
  courseId?: string;
  contractId?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentModal({ amount, currency, userId, courseId, contractId, onSuccess, onClose }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');

  const handlePayment = async () => {
    setLoading(true);
    setStep('PROCESSING');
    try {
      await paymentService.processPayment({
        amount,
        currency,
        userId,
        courseId,
        contractId,
      });
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Payment failed:", error);
      setStep('INPUT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Pagamento Seguro</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-8 text-center">
          {step === 'INPUT' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
                  <CreditCard size={48} />
                </div>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Valor a pagar</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white">{amount} {currency}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3 text-left border border-blue-100 dark:border-blue-800">
                <Lock size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Este pagamento será retido em conta de garantia (Escrow) e libertado ao professor após a conclusão do serviço.
                </p>
              </div>
              <button 
                onClick={handlePayment}
                className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
              >
                Confirmar Pagamento
              </button>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="py-12 space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-solid" />
              </div>
              <p className="text-lg font-medium text-gray-800 dark:text-white">Processando transação...</p>
              <p className="text-sm text-gray-500">A comunicar com o sistema bancário BAI</p>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="py-12 space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                  <CheckCircle size={64} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pagamento Confirmado!</h3>
              <p className="text-gray-500 dark:text-gray-400">O valor foi retido com sucesso e o teu acesso foi libertado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
