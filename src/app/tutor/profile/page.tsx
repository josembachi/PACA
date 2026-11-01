"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageShell } from "../../_components/PageShell";
import { createClient } from "../../../lib/supabase";
import { parseCsv, parseNumber, upsertCsv } from "../../../lib/form";
import { useAuth, useI18n } from "../../providers";

const subjectLibrary = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Writing", "SAT Prep"];

export default function TutorProfilePage() {
  const { t } = useI18n();
  const { auth } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const isTutor = auth?.user.role === "TUTOR";
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [form, setForm] = useState({
    bio: "",
    subjects: "",
    languages: "",
    hourlyRate: "",
    location: "",
  });

  useEffect(() => {
    const run = async () => {
      if (!auth?.user.id || !isTutor) return;
      try {
        const { data, error } = await supabase
          .from("tutor_profiles")
          .select("*")
          .eq("user_id", auth.user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data) {
          setProfile(data);
          setForm({
            bio: data.bio ?? "",
            subjects: (data.subjects ?? []).join(", "),
            languages: (data.languages ?? []).join(", "),
            hourlyRate: data.hourly_rate?.toString() ?? "",
            location: data.location ?? "",
          });
        }
      } catch (error) {
        setStatus((error as Error).message);
      }
    };
    void run();
  }, [auth?.user.id, isTutor]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth?.user.id || !isTutor) return;

    setBusy(true);
    setStatus(null);

    try {
      const payload = {
        user_id: auth.user.id,
        bio: form.bio.trim() || null,
        subjects: parseCsv(form.subjects),
        languages: parseCsv(form.languages),
        hourly_rate: parseNumber(form.hourlyRate) || null,
        location: form.location.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tutor_profiles")
        .upsert({ id: profile?.id, ...payload })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setStatus(t("profile.saved"));
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!auth || !isTutor) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-lg ui-muted">{t("profile.guard.tutorOnly")}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl glass-panel p-8 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{t("profile.title")}</h1>
          <p className="text-sm ui-muted">{t("profile.subtitle")}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("profile.bio")}</label>
            <textarea
              className="ui-field h-32"
              value={form.bio}
              onChange={(e) => setForm(p => ({ ...p, bio: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("profile.subjects")}</label>
            <input
              className="ui-field"
              value={form.subjects}
              onChange={(e) => setForm(p => ({ ...p, subjects: e.target.value }))}
              placeholder="Math, Physics..."
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {subjectLibrary.map(s => (
                <button
                  key={s}
                  type="button"
                  className="ui-btn rounded-full px-3 py-1 text-xs"
                  onClick={() => setForm(p => ({ ...p, subjects: upsertCsv(p.subjects, s) }))}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("profile.hourlyRate")}</label>
              <input
                type="number"
                className="ui-field"
                value={form.hourlyRate}
                onChange={(e) => setForm(p => ({ ...p, hourlyRate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("profile.location")}</label>
              <input
                className="ui-field"
                value={form.location}
                onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))}
              />
            </div>
          </div>

          <button className="ui-btn ui-btn-primary ui-btn-block disabled:opacity-50" disabled={busy}>
            {busy ? t("common.loading") : t("profile.save")}
          </button>
          {status && <p className="text-sm text-center ui-muted">{status}</p>}
        </form>
      </div>
    </PageShell>
  );
}
