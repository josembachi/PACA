"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { lmsService } from "@/services/lmsService";
import { CourseInput } from "@/lib/types";
import { useAuth } from "@/app/providers";

interface CourseCreatorModalProps {
  onClose: () => void;
}

export function CourseCreatorModal({ onClose }: CourseCreatorModalProps) {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseInput>({
    teacher_id: auth?.user.id ?? "",
    title: "",
    description: "",
    category: "",
    price: 0,
    currency: "USD",
    is_published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.user.id) {
      alert("Erro: Utilizador não autenticado.");
      return;
    }

    setLoading(true);
    try {
      await lmsService.createCourse({
        ...formData,
        teacher_id: auth.user.id,
      });
      onClose();
    } catch (error) {
      console.error("Error creating course:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Criar Novo Curso</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Curso</label>
              <input
                required
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-primary-500 dark:border-gray-800"
                placeholder="Ex: Matemática para Engenharia"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-primary-500 dark:border-gray-800"
                placeholder="Ex: Ciências Exatas"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-primary-500 dark:border-gray-800"
              placeholder="Descreva o que os alunos vão aprender..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-primary-500 dark:border-gray-800"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Moeda</label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-transparent px-4 py-2 outline-none transition-all focus:ring-2 focus:ring-primary-500 dark:border-gray-800"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="AOA">AOA</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Publicar</label>
              <label className="flex h-[42px] items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                Disponível agora
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "A guardar..." : "Criar curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
