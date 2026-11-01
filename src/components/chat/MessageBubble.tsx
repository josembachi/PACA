"use client";

import React from "react";
import { FileText, Image as ImageIcon, PlayCircle } from "lucide-react";
import { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
          isOwnMessage 
            ? "bg-primary-600 text-white rounded-tr-none" 
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700"
        }`}
      >
        {message.sender && !isOwnMessage && (
          <p className="text-[10px] font-bold mb-1 opacity-70 uppercase">
            {message.sender.name}
          </p>
        )}
        
        <p className="text-sm leading-relaxed">{message.content}</p>
        
        {message.fileUrl && (
          <div className="mt-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-black/20 transition-colors">
            {message.fileName?.toLowerCase().endsWith('.pdf') ? <FileText size={16} /> : 
             message.fileName?.toLowerCase().endsWith('.mp4') ? <PlayCircle size={16} /> : 
             <ImageIcon size={16} />}
            <span className="text-xs truncate max-w-[150px]">{message.fileName || "Anexo"}</span>
          </div>
        )}
        
        <div className={`text-[10px] mt-1 text-right opacity-60 ${isOwnMessage ? "text-primary-100" : "text-gray-500"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
