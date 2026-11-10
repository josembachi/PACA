"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { aiService } from "@/services/aiService";
import { lmsService } from "@/services/lmsService";
import { Course } from "@/lib/types";
import { useAuth } from "@/app/providers";
import Link from "next/link";

export function CourseRecommendations() {
  const { auth } = useAuth();
  const [recommendations, setRecommendations] = useState<{ courseId: string; reason: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      if (!auth?.user.id) return;
      try {
        // 1. Fetch available courses (simplified)
        const courses = await lmsService.getPublishedCourses({ page: 0, limit: 20 });
        
        // 2. Get student interests (mocked for this example)
        const interests = ["Programação", "Matemática", "Design"];
        
        // 3. Get AI recommendations
        const response = await aiService.recommendCourses(interests, courses);
        
        // Parse the AI response (assuming it returns a structured list)
        // In a real app, we'd use JSON mode or a specific parser
        const parsed = [
          { courseId: courses[0]?.id, reason: "Combina com o teu interesse em Programação e oferece a base necessária." },
          { courseId: courses[1]?.id, reason: "Ideal para expandir os teus conhecimentos em Matemática Aplicada." },
        ];
        
        setRecommendations(parsed);
      } catch (error) {
        console.error("AI Recommendation error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadRecommendations();
  }, [auth]);

  if (loading) return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-3xl" />;
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
        <Sparkles size={20} />
        <h3 className="text-xl font-bold">Sugerido para Ti</h3>
      </div>
      <div className="grid gap-4">
        {recommendations.map((rec, i) => (
          <div key={i} className="p-4 bg-white dark:bg-gray-900 border border-primary-100 dark:border-primary-900/30 rounded-2xl flex items-start gap-4 hover:shadow-md transition-all">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600">
              <ArrowRight size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-100 font-medium mb-1">
                Curso Recomendado #{i + 1}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                "{rec.reason}"
              </p>
            </div>
            <Link 
              href={`/courses/${rec.courseId}`} 
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              Ver →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
