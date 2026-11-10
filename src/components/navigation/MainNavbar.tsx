"use client";

import React from "react";
import Link from "next/link";
import { useRole } from "@/providers/role-provider";
import { ModeSwitcher } from "./ModeSwitcher";
import { Bell, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function MainNavbar() {
  const { mode } = useRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentMode = mode ?? "STUDENT";

  const navLinks: Record<"STUDENT" | "TEACHER", { name: string; href: string }[]> = {
    STUDENT: [
      { name: "Explorar Cursos", href: "/courses" },
      { name: "Meus Estudos", href: "/my-learning" },
      { name: "Encontrar Professor", href: "/tutors" },
    ],
    TEACHER: [
      { name: "Meus Cursos", href: "/teacher/courses" },
      { name: "Alunos", href: "/teacher/students" },
      { name: "Financeiro", href: "/teacher/finance" },
    ],
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-primary-600 dark:text-primary-400">
                PACA
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks[currentMode].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <ModeSwitcher />
            
            <button className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>

            <button className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400">
              <User size={20} />
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-500" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          {navLinks[currentMode].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
