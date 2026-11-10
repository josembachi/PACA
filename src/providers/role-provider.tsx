"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, AuthenticatedUser } from "@/shared";
import { createClient } from "@/lib/supabase";

type AppMode = "STUDENT" | "TEACHER";

interface RoleContextType {
  role: UserRole | null;
  mode: AppMode;
  user: AuthenticatedUser | null;
  setRole: (role: UserRole) => void;
  toggleMode: () => void;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mode, setModeState] = useState<AppMode>("STUDENT");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          // In a real app, we fetch the profile from a 'profiles' table
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name, avatar_url, is_verified")
            .eq("id", authUser.id)
            .single();

          if (profile) {
            setRoleState(profile.role);
            setUser({
              id: authUser.id,
              email: authUser.email!,
              name: profile.full_name,
              role: profile.role,
              isVerified: profile.is_verified,
              avatarUrl: profile.avatar_url,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing role:", error);
      } finally {
        setIsLoading(false);
      }
    }

    initUser();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const toggleMode = () => {
    setModeState((currentMode) => (currentMode === "STUDENT" ? "TEACHER" : "STUDENT"));
  };

  return (
    <RoleContext.Provider value={{ role, mode, user, setRole, toggleMode, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
