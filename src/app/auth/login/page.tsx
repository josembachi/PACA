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
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://paca-two.vercel.app";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleGoogleSignIn = async () => {
    setStatus(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${appOrigin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in is unavailable.";

      setStatus(
        message.includes("provider is not enabled")
          ? "Google sign-in is not enabled in Supabase yet. Enable Google in Authentication > Providers and try again."
          : message,
      );
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setBusy(true);

    try {
      const response = await signIn(form.email, form.password);
      const role = response.user.role;

      if (role === "ADMIN") {
        router.push("/admin");
        return;
      }

      if (role === "TUTOR") {
        router.push("/work");
        return;
      }

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
            {busy ? t("common.loading") : (t("auth.login.submit") || "Entrar")}
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
            onClick={handleGoogleSignIn}
            aria-label="Continue with Google"
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.5 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.8 14.8 3 12 3 7.3 3 3.5 6.9 3.5 11.7S7.3 20.4 12 20.4c6.3 0 10.5-4.4 10.5-10.6 0-.7-.1-1.2-.2-1.7H12z"/>
                <path fill="#34A853" d="M3.9 7.2l3.5 2.6c1-1.9 2.9-3.2 4.6-3.2 1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.8 14.8 3 12 3C8.7 3 5.7 4.8 4.1 7.6l-.2-.4z"/>
                <path fill="#FBBC05" d="M3.9 16.4c1.6 2.9 4.6 4.9 8.1 4.9 2.8 0 4.8-1.1 6.3-2.6l-3.1-2.7c-.9.6-2.1 1-3.2 1-2.1 0-3.9-1.4-4.5-3.3L3.9 16.4z"/>
                <path fill="#4285F4" d="M12.1 18.7c2.8 0 4.9-1 5.7-2.2l-3.1-2.7c-.9.6-2.1 1-3.3 1-2.1 0-3.9-1.4-4.5-3.3l-3.3 2.5c1.5 3.2 4.5 5.7 8.5 5.7z"/>
              </svg>
              <span>Continue with Google</span>
            </span>
          </button>
        </form>
      </div>
    </PageShell>
  );
}
