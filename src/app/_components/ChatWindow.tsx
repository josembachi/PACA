"use client";

import { useState, useRef, useEffect } from "react";
import { useConversation, useMessaging } from "../../hooks/useMessaging";
import { useAuth, useNotificationContext } from "../../app/providers";
import { useFileUpload, formatFileSize, getFileIcon, UploadedFile } from "../../hooks/useFileUpload";
import type { Message, EmailNotification } from "../../lib/types";
import { MessageBubble } from "../../components/chat/MessageBubble";

function PaperclipIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
}

export function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { auth } = useAuth();
  const { conversation, messages, loading, error, sendMessage, refresh } = useConversation(
    conversationId,
    auth?.user.id || null
  );
  const { refreshConversations } = useMessaging(auth?.user.id || null);
  const { notifications, markAsOpened } = useNotificationContext();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFiles, uploading: fileUploading } = useFileUpload({
    bucket: 'messages',
    folder: auth?.user.id
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessages]);

  useEffect(() => {
    if (!conversationId || !notifications.length) return;
    
    const messageNotifications = notifications.filter(
      (n: EmailNotification) => n.type === 'NEW_MESSAGE' && 
           n.metadata?.conversation_id === conversationId &&
           !n.openedAt
    );
    
    messageNotifications.forEach((notification: EmailNotification) => {
      markAsOpened(notification.id);
    });
  }, [conversationId, notifications, markAsOpened]);

  useEffect(() => {
    if (!loading && conversation) {
      const timer = setTimeout(() => {
        refreshConversations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading, conversation, refreshConversations]);

  const handleSend = async () => {
    if ((!inputValue.trim() && pendingFiles.length === 0) || isSending) return;
    
    const textToSend = inputValue.trim();
    const filesToSend = [...pendingFiles];
    
    setIsSending(true);
    
    // Optimistic Update
    const optimisticId = `opt-${Date.now()}`;
    const optimisticMsg: Message = {
      id: optimisticId,
      conversationId,
      senderId: auth?.user.id || '',
      content: textToSend,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: true,
      sender: {
        id: auth?.user.id || '',
        name: auth?.user.name || 'Eu',
        role: auth?.user.role || 'STUDENT'
      }
    };
    
    setOptimisticMessages(prev => [...prev, optimisticMsg]);
    setInputValue("");
    setPendingFiles([]);

    const fileData = filesToSend.length > 0 ? {
      url: filesToSend[0].url,
      name: filesToSend[0].name,
      size: filesToSend[0].size
    } : undefined;
    
    const success = await sendMessage(textToSend || '', fileData);
    
    if (!success) {
      // Remove optimistic message on failure
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticId));
    }
    
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploaded = await uploadFiles(files);
    if (uploaded.length > 0) {
      setPendingFiles(prev => [...prev, ...uploaded]);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full bg-[var(--card)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          {onBack && (
            <button onClick={onBack} className="ui-btn ui-btn-ghost p-2">
              ← Voltar
            </button>
          )}
          <div className="animate-pulse h-6 w-32 bg-[var(--muted)] rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]" />
            <p className="text-sm text-[var(--foreground)]/50">A carregar conversa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4 bg-[var(--card)] text-center">
        <div className="text-red-500 mb-4 text-lg font-medium">Ocorreu um erro ao carregar as mensagens.</div>
        <p className="text-sm text-[var(--foreground)]/60 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="ui-btn ui-btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  const otherUser = conversation?.otherUser;
  const allMessages = [...messages, ...optimisticMessages];

  return (
    <div className="flex flex-col h-full bg-[var(--card)]">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="ui-btn ui-btn-ghost p-2 lg:hidden">
              ←
            </button>
          )}
          <div className="h-10 w-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-lg font-semibold text-[var(--accent)] border border-[var(--accent)]/20">
            {otherUser?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold leading-tight">{otherUser?.name || "Utilizador"}</h3>
            {conversation?.jobPost && (
              <p className="text-xs text-[var(--foreground)]/60 truncate max-w-[200px]">
                Re: {conversation.jobPost.title}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--foreground)]/50 text-center">
            <div className="text-4xl mb-2">💬</div>
            <p className="font-medium">Ainda não há mensagens</p>
            <p className="text-sm">Seja o primeiro a iniciar a conversa!</p>
          </div>
        ) : (
          allMessages.map((message, index) => {
            const isOwn = message.senderId === auth?.user.id;
            const showAvatar = index === 0 || allMessages[index - 1].senderId !== message.senderId;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwn}
                showAvatar={showAvatar}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--card)]">
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full text-sm"
              >
                <span className="text-xs">{getFileIcon(file.type)}</span>
                <span className="truncate max-w-[150px] text-xs font-medium">{file.name}</span>
                <button
                  onClick={() => removePendingFile(file.id)}
                  className="text-[var(--muted)] hover:text-red-500 ml-1 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={fileUploading}
            className="ui-btn ui-btn-ghost p-2 flex-shrink-0 disabled:opacity-50 transition-all hover:bg-[var(--muted)]"
            title="Anexar ficheiro"
          >
            {fileUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--accent)]" />
            ) : (
              <PaperclipIcon />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            className="flex-1 min-h-[44px] max-h-32 resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            rows={1}
          />
          
          <button
            onClick={handleSend}
            disabled={(!inputValue.trim() && pendingFiles.length === 0) || isSending}
            className="ui-btn ui-btn-primary p-2 flex-shrink-0 disabled:opacity-50 transition-all"
            title="Enviar mensagem"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
