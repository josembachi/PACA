import { aiService } from "./aiService";
import { Lesson } from "@/lib/types";

export interface AIExercise {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExerciseSet {
  topic: string;
  exercises: AIExercise[];
}

export const aiExerciseService = {
  /**
   * Generates a set of multiple-choice exercises based on a specific lesson.
   */
  async generateExercises(lesson: Lesson, count: number = 3) {
    const prompt = `
      You are an expert educator. Based on the following lesson content, generate ${count} multiple-choice exercises.
      
      Lesson Title: ${lesson.title}
      Lesson Content: ${lesson.content_body}
      
      For each exercise, provide:
      1. A clear and challenging question.
      2. Four possible options.
      3. The index of the correct answer (0-3).
      4. A detailed pedagogical explanation of why that answer is correct.
      
      Return the result strictly as a JSON array of objects with the following keys:
      "question", "options" (array of 4 strings), "correctAnswerIndex" (number), "explanation".
    `;

    const response = await aiService.generateText('GROQ', {
      prompt,
      temperature: 0.7,
    });

    try {
      // Extract JSON from the response text
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON found in AI response");
      
      return JSON.parse(jsonMatch[0]) as AIExercise[];
    } catch (error) {
      console.error("Error parsing AI exercises:", error);
      throw new Error("Failed to generate structured exercises. Please try again.");
    }
  },
};
