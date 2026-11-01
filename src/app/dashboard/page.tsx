"use client";

import React from "react";
import { useRole } from "@/providers/role-provider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { CourseRecommendations } from "@/components/ai/CourseRecommendations";

export default function DashboardPage() {
  const { mode, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardShell title={mode === "STUDENT" ? "Meu Painel de Estudos" : "Painel do Professor"}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {mode === "STUDENT" ? <StudentDashboard /> : <TeacherDashboard />}
        </div>
        <div className="space-y-8">
          {mode === "STUDENT" && <CourseRecommendations />}
          {/* Other widgets like upcoming classes or notifications can go here */}
        </div>
      </div>
    </DashboardShell>
  );
}
