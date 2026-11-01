"use client";

import React from "react";
import { BookOpen, CheckCircle, Circle } from "lucide-react";
import { Module, Lesson } from "@/lib/types";

interface CourseSidebarProps {
  modules: Module[];
  lessons: Record<string, Lesson[]>;
  activeLessonId?: string;
  onLessonSelect: (lessonId: string) => void;
  completedLessons: string[];
}

export function CourseSidebar({ modules, lessons, activeLessonId, onLessonSelect, completedLessons }: CourseSidebarProps) {
  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Conteúdo do Curso</h3>
        <p className="text-xs text-gray-500 mt-1">Acompanha o teu progresso aqui</p>
      </div>

      <div className="p-4 space-y-6">
        {modules.map((module) => (
          <div key={module.id} className="space-y-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              <BookOpen size={14} />
              {module.title}
            </div>
            <div className="space-y-1">
              {(lessons[module.id] || []).map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => onLessonSelect(lesson.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                    activeLessonId === lesson.id 
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <span className="truncate">{lesson.title}</span>
                  {completedLessons.includes(lesson.id) ? (
                    <CheckCircle size={14} className="text-green-500" />
                  ) : (
                    <Circle size={14} className="text-gray-300 dark:text-gray-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
