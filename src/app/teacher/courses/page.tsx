"use client";

import React, { useState, useEffect } from "react";
import { lmsService } from "@/services/lmsService";
import { Course } from "@/lib/types";
import { Plus, Edit3, Trash2, Eye, TrendingUp } from "lucide-react";
import { CourseCreatorModal } from "@/components/lms/CourseCreatorModal";
import { useAuth } from "@/app/providers";
import { apiClient } from "@/lib/api-client";

export default function TeacherCoursesPage() {
  const { auth } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      if (!auth?.user.id) return;
      try {
        // Use the unified apiClient to fetch courses specifically for this teacher
        const data = await apiClient.request<Course[]>(
          "courses", 
          "select", 
          {}, 
          { filter: { teacher_id: auth.user.id } }
        );
        setCourses(data);
      } catch (error) {
        console.error("Error loading teacher courses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [auth]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Cursos</h same>
          <p className="text-gray-500 dark:text-gray-400">Gere o teu conteúdo e acompanha o desempenho.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/20"
        >
          <Plus size={20} />
          Novo Curso
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Curso</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Preço</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Ainda não criaste nenhum curso. Começa agora!
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                          {course.title[0]}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{course.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{course.category || "Geral"}</td>
                    <td className="px-6 py-4 text-sm font-medium">{course.price} {course.currency}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        course.is_published ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {course.is_published ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Visualizar">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <CourseCreatorModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
