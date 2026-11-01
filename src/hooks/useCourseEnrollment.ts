"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentService } from "@/services/paymentService";
import { lmsService } from "@/services/lmsService";
import { useAuth } from "@/app/providers";

export function useCourseEnrollment() {
  const router = useRouter();
  const { auth } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  async function enroll(courseId: string, amount: number, currency: string) {
    if (!auth?.user.id) {
      alert("Por favor, faça login para se inscrever.");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Process payment (and lock in Escrow)
      await paymentService.processPayment({
        amount,
        currency,
        courseId,
        userId: auth.user.id,
      });

      // 2. Enroll student in the course
      // Note: In a real app, we'd get the student_profile.id
      await lmsService.enrollInCourse(courseId, auth.user.id);

      // 3. Redirect to course view
      router.push(`/courses/${courseId}`);
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert("Erro ao processar a inscrição. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  }

  return { enroll, isProcessing };
}
