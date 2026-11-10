"use client";

import Link from "next/link";
import { useI18n } from "../../providers";

function ArrowRightIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5 fill-yellow-400 stroke-yellow-400" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

export function Hero() {
  const { t } = useI18n();

  const stats = [
    { value: t("home.hero.stats.tutors.value"), label: t("home.hero.stats.tutors.label") },
    { value: t("home.hero.stats.students.value"), label: t("home.hero.stats.students.label") },
    { value: t("home.hero.stats.rating.value"), label: t("home.hero.stats.rating.label") },
  ];

  const benefits = [
    t("home.hero.benefits.verified"),
    t("home.hero.benefits.secure"),
    t("home.hero.benefits.quality"),
  ];

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_50%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
              <span className="flex h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="text-sm font-medium text-[var(--accent)]">{t("home.hero.badge")}</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                <span className="text-[var(--foreground)]">{t("home.hero.title.part1")} </span>
                <span className="text-[var(--accent)]">{t("home.hero.title.highlight")}</span>
                <span className="text-[var(--foreground)]"> {t("home.hero.title.part2")}</span>
              </h1>
              <p className="mt-6 text-lg text-[var(--foreground)]/60 max-w-lg">
                {t("home.hero.subtitle")}
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <CheckIcon />
                  </span>
                  <span className="text-[var(--foreground)]/70">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/tutors/search"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[var(--accent)]/25 hover:shadow-[var(--accent)]/40 hover:-translate-y-0.5"
              >
                {t("home.hero.cta.findTutor")}
                <ArrowRightIcon />
              </Link>
              <Link
                href="/tutor/profile"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--foreground)] font-semibold rounded-xl transition-all hover:-translate-y-0.5"
              >
                {t("home.hero.cta.becomeTutor")}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                  <p className="text-sm text-[var(--foreground)]/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Main Card */}
              <div className="absolute inset-0 surface-panel p-6 rounded-3xl shadow-2xl">
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center">
                      <span className="text-2xl text-white font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Alex T.</p>
                      <p className="text-sm text-[var(--foreground)]/50">Mathematics Tutor</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <StarIcon />
                      <span className="font-semibold">4.9</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium">Calculus</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium">Algebra</span>
                    <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium">SAT Prep</span>
                  </div>
                  <p className="text-sm text-[var(--foreground)]/60 mb-4 flex-1">
                    "I help students build confidence in math through personalized lessons..."
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                    <div>
                      <p className="text-lg font-bold text-[var(--foreground)]">$15<span className="text-sm font-normal text-[var(--foreground)]/50">/hr</span></p>
                    </div>
                    <Link href="/tutors/search" className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Floating Card 1 */}
              <div className="absolute -top-4 -right-4 surface-panel p-4 rounded-2xl shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Payment Protected</p>
                    <p className="text-xs text-[var(--foreground)]/50">Secure transactions</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute -bottom-4 -left-4 surface-panel p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                    <StarIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">500+ Reviews</p>
                    <p className="text-xs text-[var(--foreground)]/50">Verified feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
