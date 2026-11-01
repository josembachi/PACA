"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { aiService } from "@/services/aiService";
import { aiContextService } from "@/services/aiContextService";
import { Course, Lesson, StudentProfile } from "@/lib/types";

interface AIStudyAssistantProps {
  course: Course;
  lesson: Lesson;
  student: StudentProfile;
}

export function AIStudyAssistant({ course, lesson, student }: AIStudyAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const context = await aiContextService.getLessonContext(course, lesson, student);
      const response = await aiService.generateText('GROQ', {
        prompt: userMsg,
        context: context,
        temperature: 0.7,
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Desculpa, tive um problema técnico. Podes tentar novamente?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen ? (
        <div className={`transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col ${
          isExpanded ? "w-[600px] h-[700px]" : "w-80 h-[500px]"
        }`}>
          {/* Header */}
          <div className="p-4 bg-primary-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span className="font-bold">Assistente PACA AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <Sparkles size={24} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Olá! Sou o teu assistente de IA. Posso ajudar-te a entender melhor esta aula de <strong className="text-gray-800 dark:text-gray-200">{lesson.title}</strong>. O que queres saber?
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? "bg-primary-600 text-white rounded-tr-none" 
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Pergunta algo sobre a aula..." 
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 p-4 bg-primary-600 text-white rounded-full shadow-2xl hover:bg-primary-700 transition-all hover:scale-105"
        >
          <div className="p-2 bg-white/20 rounded-full">
            <Sparkles size={24} />
          </div>
          <span className="font-bold pr-2">Assistente IA</span>
        </button>
      )}
    </div>
  );
}
