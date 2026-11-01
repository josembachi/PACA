import { createClient } from "@/lib/supabase";

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  content_id: string;
  content_type: 'MESSAGE' | 'PROFILE' | 'COMMUNITY';
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
}

export const moderationService = {
  /**
   * Reports a piece of content or a user.
   */
  async reportContent(payload: {
    reporterId: string;
    reportedUserId: string;
    contentId: string;
    contentType: 'MESSAGE' | 'PROFILE' | 'COMMUNITY';
    reason: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: payload.reporterId,
        reported_user_id: payload.reportedUserId,
        content_id: payload.contentId,
        content_type: payload.contentType,
        reason: payload.reason,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Resolves a report and optionally takes action (e.g., deleting content).
   */
  async resolveReport(reportId: string, action: 'DISMISS' | 'DELETE_CONTENT' | 'BAN_USER') {
    const supabase = createClient();
    
    // 1. Update report status
    const { error: reportError } = await supabase
      .from("reports")
      .update({ status: 'RESOLVED' })
      .eq("id", reportId);

    if (reportError) throw reportError;

    // 2. Perform action based on decision
    if (action === 'DELETE_CONTENT') {
      const { data: report } = await supabase
        .from("reports")
        .select("content_id, content_type")
        .eq("id", reportId)
        .single();

      if (report) {
        const table = report.content_type === 'MESSAGE' ? 'messages' : 
                      report.content_type === 'COMMUNITY' ? 'communities' : 'profiles';
        await supabase.from(table).delete().eq("id", report.content_id);
      }
    }

    return { success: true };
  },

  /**
   * Fetches all pending reports for administrators.
   */
  async getPendingReports() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("reports")
      .select("*, reported_user:profiles(name)")
      .eq("status", 'PENDING')
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};
