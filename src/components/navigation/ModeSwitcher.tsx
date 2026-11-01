"use client";

import React from "react";
import { useRole } from "@/providers/role-provider";
import { GraduationCap, Presentation } from "lucide-react";

export function ModeSwitcher() {
  const { mode, toggleMode } = useRole();

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
      <button
        onClick={toggleMode}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          mode === "STUDENT"
            ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        <GraduationCap size={14} />
        Aluno
      </button>
      <button
        onClick={toggleMode}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          mode === "TEACHER"
            ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400"
            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
      >
        <Presentation size={14} />
        Professor
      </button>
    </div>
  );
}
