import { createClient } from "@/lib/supabase";
import type { Course, CourseInput, Module, ModuleInput, Lesson, LessonInput, Enrollment, LessonProgress } from "@/lib/types";

export const lmsService = {
  // ==================== COURSE MANAGEMENT ====================

  async createCourse(courseData: CourseInput) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourse(courseId: string, updates: Partial<CourseInput>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCourseDetails(courseId: string) {
    const supabase = createClient();
    
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) throw courseError;

    const { data: modules, error: modulesError } = await supabase
      .from("modules")
      .select("*, lessons(*)")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (modulesError) throw modulesError;

    return { ...course, modules };
  },

  async getPublishedCourses(params: { page: number; limit: number }) {
    const supabase = createClient();
    const from = params.page * params.limit;
    const to = from + params.limit - 1;

    const { data, error } = await supabase
      .from("courses")
      .select("*, tutor_profiles(name)")
      .eq("is_published", true)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // ==================== MODULES & LESSONS ====================

  async createModule(moduleData: ModuleInput) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("modules")
      .insert(moduleData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createLesson(lessonData: LessonInput) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lessons")
      .insert(lessonData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ==================== ENROLLMENTS & PROGRESS ====================

  async enrollInCourse(courseId: string, studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ course_id: courseId, student_id: studentId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async markLessonCompleted(enrollmentId: string, lessonId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("lesson_progress")
      .upsert({ 
        enrollment_id: enrollmentId, 
        lesson_id: lessonId, 
        is_completed: true, 
        completed_at: new Date().toISOString() 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStudentProgress(courseId: string, studentId: string) {
    const supabase = createClient();
    
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("student_id", studentId)
      .single();

    if (enrollError || !enrollment) throw new Error("Student not enrolled in this course");

    const { data: progress, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("enrollment_id", enrollment.id);

    if (progressError) throw progressError;
    return progress;
  },
};
