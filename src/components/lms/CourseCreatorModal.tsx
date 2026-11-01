"use client";

import React, { useState } from "react";
import { lmsService } from "@/services/lmsService";
import { CourseInput } from "@/lib/types";
import { X, Upload } from "lucide-react";
import { useAuth } from "@/app/providers";

interface CourseCreatorModalProps {
  onClose: () => void;
}

export function CourseCreatorModal({ onClose }: CourseCreatorModalProps) {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CourseInput>({
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Criar Novo Curso</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título do Curso</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Ex: Matemática para Engenharia"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Ex: Ciências Exatas"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <textarea 
              rows={4}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="Descreva o que os alunos vão aprender..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preço</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                value={formData.price}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font