import { aiService } from "./aiService";
import { Course, Lesson, StudentProfile, LessonProgress } from "@/lib/types";

export interface AIIntervention {
  type: 'SIMPLIFICATION' | 'CHALLENGE' | 'HINT';
  content: string;
  trigger: string;
}

export const aiTutorService = {
  /**
   * Analyzes student progress and current lesson to provide a proactive intervention.
   */
  async getProactiveIntervention(
    course: Course, 
    lesson: Lesson, 
    student: StudentProfile, 
    progress: LessonProgress[]
  ): Promise<AIIntervention | null> {
    const completedCount = progress.filter(p => p.is_completed).length;
    const totalLessons = 10; // Simplified for example

    const prompt = `
      You are a proactive AI Tutor. 
      Course: ${course.title}
      Lesson: ${lesson.title}
      Student Progress: ${completedCount}/${totalLessons} lessons completed.
      Student Interests: ${student.interests.join(", ")}
      
      Based on the lesson content: "${lesson.content_body}", 
      provide a short, proactive intervention.
      
      - If the student is struggling (low progress), provide a SIMPLIFICATION.
      - If the student is progressing fast, provide a CHALLENGE.
      - Otherwise, provide a HINT to connect this lesson to their interests.
      
      Return the result strictly as a JSON object:
      { "type": "SIMPLIFICATION" | "CHALLENGE" | "HINT", "content": "...", "trigger": "..." }
    `;

    const response = await aiService.generateText('GROQ', {
      prompt,
      temperature: 0.6,
    });

    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      return JSON.parse(jsonMatch[0]) as AIIntervention;
    } catch (error) {
      console.error("Error parsing AI Tutor intervention:", error);
      return null;
    }
  },
};
