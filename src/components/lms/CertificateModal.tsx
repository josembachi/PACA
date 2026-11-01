"use client";

import React from "react";
import { X, Download, Share2 } from "lucide-react";

interface CertificateModalProps {
  courseTitle: string;
  studentName: string;
  certificateUrl: string;
  onClose: () => void;
}

export function CertificateModal({ courseTitle, studentName, certificateUrl, onClose }: CertificateModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Certificado de Conclusão</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-full aspect-[1.414/1] bg-gray-50 dark:bg-gray-800 border-8 border-double border-primary-200 dark:border-primary-900 rounded-lg p-12 flex flex-col items-center justify-center space-y-6 shadow-inner">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4">
              <Trophy size={48} />
            </div>
            <h3 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">Certificado de Mérito</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">Certificamos que</p>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 underline decoration-double">{studentName}</p>
            <p className="text-lg text-gray-600 dark:text-gray-400">concluiu com êxito o curso de</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{courseTitle}</p>
            <div className="mt-8 flex justify-between w-full px-12 text-sm text-gray-400">
              <span>Data: {new Date().toLocaleDateString()}</span>
              <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-8">
            <a 
              href={certificateUrl} 
              download 
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg"
            >
              <Download size={20} /> Descarregar PDF
            </a>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-all">
              <Share2 size={20} /> Partilhar no LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Trophy({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.C10 14 11 18 12 18C13 18 14 14 14 14" />
      <path d="M12 18V22" />
      <path d="M8 10c0-4 4-6 4-6s4 2 4 6" />
    </svg>
  );
}
