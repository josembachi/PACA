"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Star, Clock } from "lucide-react";
import { Course } from "@/lib/types";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-video relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        {course.thumbnail_url ? (
          <img 
            src={course.thumbnail_url} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BookOpen size={48} />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-primary-600 dark:text-primary-400 shadow-sm">
          {course.price === 0 ? "Grátis" : `${course.price} ${course.currency}`}
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
            {course.category || "Geral"}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
          {course.description || "Sem descrição disponível para este curso."}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span>4.8</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>12h</span>
            </div>
          </div>
          
          <Link 
            href={`/courses/${course.id}`} 
            className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Ver curso →
          </Link>
        </div>
      </div>
    </div>
  );
}
