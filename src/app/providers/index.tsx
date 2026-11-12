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
  pt: {
    "nav.menu": "Menu",
    "nav.home": "Início",
    "nav.findTutors": "Encontrar tutores",
    "nav.help": "Ajuda",
    "nav.login": "Entrar",
    "nav.register": "Registar",
    "nav.getStarted": "Começar",
    "nav.dashboard": "Painel",
    "nav.postJob": "Publicar trabalho",
    "nav.messages": "Mensagens",
    "nav.account": "Conta",
    "nav.findJobs": "Encontrar trabalhos",
    "nav.myProfile": "O meu perfil",
    "nav.contracts": "Contratos",
    "nav.find": "Procurar",
    "nav.join": "Juntar-se",
    "nav.chat": "Chat",
    "nav.jobs": "Trabalhos",
    "nav.profile": "Perfil",
    "nav.work": "Trabalho",
    "nav.post": "Publicar",
    "home.hero.badge": "A melhor plataforma de aprendizagem do PACA",
    "home.hero.title.part1": "Encontra o tutor",
    "home.hero.title.highlight": "ideal",
    "home.hero.title.part2": "para o teu objetivo",
    "home.hero.subtitle": "Conecta estudantes, famílias e professores numa experiência segura, clara e orientada para resultados.",
    "home.hero.stats.tutors.value": "2,500+",
    "home.hero.stats.tutors.label": "Tutores verificados",
    "home.hero.stats.students.value": "10,000+",
    "home.hero.stats.students.label": "Estudantes ativos",
    "home.hero.stats.rating.value": "4.9/5",
    "home.hero.stats.rating.label": "Classificação média",
    "home.hero.benefits.verified": "Tutores validados",
    "home.hero.benefits.secure": "Pagamentos seguros",
    "home.hero.benefits.quality": "Qualidade garantida",
    "home.hero.cta.findTutor": "Encontrar tutor",
    "home.hero.cta.becomeTutor": "Quero ensinar",
    "home.pathways.title": "Escolhe o teu caminho",
    "home.pathways.subtitle": "Se procuras aprender ou ensinar, o PACA tem a ferramenta certa para ti.",
    "home.pathways.student.title": "Para alunos e famílias",
    "home.pathways.student.description": "Recebe apoio personalizado e avança em qualquer disciplina com tutores especialistas.",
    "home.pathways.student.benefits.verified": "Tutores especialistas verificados",
    "home.pathways.student.benefits.browse": "Pesquisa e filtros eficazes",
    "home.pathways.student.benefits.reviews": "Avaliações reais de estudantes",
    "home.pathways.student.benefits.payments": "Pagamentos por milestones seguros",
    "home.pathways.student.cta": "Começar a aprender",
    "home.pathways.tutor.title": "Para tutores especialistas",
    "home.pathways.tutor.description": "Partilha conhecimento, define as tuas tarifas e cresce a tua reputação profissional.",
    "home.pathways.tutor.benefits.rates": "Define as tuas tarifas",
    "home.pathways.tutor.benefits.matched": "Conecta-te com estudantes certos",
    "home.pathways.tutor.benefits.milestones": "Gerir pagamentos por etapas",
    "home.pathways.tutor.benefits.reputation": "Constrói um perfil de ensino verificado",
    "home.pathways.tutor.cta": "Entrar como tutor",
    "auth.register.title": "Criar conta",
    "auth.register.subtitle": "Junta-te à comunidade PACA hoje",
    "auth.name": "Nome completo",
    "auth.email": "Email",
    "auth.password": "Palavra-passe",
    "auth.role": "Sou ...",
    "auth.role.student": "Estudante",
    "auth.role.parent": "Encarregado",
    "auth.role.tutor": "Tutor",
    "auth.register.submit": "Criar conta",
    "auth.register.footer": "Já tens conta?",
    "auth.register.footer.link": "Entrar aqui",
    "auth.login.title": "Bem-vindo de volta",
    "auth.login.subtitle": "Introduz os teus dados para entrares",
    "auth.login.submit": "Entrar",
    "auth.login.footer": "Ainda não tens conta?",
    "auth.login.footer.link": "Cria uma aqui",
    "common.loading": "A carregar...",
    "dashboard.student.title": "Painel do estudante",
    "dashboard.student.subtitle": "Bem-vindo! Vamos encontrar o melhor tutor para os teus objetivos.",
    "dashboard.student.active_lessons": "As tuas aulas ativas",
    "dashboard.student.no_lessons": "Ainda não tens aulas ativas.",
    "dashboard.tutor.title": "Painel do tutor",
    "dashboard.tutor.subtitle": "Bem-vindo! Gere os teus alunos e ganhos.",
    "dashboard.tutor.active_jobs": "Os teus trabalhos ativos",
    "dashboard.tutor.no_jobs": "Ainda não tens trabalhos ativos.",
    "dashboard.sidebar.title": "Atalhos",
    "dashboard.sidebar.search": "Procurar tutores",
    "dashboard.sidebar.profile": "O meu perfil",
    "dashboard.sidebar.settings": "Definições",
    "search.title": "Encontrar tutor",
    "search.subtitle": "Procura na nossa rede de tutores especialistas.",
    "search.keyword": "Palavra-chave (ex: Matemática, Física)",
    "search.subjects": "Disciplinas (separadas por vírgula)",
    "search.location": "Localização",
    "search.submit": "Procurar tutores",
    "search.results": "Resultados da pesquisa",
    "search.noResults": "Não foram encontrados tutores com estes critérios.",
    "search.remote": "Remoto",
    "profile.title": "Perfil do tutor",
    "profile.subtitle": "Completa o teu perfil para atrair mais estudantes.",
    "profile.bio": "Biografia profissional",
    "profile.subjects": "Disciplinas que ensinas",
    "profile.hourlyRate": "Taxa horária (€)",
    "profile.location": "Localização",
    "profile.save": "Guardar perfil",
    "profile.saved": "Perfil atualizado com sucesso!",
    "profile.guard.tutorOnly": "Esta página só está disponível para tutores.",
  },
  en: {
    "nav.menu": "Menu",
    "nav.home": "Home",
    "nav.findTutors": "Find Tutors",
    "nav.help": "Help",
    "nav.login": "Login",
    "nav.register": "Register",
    "nav.getStarted": "Get Started",
    "nav.dashboard": "Dashboard",
    "nav.postJob": "Post a Job",
    "nav.messages": "Messages",
    "nav.account": "Account",
    "nav.findJobs": "Find Jobs",
    "nav.myProfile": "My Profile",
    "nav.contracts": "Contracts",
    "nav.find": "Find",
    "nav.join": "Join",
    "nav.chat": "Chat",
    "nav.jobs": "Jobs",
    "nav.profile": "Profile",
    "nav.work": "Work",
    "nav.post": "Post",
    "home.hero.badge": "Ethiopia's #1 Tutor Platform",
    "home.hero.title.part1": "Find the perfect",
    "home.hero.title.highlight": "Tutor",
    "home.hero.title.part2": "for your child",
    "home.hero.subtitle": "Connecting students with verified expert tutors to accelerate learning and achieve academic excellence.",
    "home.hero.stats.tutors.value": "2,500+",
    "home.hero.stats.tutors.label": "Verified Tutors",
    "home.hero.stats.students.value": "10,000+",
    "home.hero.stats.students.label": "Happy Students",
    "home.hero.stats.rating.value": "4.9/5",
    "home.hero.stats.rating.label": "Average Rating",
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
  const [locale, setLocaleState] = useState("pt");
  const [auth, setAuth] = useState<{ user: AuthenticatedUser } | null>(null);

  useEffect(() => {
    const savedLocale = localStorage.getItem("tutorstartup.locale");
    if (savedLocale && (savedLocale === "pt" || savedLocale === "en" || savedLocale === "am")) {
      setLocaleState(savedLocale);
    } else {
      setLocaleState("pt");
    }
  }, []);

  const t = (key: string) => {
    return (
      translations[locale]?.[key] ??
      translations.pt[key] ??
      translations.en[key] ??
      (locale === "en" ? "Text unavailable" : "Texto indisponível")
    );
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
