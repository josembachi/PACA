"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { aiExerciseService, AIExercise } from "@/services/aiExerciseService";
import { Lesson } from "@/lib/types";

interface ExerciseGeneratorProps {
  lesson: Lesson;
}

export function ExerciseGenerator({ lesson }: ExerciseGeneratorProps) {
  const [exercises, setExercises] = useState<AIExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const generate = async () => {
    setLoading(true);
    setShowResults(false);
    setSelectedAnswers({});
    try {
      const data = await aiExerciseService.generateExercises(lesson);
      setExercises(data);
    } catch (error) {
      alert("Erro ao gerar exercícios. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (exIndex: number, optIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({ ...prev, [exIndex]: optIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary-600" size={24} />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Praticar com IA</h3>
        </div>
        <button 
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {exercises.length > 0 ? "Gerar Novos" : "Gerar Exercícios"}
        </button>
      </div>

      {exercises.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Clique no botão acima para gerar exercícios personalizados para esta aula.</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      <div className="space-y-8">
        {exercises.map((ex, idx) => (
          <div key={idx} className="space-y-4">
            <p className="font-medium text-gray-800 dark:text-gray-100">
              {idx + 1}. {ex.question}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ex.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[idx] === optIdx;
                const isCorrect = optIdx === ex.correctAnswerIndex;
                const showCorrect = showResults && isCorrect;
                const showWrong = showResults && isSelected && !isCorrect;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleOptionSelect(idx, optIdx)}
                    className={`p-3 text-left rounded-xl border transition-all text-sm ${
                      showCorrect 
                        ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : showWrong 
                        ? "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                        : isSelected 
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600" 
                        : "border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showCorrect && <CheckCircle size={14} />}
                      {showWrong && <XCircle size={14} />}
                    </div>
                  </button>
                );
              })}
            </div>
            {showResults && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Explicação</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">{ex.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {exercises.length > 0 && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={checkAnswers}
            disabled={Object.keys(selectedAnswers).length < exercises.length}
            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            Verificar Respostas
          </button>
        </div>
      )}
    </div>
  );
}
