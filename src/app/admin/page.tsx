"use client";

import { useAdminDashboard, useIsAdmin } from "../../hooks/useAdmin";
import { AdminLayout } from "./_components/AdminLayout";
import { useI18n } from "../providers";
import Link from "next/link";

function StatCard({ title, value, trend, icon }: { title: string; value: number; trend?: string; icon: string }) {
  return (
    <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted)] mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
          {trend && <p className="text-xs text-green-500 mt-1">{trend}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function ModerationAlert({ count }: { count: number }) {
  if (count === 0) return null;

  const { t } = useI18n();
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800">{t("admin.moderation.title")}</h3>
            <p className="text-sm text-amber-700">{count} {t("admin.moderation.body")}</p>
          </div>
        </div>
        <Link
          href="/admin/moderation"
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          {t("admin.moderation.review")}
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { isAdmin, loading: checkingAdmin } = useIsAdmin();
  const { analytics, loading } = useAdminDashboard();
  const { t } = useI18n();

  if (checkingAdmin || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-2">{t("admin.accessDenied")}</h2>
          <p className="text-[var(--muted)]">{t("admin.accessDeniedBody")}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
          <p className="text-[var(--muted)]">{t("admin.subtitle")}</p>
        </div>

        {analytics && analytics.pendingModeration > 0 && (
          <ModerationAlert count={analytics.pendingModeration} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("admin.totalUsers")} value={analytics?.totalUsers || 0} icon="👥" />
          <StatCard title={t("admin.activeTutors")} value={analytics?.totalTutors || 0} icon="🎓" />
          <StatCard title={t("admin.openJobs")} value={analytics?.openJobs || 0} icon="💼" />
          <StatCard title={t("admin.activeContracts")} value={analytics?.activeContracts || 0} icon="📄" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t("admin.totalReviews")} value={analytics?.totalReviews || 0} icon="⭐" />
          <StatCard title={t("admin.messages24h")} value={analytics?.messages24h || 0} icon="💬" />
          <StatCard title={t("admin.completedContracts")} value={analytics?.completedContracts || 0} icon="✅" />
          <StatCard title={t("admin.failedEmails")} value={analytics?.failedEmails || 0} icon="📧" />
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold mb-4">{t("admin.quickActions")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-[var(--bg-elevated)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <span className="text-2xl mb-2 block">👥</span>
              <h3 className="font-medium">{t("admin.manageUsers")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("admin.manageUsersBody")}</p>
            </Link>
            
            <Link
              href="/admin/moderation"
              className="p-4 bg-[var(--bg-elevated)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <span className="text-2xl mb-2 block">🛡️</span>
              <h3 className="font-medium">{t("admin.moderation")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("admin.moderationBody")}</p>
            </Link>
            
            <Link
              href="/admin/activity"
              className="p-4 bg-[var(--bg-elevated)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <span className="text-2xl mb-2 block">📋</span>
              <h3 className="font-medium">{t("admin.activityLog")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("admin.activityLogBody")}</p>
            </Link>
            
            <Link
              href="/admin/settings"
              className="p-4 bg-[var(--bg-elevated)] rounded-lg hover:bg-[var(--muted)] transition-colors"
            >
              <span className="text-2xl mb-2 block">⚙️</span>
              <h3 className="font-medium">{t("admin.settings")}</h3>
              <p className="text-sm text-[var(--muted)]">{t("admin.settingsBody")}</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
