"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { AuthenticatedUser } from "@/shared";

interface AuthContextType {
  auth: { user: AuthenticatedUser } | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
}

interface I18nContextType {
  locale: string;
  t: (key: string) => string;
  setLocale: (locale: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Simple translation dictionary for the first phase
const translations: Record<string, Record<string, string>> = {
  en: {
    "home.hero.badge": "Ethiopia's #1 Tutor Platform",
    "home.hero.title.part1": "Find the perfect",
    "home.hero.title.highlight": "Tutor",
    "home.hero.title.part2": "for your child",
    "home.hero.subtitle": "Connecting students with verified expert tutors to accelerate learning and achieve academic excellence.",
    "home.hero.stats.tutors": "Verified Tutors",
    "home.hero.stats.students": "Happy Students",
    "home.hero.stats.rating": "Average Rating",
    "home.hero.benefits.verified": "Background Checked Tutors",
    "home.hero.benefits.secure": "Secure Payment System",
    "home.hero.benefits.quality": "Quality Guaranteed",
    "home.hero.cta.findTutor": "Find a Tutor",
    "home.hero.cta.becomeTutor": "Become a Tutor",
    "home.pathways.title": "Choose Your Path",
    "home.pathways.subtitle": "Whether you are looking to learn or looking to teach, we have the right tools for you.",
    "home.pathways.student.title": "For Students & Parents",
    "home.pathways.student.description": "Get personalized support and master any subject with the help of expert tutors.",
    "home.pathways.student.benefits.verified": "Verified expert tutors",
    "home.pathways.student.benefits.browse": "Easy tutor search & filtering",
    "home.pathways.student.benefits.reviews": "Real student reviews",
    "home.pathways.student.benefits.payments": "Secure milestone payments",
    "home.pathways.student.cta": "Start Learning",
    "home.pathways.tutor.title": "For Expert Tutors",
    "home.pathways.tutor.description": "Share your knowledge, set your own rates, and grow your professional reputation.",
    "home.pathways.tutor.benefits.rates": "Set your own hourly rates",
    "home.pathways.tutor.benefits.matched": "Get matched with ideal students",
    "home.pathways.tutor.benefits.milestones": "Manage payments via milestones",
    "home.pathways.tutor.benefits.reputation": "Build a verified teaching profile",
    "home.pathways.tutor.cta": "Join as a Tutor",
    "auth.register.title": "Create an Account",
    "auth.register.subtitle": "Join the PACA community today",
    "auth.name": "Full Name",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.role": "I am a...",
    "auth.role.student": "Student",
    "auth.role.parent": "Parent",
    "auth.role.tutor": "Tutor",
    "auth.register.submit": "Create Account",
    "auth.register.footer": "Already have an account?",
    "auth.register.footer.link": "Login here",
    "auth.login.title": "Welcome Back",
    "auth.login.subtitle": "Please enter your details to sign in",
    "auth.login.submit": "Sign In",
    "auth.login.footer": "Don't have an account?",
    "auth.login.footer.link": "Create one here",
    "common.loading": "Loading...",
    "dashboard.student.title": "Student Dashboard",
    "dashboard.student.subtitle": "Welcome back! Let's find the best tutor for your goals.",
    "dashboard.student.active_lessons": "Your Active Lessons",
    "dashboard.student.no_lessons": "You don't have any active lessons yet.",
    "dashboard.tutor.title": "Tutor Dashboard",
    "dashboard.tutor.subtitle": "Welcome back! Manage your students and earnings.",
    "dashboard.tutor.active_jobs": "Your Active Jobs",
    "dashboard.tutor.no_jobs": "You don't have any active jobs yet.",
    "dashboard.sidebar.title": "Quick Links",
    "dashboard.sidebar.search": "Search Tutors",
    "dashboard.sidebar.profile": "My Profile",
    "dashboard.sidebar.settings": "Settings",
    "search.title": "Find a Tutor",
    "search.subtitle": "Search through our verified network of expert tutors.",
    "search.keyword": "Keyword (e.g. Math, Physics)",
    "search.subjects": "Subjects (comma separated)",
    "search.location": "Location",
    "search.submit": "Search Tutors",
    "search.results": "Search Results",
    "search.noResults": "No tutors found matching your criteria.",
    "search.remote": "Remote",
    "profile.title": "Tutor Profile",
    "profile.subtitle": "Complete your profile to attract more students.",
    "profile.bio": "Professional Bio",
    "profile.subjects": "Subjects you teach",
    "profile.hourlyRate": "Hourly Rate ($)",
    "profile.location": "Location",
    "profile.save": "Save Profile",
    "profile.saved": "Profile updated successfully!",
    "profile.guard.tutorOnly": "This page is only available for Tutors.",
  },
  am: {
    // Amharic translations would go here
  }
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState("en");
  const [auth, setAuth] = useState<{ user: AuthenticatedUser } | null>(null);

  useEffect(() => {
    const savedLocale = localStorage.getItem("tutorstartup.locale");
    if (savedLocale && (savedLocale === "en" || savedLocale === "am")) {
      setLocaleState(savedLocale);
    }
  }, []);

  const t = (key: string) => {
    return translations[locale]?.[key] || key;
  };

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem("tutorstartup.locale", newLocale);
  };

  const register = async (data: any) => {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: data.role,
        },
      },
    });

    if (error) throw error;
    if (authData.user) {
      setAuth({
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: data.name,
          role: data.role,
          isVerified: false,
        },
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, is_verified")
        .eq("id", data.user.id)
        .single();

      setAuth({
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: profile?.full_name || "User",
          role: profile?.role || "STUDENT",
          isVerified: profile?.is_verified ?? true,
        },
      });
    }
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, signIn, register, signOut }}>
      <I18nContext.Provider value={{ locale, t, setLocale }}>
        {children}
      </I18nContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within Providers");
  return context;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) throw new Error("useI18n must be used within Providers");
  return context;
}
