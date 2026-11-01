import { createClient } from "@/lib/supabase";
import type { Conversation, Message, ConversationParticipant, Community, CallLog } from "@/lib/types";

export const chatService = {
  // ==================== CONVERSATION MANAGEMENT ====================

  async createConversation(payload: { 
    userIds: string[], 
    type: 'PRIVATE' | 'GROUP' | 'COMMUNITY', 
    communityId?: string, 
    groupName?: string, 
    groupAvatarUrl?: string 
  }) {
    const supabase = createClient();

    // 1. Create the conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        conversation_type: payload.type,
        community_id: payload.communityId,
        group_name: payload.groupName,
        group_avatar_url: payload.groupAvatarUrl,
        // For private chats, we need a tutorId for legacy support, 
        // but in PACA we rely more on participants.
        tutorId: payload.userIds[0], 
        parentId: payload.userIds[0],
      })
      .select()
      .single();

    if (convError) throw convError;

    // 2. Add all participants
    const participants = payload.userIds.map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      unread_count: 0,
      is_muted: false,
    }));

    const { error: partError } = await supabase
      .from("conversation_participants")
      .insert(participants);

    if (partError) throw partError;

    return conversation;
  },

  async getConversations(userId: string, params: { page: number; limit: number }) {
    const supabase = createClient();
    const from = params.page * params.limit;
    const to = from + params.limit - 1;

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        *,
        lastMessage:messages(content, created_at),
        participants:conversation_participants(user_id)
      `)
      .eq("parentId", userId) // Simplified for this example
      .range(from, to)
      .order("lastMessageAt", { ascending: false });

    if (error) throw error;
    return data;
  },

  // ==================== MESSAGING ====================

  async sendMessage(payload: { 
    conversationId: string, 
    senderId: string, 
    content: string, 
    fileUrl?: string, 
    fileName?: string, 
    fileSize?: number 
  }) {
    const supabase = createClient();

    // 1. Insert the message
    const { data: message, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: payload.conversationId,
        sender_id: payload.senderId,
        content: payload.content,
        file_url: payload.fileUrl,
        file_name: payload.fileName,
        file_size: payload.fileSize,
        is_read: false,
      })
      .select()
      .single();

    if (msgError) throw msgError;

    // 2. Update conversation last message timestamp
    const { error: convError } = await supabase
      .from("conversations")
      .update({ lastMessageAt: new Date().toISOString() })
      .eq("id", payload.conversationId);

    if (convError) throw convError;

    return message;
  },

  async markAsRead(conversationId: string, userId: string) {
    const supabase = createClient();
    
    const { error: msgError } = await supabase
      .from("messages")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId);

    if (msgError) throw msgError;

    const { error: partError } = await supabase
      .from("conversation_participants")
      .update({ unread_count: 0, last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);

    if (partError) throw partError;

    return { success: true };
  },

  // ==================== COMMUNITIES & GROUPS ====================

  async createCommunity(payload: { name: string, description: string, creatorId: string, avatarUrl?: string }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("communities")
      .insert({
        name: payload.name,
        description: payload.description,
        created_by: payload.creatorId,
        avatar_url: payload.avatarUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async joinCommunity(communityId: string, userId: string) {
    const supabase = createClient();
    
    // Create a community conversation for the user
    const { data, error } = await this.createConversation({
      userIds: [userId],
      type: 'COMMUNITY',
      communityId: communityId,
    });

    if (error) throw error;
    return data;
  },

  // ==================== CALLS ====================

  async logCall(payload: { 
    conversationId: string, 
    callerId: string, 
    type: 'VOICE' | 'VIDEO', 
    status: 'MISSED' | 'COMPLETED' | 'REJECTED' | 'BUSY', 
    duration?: number 
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("call_logs")
      .insert({
        conversation_id: payload.conversationId,
        caller_id: payload.callerId,
        call_type: payload.type,
        status: payload.status,
        duration_seconds: payload.duration,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
