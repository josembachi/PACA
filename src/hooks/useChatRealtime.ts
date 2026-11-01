"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Message } from "@/lib/types";

interface UseChatRealtimeProps {
  conversationId: string;
  userId: string;
  onMessageReceived: (message: Message) => void;
  onTypingStatusChange: (userId: string, isTyping: boolean) => void;
}

export function useChatRealtime({ 
  conversationId, 
  userId, 
  onMessageReceived, 
  onTypingStatusChange 
}: UseChatRealtimeProps) {
  useEffect(() => {
    const supabase = createClient();

    // 1. Listen for new messages
    const messageSubscription = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessageReceived(payload.new as Message);
        }
      )
      .subscribe();

    // 2. Listen for typing indicators via Broadcast
    const typingSubscription = supabase
      .channel(`typing:${conversationId}`)
      .on(
        "broadcast",
        { event: "typing" },
        ({ payload }) => {
          const { userId: typingUserId, isTyping } = payload;
          if (typingUserId !== userId) {
            onTypingStatusChange(typingUserId, isTyping);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(typingSubscription);
    };
  }, [conversationId, userId, onMessageReceived, onTypingStatusChange]);
}
