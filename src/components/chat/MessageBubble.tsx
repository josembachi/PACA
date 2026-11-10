"use client";

import React from "react";
import { FileText, Image as ImageIcon, PlayCircle, Mic } from "lucide-react";
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
      return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  const isAudioMessage = !!message.fileUrl && (!message.fileName || /\.(mp3|wav|ogg|m4a|webm|aac)$/i.test(message.fileName));

  if (message.isSystemMessage) {
    return (
      <div className="mb-4 flex justify-center">
        <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {!isOwnMessage && showAvatar && (
        <div className="mr-2 h-8 w-8 flex-shrink-0 rounded-full bg-[#dfe7e7] text-sm font-semibold text-[#075e54] flex items-center justify-center border border-[#d7e1dc]">
          {message.sender?.name?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      {!isOwnMessage && !showAvatar && <div className="w-10" />}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2 shadow-sm ${
          isOwnMessage
            ? "rounded-tr-md bg-[#dcf8c6] text-slate-800"
            : "rounded-tl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        {message.sender && !isOwnMessage && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{message.sender.name}</p>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  isOwnMessage ? "bg-white/30 hover:bg-white/40" : "bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">{getFileIcon(attachment.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{attachment.name}</div>
                  <div className="text-[10px] opacity-70">{formatFileSize(attachment.size)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {isAudioMessage && message.fileUrl ? (
          <div className="min-w-[180px] max-w-[260px]">
            <div className="mb-2 flex items-center gap-2 rounded-xl bg-black/5 p-2">
              <Mic size={16} className={isOwnMessage ? "text-slate-700" : "text-slate-500"} />
              <span className="text-xs font-medium">Nota de voz</span>
            </div>
            <audio controls src={message.fileUrl} className="w-full max-w-[220px]" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
        )}

        {message.fileUrl && !isAudioMessage && (!message.attachments || message.attachments.length === 0) && (
          <div className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg bg-black/5 p-2 transition-colors hover:bg-black/10">
            {message.fileName?.toLowerCase().endsWith(".pdf") ? (
              <FileText size={16} />
            ) : message.fileName?.toLowerCase().endsWith(".mp4") ? (
              <PlayCircle size={16} />
            ) : (
              <ImageIcon size={16} />
            )}
            <span className="max-w-[150px] truncate text-xs">{message.fileName || "Anexo"}</span>
          </div>
        )}

        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isOwnMessage ? "text-slate-600" : "text-slate-500"}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className="text-[9px] font-bold">{message.isRead ? "✓✓" : "✓"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
