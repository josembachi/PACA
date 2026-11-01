"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "../../_components/PageShell";
import { createClient } from "../../../lib/supabase";
import { parseCsv } from "../../../lib/form";
import { useAuth, useI18n } from "../../providers";

interface TutorSearchResult {
  data: any[];
  meta: {
    total: number;
    page: number;
    hasMore: boolean;
  };
}

export default function TutorSearchPage() {
  const { t } = useI18n();
  const { auth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth?.user.role === "TUTOR") {
      router.replace("/dashboard");
    }
  }, [auth, router]);

  const [form, setForm] = useState({
    q: "",
    subjects: "",
    location: "",
    limit: 20,
    page: 1,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TutorSearchResult | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const runSearch = async (
    payload: {
      query?: string;
      subjects?: string[];
      location?: string;
      limit: number;
      page: number;
    }
  ) => {
    setStatus(null);
    setBusy(true);

    try {
      let query = supabase
        .from("tutor_profiles")
        .select(`
          id,
          bio,
          subjects,
          hourly_rate,
          languages,
          location,
          rating,
          updated_at,
          profiles (
            full_name
          )
        `, { count: "exact" });

      if (payload.query) {
        query = query.or(`bio.ilike.%${payload.query}%,subjects.cs.{${payload.query}}`);
      }

      if (payload.subjects && payload.subjects.length > 0) {
        query = query.overlaps("subjects", payload.subjects);
      }

      if (payload.location) {
        query = query.ilike("location", `%${payload.location}%`);
      }

      const offset = (payload.page - 1) * payload.limit;
      const { data, count, error } = await query
        .range(offset, offset + payload.limit - 1)
        .order("rating", { ascending: false });

      if (error) throw error;

      setResult({
        data: (data || []).map((item: any) => ({
          id: item.id,
          name: item.profiles?.full_name || "Anonymous",
          bio: item.bio,
          subjects: item.subjects,
          location: item.location,
          hourlyRate: item.hourly_rate,
          rating: item.rating,
        })),
        meta: {
          total: count || 0,
          page: payload.page,
          hasMore: (count || 0) > offset + (data?.length || 0),
        },
      });
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void runSearch({ query: undefined, subjects: [], location: undefined, limit: 20, page: 1 });
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await runSearch({
      query: form.q.trim() || undefined,
      subjects: parseCsv(form.subjects),
      location: form.location.trim() || undefined,
      limit: form.limit,
      page: form.page,
    });
  };

  return (
    <PageShell>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[360px_1fr]">
        <div className="glass-panel p-8 lg:sticky lg:top-28 lg:self-start">
          <h1 className="text-2xl font-semibold">{t("search.title")}</h1>
          <p className="mt-1 text-sm ui-muted">{t("search.subtitle")}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <input
              className="ui-field"
              placeholder={t("search.keyword")}
              value={form.q}
              onChange={(e) => setForm(p => ({ ...p, q: e.target.value }))}
            />
            <input
              className="ui-field"
              placeholder={t("search.subjects")}
              value={form.subjects}
              onChange={(e) => setForm(p => ({ ...p, subjects: e.target.value }))}
            />
            <input
              className="ui-field"
              placeholder={t("search.location")}
              value={form.location}
              onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))}
            />
            <button className="ui-btn ui-btn-primary ui-btn-block disabled:opacity-50" disabled={busy}>
              {busy ? t("common.loading") : t("search.submit")}
            </button>
          </form>
        </div>

        <div className="glass-panel p-8">
          <h2 className="text-lg font-semibold mb-6">{t("search.results")}</h2>
          {!result || result.data.length === 0 ? (
            <p className="text-sm ui-muted">{t("search.noResults")}</p>
          ) : (
            <div className="space-y-4">
              {result.data.map((tutor) => (
                <div key={tutor.id} className="surface-card surface-card--quiet p-5 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{tutor.name}</h3>
                      <p className="text-sm text-[var(--foreground)]/60">{tutor.location || t("search.remote")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${tutor.hourlyRate}/hr</p>
                      <p className="text-xs text-yellow-500">⭐ {tutor.rating || "N/A"}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm line-clamp-2">{tutor.bio}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tutor.subjects?.map((s: string) => (
                      <span key={s} className="hero-chip text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
