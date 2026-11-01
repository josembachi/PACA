"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import { CourseSidebar } from "@/components/lms/CourseSidebar";
import { LessonPlayer } from "@/components/lms/LessonPlayer";
import { Course, Module, Lesson } from "@/lib/types";
import { PageShell } from "../_components/PageShell";

export default function CourseViewPage() {
  const params = useParams();
  const courseId = params.id as string;
  
  const [courseData, setCourseData] = useState<{ course: Course; modules: Module[]; lessons: Record<string, Lesson[]> } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await lmsService.getCourseDetails(courseId);
        
        // Transform modules and lessons into a usable format
        const lessonsMap: Record<string, Lesson[]> = {};
        data.modules.forEach(mod => {
          lessonsMap[mod.id] = (mod as any).lessons || [];
        });

        setCourseData({
          course: data,
          modules: data.modules,
          lessons: lessonsMap
        });

        // Set first lesson as active by default
        if (data.modules[0]?.id) {
          const firstModuleId = data.modules[0].id;
          const firstLesson = lessonsMap[firstModuleId]?.[0];
          if (firstLesson) setActiveLessonId(firstLesson.id);
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId]);

  const handleMarkCompleted = async (lessonId: string) => {
    try {
      // In a real app, we'd use the actual enrollmentId
      await lmsService.markLessonCompleted("placeholder-enrollment-id", lessonId);
      setCompletedLessons(prev => [...prev, lessonId]);
    } catch (error) {
      console.error("Error marking lesson completed:", error);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PageShell>
    );
  }

  if (!courseData) return <PageShell><div>Curso não encontrado.</div></PageShell>;

  const activeLesson = Object.values(courseData.lessons).flat().find(l => l.id === activeLessonId);

  return (
    <PageShell>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <CourseSidebar 
          modules={courseData.modules} 
          lessons={courseData.lessons} 
          activeLessonId={activeLessonId || undefined}
          onLessonSelect={setActiveLessonId}
          completedLessons={completedLessons}
        />
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-950">
          {activeLesson ? (
            <LessonPlayer 
              lesson={activeLesson} 
              isCompleted={completedLessons.includes(activeLesson.id)}
              onMarkCompleted={() => handleMarkCompleted(activeLesson.id)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Selecione uma aula para começar a aprender.
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
