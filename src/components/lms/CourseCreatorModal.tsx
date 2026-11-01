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