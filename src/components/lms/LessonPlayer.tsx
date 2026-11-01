"use client";

import React from "react";
import { CheckCircle, FileText, PlayCircle, Download } from "lucide-react";
import { Lesson } from "@/lib/types";

interface LessonPlayerProps {
  lesson: Lesson;
  isCompleted: boolean;
  onMarkCompleted: () => void;
}

export function LessonPlayer({ lesson, isCompleted, onMarkCompleted }: LessonPlayerProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{lesson.title}</h1>
        <button 
          onClick={onMarkCompleted}
          className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all ${
            isCompleted 
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20"
          }`}
        >
          {isCompleted ? <CheckCircle size={18} /> : null}
          {isCompleted ? "Concluído" : "Marcar como Concluído"}
        </button>
      </div>

      <div className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
        {lesson.content_type === 'video' && lesson.video_url ? (
          <iframe 
            src={lesson.video_url} 
            className="w-full h-full" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-12 text-center">
            {lesson.content_type === 'document' ? <FileText size={64} /> : <PlayCircle size={64} />}
            <p className="mt-4 text-lg">Este conteúdo não é um vídeo. Veja os materiais abaixo.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Conteúdo da Aula</h3>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
              {lesson.content_body || "Nenhuma descrição detalhada fornecida para esta aula."}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-3xl">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Download size={18} /> Materiais de Apoio
            </h4>
            {lesson.attachment_url ? (
              <a 
                href={lesson.attachment_url} 
                target="_blank" 
                className="block p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium hover:border-primary-500 transition-colors"
              >
                Descarregar Material da Aula
              </a>
            ) : (
              <p className="text-sm text-gray-500">Nenhum anexo disponível.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
