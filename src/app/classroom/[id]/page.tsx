"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "../_components/PageShell";
import { VirtualClassroom } from "@/components/lms/VirtualClassroom";
import { useAuth } from "../providers";

export default function ClassroomPage() {
  const params = useParams();
  const classroomId = params.id as string;
  const { auth } = useAuth();

  if (!auth?.user.id) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Por favor, faça login para entrar na sala de aula.</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="h-[calc(100vh-64px)]">
        <VirtualClassroom 
          conversationId={classroomId} 
          userId={auth.user.id} 
        />
      </div>
    </PageShell>
  );
}
