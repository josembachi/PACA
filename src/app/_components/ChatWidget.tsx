"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STORAGE_PREFIX } from "../../lib/brand";
import { useI18n } from "../providers";

type ChatRole = "user" | "bot";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type MessageForAPI = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_SEEN_KEY = `${STORAGE_PREFIX}.chat.seen`;

function ChatIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function nextId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ChatWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [seen, setSeen] = useState(true);
  const [nudge, setNudge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: nextId(),
      role: "bot",
      text: t("chat.greeting"),
    },
  ]);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages((current) =>
      current.length === 1 && current[0].role === "bot"
        ? [{ ...current[0], text: t("chat.greeting") }]
        : current,
    );
  }, [t]);

  // Load seen preference from localStorage
  useEffect(() => {
    try {
      const value = localStorage.getItem(STORAGE_SEEN_KEY);
      const hasSeen = value === "1";
      setSeen(hasSeen);

      if (!hasSeen) {
        const start = window.setTimeout(() => setNudge(true), 0);
        const timeout = window.setTimeout(() => setNudge(false), 20_000);

        return () => {
          window.clearTimeout(start);
          window.clearTimeout(timeout);
        };
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [open, messages.length]);

  const showAttention = useMemo(() => {
    return !open && !seen;
  }, [open, seen]);

  const markSeen = () => {
    try {
      localStorage.setItem(STORAGE_SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setSeen(true);
    setNudge(false);
  };

  const onToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) markSeen();
      return next;
    });
  };

  const callAI = async (userText: string, currentMessages: ChatMessage[]) => {
    setIsLoading(true);
    
    // Add a temporary "thinking" message
    const tempId = nextId();
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "bot", text: "Thinking..." },
    ]);
    
    try {
      // Convert messages to API format (excluding the temp message)
      const apiMessages: MessageForAPI[] = currentMessages
        .map(m => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));
      
      // Add the new user message
      apiMessages.push({
        role: "user",
        content: userText,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let hasReceivedContent = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("0:")) {
            const textContent = line.slice(2).trim();
            if (textContent) {
              try {
                const cleanText = textContent.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
                if (cleanText) {
                  fullText += cleanText;
                  hasReceivedContent = true;
                  
                  // Update the message with accumulated text
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === tempId ? { ...m, text: fullText } : m
                    )
                  );
                }
              } catch {
                // ignore parsing errors
              }
            }
          }
        }
      }

      // If we got no content at all, use fallback
      if (!hasReceivedContent || !fullText.trim()) {
        throw new Error("No content received");
      }
    } catch {
      // Avoid displaying outdated or unrelated fallback information.
      const reply = t("chat.fallback");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, text: reply } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      text: trimmed,
    };

    const currentMessages = [...messages, userMessage];
    setDraft("");
    setMessages(currentMessages);

    // Always try AI first, fallback to rule-based if it fails
    callAI(trimmed, messages);
  };

  return (
    <div className="fixed bottom-28 right-[18px] z-[90] md:bottom-[18px]">
      {open && (
        <div
          className="glass-panel"
          style={{
            width: 360,
            maxWidth: "calc(100vw - 36px)",
            maxHeight: "min(70vh, 540px)",
            overflow: "hidden",
            marginBottom: 12,
          }}
          role="dialog"
          aria-label={t("chat.dialogLabel")}
        >
          <div
            className="flex items-center justify-between gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--divider)" }}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t("chat.title")}</p>
              <p className="text-xs ui-muted">{t("chat.subtitle")}</p>
            </div>

            <button
              type="button"
              className="ui-btn ui-icon-btn"
              onClick={() => setOpen(false)}
              aria-label={t("chat.close")}
              title={t("chat.close")}
            >
              <CloseIcon />
            </button>
          </div>

          <div
            ref={listRef}
            className="px-4 py-3"
            style={{
              overflowY: "auto",
              maxHeight: "min(52vh, 380px)",
            }}
          >
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className="max-w-[85%] rounded-2xl border px-3 py-2 text-sm"
                    style={{
                      borderColor: "var(--divider)",
                      background:
                        m.role === "user"
                          ? "var(--accent)"
                          : "var(--panel-surface)",
                      color:
                        m.role === "user"
                          ? "var(--background)"
                          : "var(--foreground)",
                      boxShadow: "var(--tile-shadow)",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="border-t px-4 py-3"
            style={{ borderColor: "var(--divider)" }}
          >
            <div className="flex items-center gap-2">
              <input
                className="ui-field"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("chat.input.placeholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSend();
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                className="ui-btn ui-btn-primary"
                onClick={onSend}
                disabled={!draft.trim() || isLoading}
                style={{ opacity: draft.trim() && !isLoading ? 1 : 0.7 }}
              >
                {t("chat.send")}
              </button>
            </div>
            <p className="mt-2 text-xs ui-muted">
              {t("chat.accountHelp")}
            </p>
          </div>
        </div>
      )}

      <div className="relative flex items-center justify-end gap-3">
        {nudge && !open && (
          <div
            className="hidden sm:block rounded-2xl border px-3 py-2 text-xs"
            style={{
              borderColor: "var(--divider)",
              background: "var(--panel-surface)",
              boxShadow: "var(--tile-shadow)",
            }}
          >
            <span className="font-semibold">{t("chat.nudge.title")}</span>
            <span className="ml-1 ui-muted">{t("chat.nudge.body")}</span>
          </div>
        )}

        <button
          type="button"
          className="ui-btn ui-btn-primary ui-icon-btn relative"
          onClick={onToggle}
          aria-label={open ? t("chat.close") : t("chat.open")}
        >
          <ChatIcon />

          {showAttention && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 14,
                height: 14,
              }}
            >
              <span
                className="absolute inset-0 animate-ping rounded-full"
                style={{
                  background: "var(--accent-glow)",
                  opacity: 0.65,
                }}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "var(--accent-glow)",
                  boxShadow: "0 0 12px var(--accent-glow)",
                }}
              />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
