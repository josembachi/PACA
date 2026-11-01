"use client";

import React, { useState, useEffect } from "react";
import { PageShell } from "../_components/PageShell";
import { financeService } from "@/services/financeService";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

export default function TeacherFinancePage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ balance: 0, pending: 0 });

  useEffect(() => {
    async function loadFinance() {
      try {
        // In a real app, we'd use the current teacher's ID
        const data = await financeService.getUserLedger("placeholder-teacher-id", { page: 0, limit: 50 });
        setLedger(data);

        // Calculate totals
        const balance = data.reduce((acc, curr) => curr.transaction_type === 'CREDIT' ? acc + curr.amount : acc - curr.amount, 0);
        setTotals({ balance, pending: 0 }); // Pending would come from escrow_transactions table
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gestão <span className="text-primary-600">Financeira</span></h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Acompanha os teus ganhos e transações de Escrow.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-gray-500">
              <DollarSign size={20} />
              <span className="text-sm font-medium">Saldo Disponível</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totals.balance} USD</p>
          </div>
          <div className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <Clock size={20} />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Em Garantia (Escrow)</</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totals.pending} USD</p>
          </div>
          <div className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-green-500">
              <ArrowUpCircle size={20} />
              <span className, "text-sm font-medium text-gray-500 dark:text-gray-400">Total Recebido</span>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">1,200 USD</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Histórico de Transações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Data</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Categoria</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Descrição</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">A carregar...</td></tr>
                ) : ledger.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Nenhuma transação encontrada.</td></tr>
                ) : (
                  ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">{tx.description}</td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${tx.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.transaction_type === 'CREDIT' ? '+' : '-'} {tx.amount} {tx.currency}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
