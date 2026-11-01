"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { lmsService } from "@/services/lmsService";
import { academicService } from "@/services/academicService";
import { CourseSidebar } from "@/components/lms/CourseSidebar";
import { LessonPlayer } from "@/components/lms/LessonPlayer";
import { ProgressTracker } from "@/components/lms/ProgressTracker";
import { CertificateModal } from "@/components/lms/CertificateModal";
import { Course, Module, Lesson } from "@/lib/types";
import { PageShell } from "../_components/PageShell";
import { useAuth } from "../providers";

export default function CourseViewPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { auth } = useAuth();
  
  const [courseData, setCourseData] = useState<{ course: Course; modules: Module[]; lessons: Record<string, Lesson[]> } | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [progress, setProgress] = useState({ percentage: 0, completed: 0, total: 0 });
  const [showCertificate, setShowCertificate] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await lmsService.getCourseDetails(courseId);
        
        const lessonsMap: Record<string, Lesson[]> = {};
        data.modules.forEach(mod => {
          lessonsMap[mod.id] = (mod as any).lessons || [];
        });

        setCourseData({
          course: data,
          modules: data.modules,
          lessons: lessonsMap
        });

        if (data.modules[0]?.id) {
          const firstModuleId = data.modules[0].id;
          const firstLesson = lessonsMap[firstModuleId]?.[0];
          if (firstLesson) setActiveLessonId(firstLesson.id);
        }

        if (auth?.user.id) {
          const prog = await academicService.calculateProgress(courseId, auth.user.id);
          setProgress({ percentage: prog.percentage, completed: prog.completedLessons, total: prog.totalLessons });
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [courseId, auth?.user.id]);

  const handleMarkCompleted = async (lessonId: string) => {
    try {
      // In a real app, we'd use the actual enrollmentId
      await lmsService.markLessonCompleted("placeholder-enrollment-id", lessonId);
      setCompletedLessons(prev => [...prev, lessonId]);
      
      // Update progress
      if (auth?.user.id) {
        const prog = await academicService.calculateProgress(courseId, auth.user.id);
        setProgress({ percentage: prog.percentage, completed: prog.completedLessons, total: prog.totalLessons });
      }
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

  if (!courseData) return <PageShell><div className="p-8 text-center">Curso não encontrado.</div></PageShell>;

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
          <div className="max-w-5xl mx-auto space-y-8">
            <ProgressTracker 
              percentage={progress.percentage} 
              completed={progress.completed} 
              total={progress.total} 
              onClaimCertificate={() => setShowCertificate(true)}
            />

            {activeLesson ? (
              <LessonPlayer 
                lesson={activeLesson} 
                isCompleted={completedLessons.includes(activeLesson.id)}
                onMarkCompleted={() => handleMarkCompleted(activeLesson.id)}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Selecione uma aula para começar a aprender.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showCertificate && (
        <CertificateModal 
          courseTitle={courseData.course.title} 
          studentName={auth?.user.name || "Estudante"} 
          certificateUrl={`/certificates/${courseId}.pdf`}
          onClose={() => setShowCertificate(false)} 
        />
      )}
    </PageShell>
  );
}
