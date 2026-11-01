import { aiService } from "./aiService";
import { Course, Lesson, StudentProfile } from "@/lib/types";

export const aiContextService = {
  /**
   * Prepares a rich context for the AI based on the current lesson and student profile.
   */
  async getLessonContext(course: Course, lesson: Lesson, student: StudentProfile) {
    return `
      You are the PACA AI Study Assistant. 
      Current Course: ${course.title} (Category: ${course.category})
      Current Lesson: ${lesson.title}
      Lesson Content: ${lesson.content_body}
      
      Student Profile:
      - Interests: ${student.interests.join(", ")}
      - Grade Level: ${student.gradeLevel}
      
      Your goal is to help the student understand this specific lesson. 
      Use a pedagogical tone, provide examples related to the student's interests, 
      and always encourage critical thinking.
    `;
  },

  /**
   * Generates a personalized study plan for the course.
   */
  async generateStudyPlan(course: Course, student: StudentProfile) {
    const prompt = `Create a personalized study plan for the course "${course.title}". 
    The student is interested in ${student.interests.join(", ")}. 
    Break it down into weekly goals and suggest complementary resources.`;

    return this.generateText('OPENAI', {
      prompt,
      temperature: 0.5,
    });
  },

  // Helper to call the main aiService
  async generateText(provider: 'OPENAI' | 'GROQ', request: any) {
    return aiService.generateText(provider, request);
  }
};
