import { createClient } from "@/lib/supabase";
import type { Enrollment, LessonProgress } from "@/lib/types";

export interface CourseProgress {
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

export const academicService = {
  /**
   * Calculates the overall progress of a student in a specific course.
   */
  async calculateProgress(courseId: string, studentId: string): Promise<CourseProgress> {
    const supabase = createClient();

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .maybeSingle();

    if (enrollmentError) throw new Error("Error loading enrollment");
    if (!enrollment) throw new Error("Student not enrolled");

    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    if (modulesError) throw new Error("Error loading course modules");

    const moduleIds = (modules ?? []).map((module) => module.id);

    let totalLessons = 0;
    if (moduleIds.length > 0) {
      const { count, error: lessonCountError } = await supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .in("module_id", moduleIds);

      if (lessonCountError) throw new Error("Error loading lessons");
      totalLessons = count ?? 0;
    }

    const { data: completedLessonsData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("enrollment_id", enrollment.id)
      .eq("is_completed", true);

    if (progressError) throw new Error("Error calculating progress");

    const completedLessons = new Set((completedLessonsData ?? []).map((entry) => entry.lesson_id)).size;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      percentage,
      completedLessons,
      totalLessons,
      isCompleted: percentage === 100,
    };
  },

  /**
   * Generates a digital certificate for a completed course.
   */
  async generateCertificate(enrollmentId: string) {
    const supabase = createClient();
    
    // In a real app, this would trigger an Edge Function to generate a PDF
    const { data, error } = await supabase
      .from("enrollments")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return { certificateUrl: `/certificates/${enrollmentId}.pdf`, data };
  },
};
