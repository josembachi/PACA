"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole, AuthenticatedUser } from "@/shared";
import { createClient } from "@/lib/supabase";
import { useAuth } from "./auth-provider";

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
  const { auth } = useAuth();
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [mode, setModeState] = useState<AppMode>("STUDENT");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applyUser = (nextUser: AuthenticatedUser | null) => {
      if (cancelled) return;
      setUser(nextUser);
      setRoleState(nextUser?.role ?? null);
      setIsLoading(false);
    };

    async function initUser() {
      if (auth?.user) {
        applyUser(auth.user);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (authUser) {
          const metadata = authUser.user_metadata ?? {};
          const userRole = metadata.role as UserRole | undefined;
          const validRoles: UserRole[] = ["STUDENT", "PARENT", "TUTOR", "AGENCY", "ADMIN"];
          applyUser({
            id: authUser.id,
            email: authUser.email ?? "",
            name: metadata.name ?? authUser.email?.split("@")[0] ?? "User",
            role: validRoles.includes(userRole as UserRole) ? userRole as UserRole : "STUDENT",
            isVerified: !!authUser.email_confirmed_at,
            avatarUrl: metadata.avatarUrl ?? null,
          });
        } else {
          applyUser(null);
        }
      } catch (error) {
        console.error("Error initializing role:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void initUser();
    return () => {
      cancelled = true;
    };
  }, [auth]);

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
