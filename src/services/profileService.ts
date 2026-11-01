import { createClient } from "@/lib/supabase";
import type { StudentProfile, TutorProfile, TutorProfileInput } from "@/lib/types";

export const profileService = {
  /**
   * Retrieves the complete dual profile of a user.
   */
  async getFullProfile(userId: string) {
    const supabase = createClient();

    const [studentRes, tutorRes] = await Promise.all([
      supabase.from("student_profiles").select("*").eq("user_id", userId).single(),
      supabase.from("tutor_profiles").select("*").eq("user_id", userId).single(),
    ]);

    return {
      student: studentRes.data,
      teacher: tutorRes.data,
    };
  },

  /**
   * Updates the student profile.
   */
  async updateStudentProfile(userId: string, updates: Partial<StudentProfile>) {
    const supabase = createClient();
    
    // Remove userId from updates to prevent modification
    const { userId: _, ...cleanUpdates } = updates;

    const { data, error } = await supabase
      .from("student_profiles")
      .update(cleanUpdates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Updates or creates the teacher profile (Tutor Mode).
   */
  async updateTeacherProfile(userId: string, updates: TutorProfileInput) {
    const supabase = createClient();

    // Check if profile exists
    const { data: existing } = await supabase
      .from("tutor_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("tutor_profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new teacher profile (Activate Teacher Mode)
      const { data, error } = await supabase
        .from("tutor_profiles")
        .insert({
          user_id: userId,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  /**
   * Deactivates teacher mode by removing the tutor profile.
   */
  async deactivateTeacherMode(userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("tutor_profiles")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  },
};
