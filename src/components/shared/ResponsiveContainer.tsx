"use client";

import React from "react";
import { useMobileBridge } from "@/hooks/useMobileBridge";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  mobileView?: React.ReactNode;
  desktopView?: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({ 
  children, 
  mobileView, 
  desktopView, 
  className = "" 
}: ResponsiveContainerProps) {
  const { isMobile } = useMobileBridge();

  // If a specific mobile view is provided, use it when on mobile
  if (isMobile && mobileView) {
    return <div className={className}>{mobileView}</div>;
  }

  // If a specific desktop view is provided, use it when NOT on mobile
  if (!isMobile && desktopView) {
    return <div className={className}>{desktopView}</div>;
  }

  // Otherwise, render the default children
  return <div className={className}>{children}</div>;
}
