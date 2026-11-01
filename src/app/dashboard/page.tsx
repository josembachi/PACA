"use client";

import React from "react";
import { PageShell } from "../_components/PageShell";
import { useRole } from "@/providers/role-provider";
import { useI18n } from "../providers";
import Link from "next/link";

export default function DashboardPage() {
  const { role, isLoading } = useRole();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
        </div>
      </PageShell>
    );
  }

  const isTutor = role === "TUTOR";

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">
            {isTutor ? t("dashboard.tutor.title") : t("dashboard.student.title")}
          </h1>
          <p className="text-[var(--foreground)]/60">
            {isTutor 
              ? t("dashboard.tutor.subtitle") 
              : t("dashboard.student.subtitle")}
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">
                {isTutor ? t("dashboard.tutor.active_jobs") : t("dashboard.student.active_lessons")}
              </h2>
              <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-xl">
                <p className="text-[var(--foreground)]/50 mb-4">
                  {isTutor 
                    ? t("dashboard.tutor.no_jobs") 
                    : t("dashboard.student.no_lessons")}
                </p>
                {!isTutor && (
                  <Link 
                    href="/tutors/search" 
                    className="ui-btn ui-btn-primary inline-flex items-center gap-2"
                  >
                    {t("home.hero.cta.findTutor")}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">{t("dashboard.sidebar.title")}</h3>
              <nav className="flex flex-col gap-2">
                {!isTutor && (
                  <Link href="/tutors/search" className="p-2 hover:bg-[var(--accent)]/10 rounded-lg transition-colors">
                    🔍 {t("dashboard.sidebar.search")}
                  </Link>
                )}
                <Link href="/tutor/profile" className="p-2 hover:bg-[var(--accent)]/10 rounded-lg transition-colors">
                  👤 {t("dashboard.sidebar.profile")}
                </Link>
                <Link href="/settings" className="p-2 hover:bg-[var(--accent)]/10 rounded-lg transition-colors">
                  ⚙️ {t("dashboard.sidebar.settings")}
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
