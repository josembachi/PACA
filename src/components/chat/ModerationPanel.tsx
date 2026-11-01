"use client";

import React, { useState, useEffect } from "react";
import { moderationService, Report } from "@/services/moderationService";
import { AlertTriangle, Check, X, Trash2 } from "lucide-react";

export function ModerationPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await moderationService.getPendingReports();
        setReports(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleAction = async (reportId: string, action: 'DISMISS' | 'DELETE_CONTENT' | 'BAN_USER') => {
    try {
      await moderationService.resolveReport(reportId, action);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="text-red-500" size={28} />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Painel de Moderação</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma denúncia pendente. Tudo limpo! ✨</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map(report => (
            <div key={report.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {report.content_type}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  Denúncia contra: {report.reported_user_id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">"{report.reason}"</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAction(report.id, 'DISMISS')}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Ignorar"
                >
                  <Check size={20} />
                </button>
                <button 
                  onClick={() => handleAction(report.id, 'DELETE_CONTENT')}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Eliminar Conteúdo"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => handleAction(report.id, 'BAN_USER')}
                  className="p-2 text-gray-400 hover:text-red-800 transition-colors"
                  title="Banir Utilizador"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
