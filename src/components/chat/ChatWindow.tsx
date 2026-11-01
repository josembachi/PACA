"use client";

import React, { useState, useEffect } from "react";
import { chatService } from "@/services/chatService";
import { MessageBubble } from "./MessageBubble";
import { Search, Send, Paperclip, Smile, MoreVertical } from "lucide-react";
import { Conversation, Message } from "@/lib/types";
import { useAuth } from "@/app/providers";

export function ChatWindow() {
  const { auth } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      if (!auth?.user.id) return;
      try {
        const data = await chatService.getConversations(auth.user.id, { page: 0, limit: 50 });
        setConversations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadChats();
  }, [auth]);

  useEffect(() => {
    async function loadMessages() {
      if (!activeConv) return;
      // In a real app, we'd fetch messages from chatService.getMessages(activeConv.id)
      // For now, we simulate a few messages
      setMessages([
        { id: '1', conversationId: activeConv.id, senderId: 'other', content: 'Olá! Como vai a tua aprendizagem?', isRead: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', conversationId: activeConv.id, senderId: auth?.user.id || 'me', content: 'Tudo ótimo, estou a gostar muito do curso!', isRead: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
    loadMessages();
  }, [activeConv, auth]);

  const handleSend = async () => {
    if (!input.trim() || !activeConv || !auth?.user.id) return;
    
    try {
      const msg = await chatService.sendMessage({
        conversationId: activeConv.id,
        senderId: auth.user.id,
        content: input,
      });
      setMessages(prev => [...prev, msg]);
      setInput("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-950 overflow-hidden">
      {/* Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar conversas..." 
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                onClick={() => setActiveConv(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${
                  activeConv?.id === conv.id ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                  {conv.tutor?.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-semibold text-sm truncate">{conv.tutor?.name || "Utilizador"}</p>
                    <span className="text-[10px] text-gray-500">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content || "Sem mensagens"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-950">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                  {activeConv.tutor?.name?.[0] || "U"}
                </div>
                <div>
                  <p className="font-bold text-sm">{activeConv.tutor?.name || "Utilizador"}</p>
                  <p className="text-[10px] text-green-500 font-medium">Online</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isOwnMessage={msg.senderId === auth?.user.id} 
                />
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 max-w-5xl mx-auto">
                <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                  <Smile size={22} />
                </button>
                <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                  <Paperclip size={22} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Escreva uma mensagem..." 
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                />
                <button 
                  onClick={handleSend}
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-all shadow-md"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <MessageSquare size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">As tuas conversas aparecem aqui</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-2">
              Seleciona um chat para começar a comunicar com professores ou alunos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageSquare({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
