"use client";

import React, { useState, useEffect, useRef } from "react";
import { chatService } from "@/services/chatService";
import { MessageBubble } from "./MessageBubble";
import { Search, Send, Paperclip, Smile, MoreVertical, Settings, Phone, Video, AlertTriangle, Mic, MicOff } from "lucide-react";
import { Conversation, Message } from "@/lib/types";
import { useAuth } from "@/app/providers";
import { useChatRealtime } from "@/hooks/useChatRealtime";
import { GroupSettingsModal } from "./GroupSettingsModal";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CallInterface } from "./CallInterface";

export function ChatWindow() {
  const { auth } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recorderChunksRef = useRef<BlobPart[]>([]);
  const recorderStreamRef = useRef<MediaStream | null>(null);

  const { startCall, stopCall, localStream, remoteStream, callStatus } = useWebRTC({
    conversationId: activeConv?.id || "",
    userId: auth?.user.id || "",
    onCallEnded: () => {
      console.log("Call ended");
    },
  });

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
      setMessages([
        { id: "welcome", conversationId: activeConv.id, senderId: "other", content: "Olá! Como vai a tua aprendizagem?", isRead: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "reply", conversationId: activeConv.id, senderId: auth?.user.id || "me", content: "Tudo ótimo, estou a gostar muito do curso!", isRead: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
    loadMessages();
  }, [activeConv, auth]);

  useChatRealtime({
    conversationId: activeConv?.id || "",
    userId: auth?.user.id || "",
    onMessageReceived: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },
    onTypingStatusChange: (userId, isTyping) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    },
  });

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleInputChange = async (val: string) => {
    setInput(val);
    if (activeConv && auth?.user.id) {
      await chatService.sendTypingIndicator(activeConv.id, auth.user.id, val.length > 0);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeConv || !auth?.user.id) return;

    try {
      const msg = await chatService.sendMessage({
        conversationId: activeConv.id,
        senderId: auth.user.id,
        content: input,
      });
      setMessages((prev) => [...prev, msg]);
      setInput("");
      await chatService.sendTypingIndicator(activeConv.id, auth.user.id, false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAudioRecording = async () => {
    if (!activeConv || !auth?.user.id) return;

    if (isRecordingAudio) {
      mediaRecorderRef.current?.stop();
      setIsRecordingAudio(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      console.warn("Gravação de áudio não suportada neste navegador.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recorderChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recorderChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(blob);

        const audioMessage: Message = {
          id: `voice-${Date.now()}`,
          conversationId: activeConv.id,
          senderId: auth.user.id,
          content: "🎵 Nota de voz",
          fileUrl: audioUrl,
          fileName: `voice-note-${Date.now()}.webm`,
          fileSize: blob.size,
          isRead: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, audioMessage]);
        recorderStreamRef.current?.getTracks().forEach((track) => track.stop());
        recorderStreamRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação de áudio:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-72px)] overflow-hidden bg-[#e5ddd5] text-slate-800">
      <aside className="hidden md:flex w-[360px] flex-col border-r border-[#d9d9d9] bg-[#f0f2f5]">
        <div className="flex items-center justify-between bg-[#075e54] px-5 py-4 text-white">
          <div className="font-semibold">Conversas</div>
          <div className="rounded-full bg-white/10 px-2 py-1 text-[10px]">{conversations.length}</div>
        </div>

        <div className="p-3 border-b border-slate-200 bg-[#f0f2f5]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar conversas..."
              className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3 rounded-xl bg-white p-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                    <div className="h-3 w-2/3 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setActiveConv(conv)}
                className={`flex w-full items-center gap-3 border-b border-slate-200 px-3 py-3 text-left transition-colors ${
                  activeConv?.id === conv.id ? "bg-[#ebf7f6]" : "bg-[#f0f2f5] hover:bg-white"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe7e7] font-bold text-[#075e54]">
                  {conv.tutor?.name?.[0] || conv.group_name?.[0] || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {conv.tutor?.name || conv.group_name || "Utilizador"}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-slate-500">{conv.lastMessage?.content || "Sem mensagens"}</p>
                    {conv.unreadCount && conv.unreadCount > 0 ? (
                      <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#25d366] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {conv.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-[#efeae2]">
        {activeConv ? (
          <>
            <header className="flex h-20 items-center justify-between border-b border-[#d9d9d9] bg-[#075e54] px-4 text-white md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold">
                  {activeConv.tutor?.name?.[0] || activeConv.group_name?.[0] || "U"}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{activeConv.tutor?.name || activeConv.group_name || "Utilizador"}</div>
                  <div className="text-[11px] text-emerald-100">
                    {Object.values(typingUsers).some((value) => value) ? "Está a escrever..." : "Online"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button onClick={() => startCall(false)} className="rounded-full p-2 text-white/90 hover:bg-white/10" title="Chamada de voz">
                  <Phone size={18} />
                </button>
                <button onClick={() => startCall(true)} className="rounded-full p-2 text-white/90 hover:bg-white/10" title="Vídeo chamada">
                  <Video size={18} />
                </button>
                {activeConv.conversation_type !== "PRIVATE" && (
                  <button onClick={() => setIsSettingsOpen(true)} className="rounded-full p-2 text-white/90 hover:bg-white/10" title="Definições do grupo">
                    <Settings size={18} />
                  </button>
                )}
                <button className="rounded-full p-2 text-white/90 hover:bg-white/10" aria-label="Mais opções">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
              <div className="mx-auto max-w-4xl space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="group relative">
                    <MessageBubble message={msg} isOwnMessage={msg.senderId === auth?.user.id} />
                    {msg.senderId !== auth?.user.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMsgId(msg.id);
                          setReportModalOpen(true);
                        }}
                        className="absolute -left-1 top-2 hidden rounded-full bg-white/80 p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 md:block"
                        title="Denunciar mensagem"
                      >
                        <AlertTriangle size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#d9d9d9] bg-[#f0f2f5] p-3 md:p-4">
              <div className="mx-auto flex max-w-4xl items-center gap-2 md:gap-3">
                <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-200" aria-label="Emojis">
                  <Smile size={20} />
                </button>
                <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-200" aria-label="Anexar ficheiro">
                  <Paperclip size={20} />
                </button>

                <div className="flex-1 rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Escreve uma mensagem..."
                    className="w-full rounded-full bg-transparent px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                {isRecordingAudio ? (
                  <button
                    type="button"
                    onClick={toggleAudioRecording}
                    className="rounded-full bg-red-500 p-3 text-white shadow-md transition hover:bg-red-600"
                    aria-label="Parar gravação"
                  >
                    <MicOff size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={toggleAudioRecording}
                    className="rounded-full bg-[#075e54] p-3 text-white shadow-md transition hover:bg-[#0a6a5d]"
                    aria-label="Gravar nota de voz"
                  >
                    <Mic size={20} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSend}
                  className="rounded-full bg-[#25d366] p-3 text-white shadow-md transition hover:bg-[#1ebd59]"
                  aria-label="Enviar mensagem"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>

            {activeConv && isSettingsOpen && (
              <GroupSettingsModal
                conversation={activeConv}
                onClose={() => setIsSettingsOpen(false)}
                onSuccess={() => {
                  setActiveConv({ ...activeConv });
                  setIsSettingsOpen(false);
                }}
              />
            )}

            {callStatus !== "IDLE" && (
              <CallInterface localStream={localStream} remoteStream={remoteStream} onEndCall={stopCall} />
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center bg-[#efeae2] p-8 text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#075e54] shadow-sm">
                <MessageSquare size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">As tuas conversas aparecem aqui</h3>
              <p className="mt-2 text-sm text-slate-500">
                Seleciona uma conversa para iniciar uma chamada, enviar mensagens ou gravar uma nota de voz.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MessageSquare({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
