"use client";

import React from "react";
import { Trophy, CheckCircle } from "lucide-react";

interface ProgressTrackerProps {
  percentage: number;
  completed: number;
  total: number;
  onClaimCertificate: () => void;
}

export function ProgressTracker({ percentage, completed, total, onClaimCertificate }: ProgressTrackerProps) {
  return (
    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={20} />
          <h4 className="font-bold text-gray-800 dark:text-white">Teu Progresso</h4>
        </div>
        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{percentage}%</span>
      </div>

      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-600 transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{completed} de {total} aulas concluídas</span>
        {percentage === 100 && (
          <button 
            onClick={onClaimCertificate}
            className="flex items-center gap-1 text-green-600 font-bold hover:underline"
          >
            <CheckCircle size={12} /> Obter Certificado
          </button>
        )}
      </div>
    </div>
  );
}
