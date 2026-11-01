import { createClient } from "@/lib/supabase";

export const communityService = {
  /**
   * Updates community details (name, description, avatar).
   */
  async updateCommunity(communityId: string, updates: { name?: string; description?: string; avatar_url?: string }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("communities")
      .update(updates)
      .eq("id", communityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Adds a user to a specific group conversation.
   */
  async addParticipantToGroup(conversationId: string, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("conversation_participants")
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        unread_count: 0,
        is_muted: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Removes a user from a group conversation.
   */
  async removeParticipantFromGroup(conversationId: string, userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("conversation_participants")
      .delete()
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Updates group-specific settings in the conversation table.
   */
  async updateGroupSettings(conversationId: string, updates: { group_name?: string; group_avatar_url?: string }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("conversations")
      .update(updates)
      .eq("id", conversationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
