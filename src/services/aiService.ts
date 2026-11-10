import { createClient } from "@/lib/supabase";
import { OpenAI } from "openai";
import { Groq } from "groq-sdk";

export type AIProvider = 'OPENAI' | 'GROQ';

export interface AIRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const aiService = {
  /**
   * Generic method to generate text using the configured provider.
   */
  async generateText(provider: AIProvider, request: AIRequest): Promise<AIResponse> {
    if (provider === 'OPENAI') {
      return this.handleOpenAI(request);
    } else if (provider === 'GROQ') {
      return this.handleGroq(request);
    } else {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
  },

  /**
   * Specialized method for educational content generation (e.g., exercises).
   */
  async generateEducationalContent(type: 'EXERCISE' | 'EXPLANATION', subject: string, topic: string, level: string) {
    const prompt = `You are an expert educator. Generate a ${type} for the subject ${subject}, specifically about ${topic}, tailored for a ${level} level student. 
    Ensure the content is pedagogical, clear, and encouraging. 
    If it is an exercise, provide the solution at the end.`;

    return this.generateText('GROQ', { // Defaulting to Groq for speed/cost in educational tasks
      prompt,
      temperature: 0.7,
    });
  },

  /**
   * Specialized method for course recommendations based on student interests.
   */
  async recommendCourses(studentInterests: string[], availableCourses: any[]) {
    const context = JSON.stringify(availableCourses);
    const prompt = `Based on the following student interests: ${studentInterests.join(', ')}, 
    and the available courses: ${context}, 
    recommend the top 3 most suitable courses. Explain why for each recommendation.`;

    return this.generateText('OPENAI', {
      prompt,
      temperature: 0.3,
    });
  },

  // ==================== PROVIDER HANDLERS ====================

  async handleOpenAI(request: AIRequest): Promise<AIResponse> {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return {
        text: `Estou em modo local do PACA. Adiciona NEXT_PUBLIC_OPENAI_API_KEY para ativar respostas reais da IA.\n\nPedido: ${request.prompt.slice(0, 220)}`,
        provider: 'OPENAI',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: request.context || "You are a helpful educational assistant for the PACA platform." },
        { role: "user", content: request.prompt },
      ],
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    });

    return {
      text: response.choices[0].message.content || "",
      provider: 'OPENAI',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  },

  async handleGroq(request: AIRequest): Promise<AIResponse> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY && !process.env.GROQ_API_KEY) {
      return {
        text: `Estou em modo local do PACA. Adiciona GROQ_API_KEY para ativar respostas reais da IA.\n\nPedido: ${request.prompt.slice(0, 220)}`,
        provider: 'GROQ',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }

    const groq = new Groq({
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
    });

    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: request.context || "You are a helpful educational assistant for the PACA platform." },
        { role: "user", content: request.prompt },
      ],
      max_tokens: request.maxTokens || 1000,
      temperature: request.temperature || 0.7,
    });

    return {
      text: response.choices[0].message.content || "",
      provider: 'GROQ',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  },
};
