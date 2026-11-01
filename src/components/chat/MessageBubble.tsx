"use client";

import React from "react";
import { FileText, Image as ImageIcon, PlayCircle } from "lucide-react";
import { Message } from "@/lib/types";
import { formatFileSize, getFileIcon } from "@/hooks/useFileUpload";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwnMessage, showAvatar }: MessageBubbleProps) {
  const formatTime = (date: string) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "";
    }
  };

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center mb-4">
        <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-gray-700">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {!isOwnMessage && showAvatar && (
        <div className="mr-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-gray-600">
            {message.sender?.name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      {!isOwnMessage && !showAvatar && <div className="w-10" />}

      <div 
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
          isOwnMessage 
            ? "bg-primary-600 text-white rounded-tr-none" 
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700"
        }`}
      >
        {message.sender && !isOwnMessage && (
          <p className="text-[10px] font-bold mb-1 opacity-70 uppercase tracking-wider">
            {message.sender.name}
          </p>
        )}
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {message.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isOwnMessage ? "bg-white/20 hover:bg-white/30" : "bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
              >
                <span className="text-lg">{getFileIcon(attachment.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate font-medium">{attachment.name}</div>
                  <div className="text-[10px] opacity-70">{formatFileSize(attachment.size)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        
        {message.fileUrl && (!message.attachments || message.attachments.length === 0) && (
          <div className="mt-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-black/20 transition-colors">
            {message.fileName?.toLowerCase().endsWith('.pdf') ? <FileText size={16} /> : 
             message.fileName?.toLowerCase().endsWith('.mp4') ? <PlayCircle size={16} /> : 
             <ImageIcon size={16} />}
            <span className="text-xs truncate max-w-[150px]">{message.fileName || "Anexo"}</span>
          </div>
        )}
        
        <div className={`text-[10px] mt-1 text-right opacity-60 ${isOwnMessage ? "text-primary-100" : "text-gray-500"}`}>
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
