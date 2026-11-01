"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PageShell } from "../../_components/PageShell";
import { useAuth, useI18n } from "../../providers";
import { createClient } from "../../../lib/supabase";
import { useMemo } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { signIn } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setBusy(true);

    try {
      await signIn(form.email, form.password);
      router.push("/dashboard");
    } catch (error) {
      setStatus((error as Error).message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-xl glass-panel p-8 sm:p-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("auth.login.title") || "Welcome Back"}</h1>
          <p className="text-sm ui-muted">{t("auth.login.subtitle") || "Please enter your details to sign in"}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            className="ui-field"
            placeholder={t("auth.email")}
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
            autoComplete="email"
          />
          <input
            className="ui-field"
            placeholder={t("auth.password")}
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
            autoComplete="current-password"
          />

          <button
            className="ui-btn ui-btn-primary ui-btn-block disabled:opacity-50"
            disabled={busy}
          >
            {busy ? t("common.loading") : (t("auth.login.submit") || "Sign In")}
          </button>

          {status && <p className="text-sm text-red-500">{status}</p>}

          <p className="pt-1 text-sm ui-muted text-center">
            {t("auth.login.footer") || "Don't have an account?"}{" "}
            <Link href="/auth/register" className="underline underline-offset-4">
              {t("auth.login.footer.link") || "Create one here"}
            </Link>
          </p>

          <div
            className="my-2 h-px w-full"
            style={{ backgroundColor: "var(--divider)" }}
          />

          <button
            type="button"
            className="ui-btn ui-btn-block"
            onClick={() =>
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                },
              })
            }
          >
            Continue with Google
          </button>
        </form>
      </div>
    </PageShell>
  );
}
