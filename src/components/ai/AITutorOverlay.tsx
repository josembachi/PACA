"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, X, Sparkles } from "lucide-react";
import { aiTutorService, AIIntervention } from "@/services/aiTutorService";
import { Course, Lesson, StudentProfile } from "@/lib/types";
import { LessonProgress } from "@/lib/types";

interface AITutorOverlayProps {
  course: Course;
  lesson: Lesson;
  student: StudentProfile;
  progress: LessonProgress[];
}

export function AITutorOverlay({ course, lesson, student, progress }: AITutorOverlayProps) {
  const [intervention, setIntervention] = useState<AI, AIIntervention | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchIntervention() {
      setIsLoading(true);
      try {
        const result = await aiTutorService.getProactiveIntervention(course, lesson, student, progress);
        if (result) {
          setIntervention(result);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("AI Tutor error:", error);
      } finally {
        setIsLoading(false);
      }
    }

    // Trigger intervention after 10 seconds of viewing the lesson
    const timer = setTimeout(fetchIntervention, 10000);
    return () => clearTimeout(timer);
  }, [course, lesson, student, progress]);

  if (!isVisible || !intervention) return null;

  const typeColors = {
    SIMPLIFICATION: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    CHALLENGE: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    HINT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="fixed bottom-24 right-6 z-[90] animate-in slide-in-from-right-full duration-500">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4 max-w-xs relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded-md ${typeColors[intervention.type]}`}>
            <Sparkles size={14} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Dica do Tutor IA</span>
        </div>
        
        <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
          {intervention.content}
        </p>
        
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button 
            onClick={() => setIsVisible(false)}
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
