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

    // 1. Get total lessons in the course
    const { count: totalLessons, error: countError } = await supabase
      .from("lessons")
      .select("*", { count: 'exact', head: true })
      .eq("module_id", "some-logic-to-get-all-modules-of-course"); 
      // Note: In a real implementation, we'd join modules first. 
      // For this logic, we assume a helper or a view exists.

    // 2. Get completed lessons for the student's enrollment
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .single();

    if (!enrollment) throw new Error("Student not enrolled");

    const { count: completedCount, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*", { count: 'exact', head: true })
      .eq("enrollment_id", enrollment.id)
      .eq("is_completed", true);

    if (countError || progressError) throw new Error("Error calculating progress");

    const percentage = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      percentage,
      completedLessons: completedCount || 0,
      totalLessons: totalLessons || 0,
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
