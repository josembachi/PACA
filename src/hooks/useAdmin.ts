import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../lib/supabase';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'tutor' | 'client' | 'admin';
  location?: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  jobsPosted: number;
  contractsAsTutor: number;
  contractsAsClient: number;
  reviewsGiven: number;
  reviewsReceived: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalTutors: number;
  totalClients: number;
  newUsers30d: number;
  totalJobs: number;
  openJobs: number;
  totalProposals: number;
  activeContracts: number;
  completedContracts: number;
  totalReviews: number;
  messages24h: number;
  pendingModeration: number;
  failedEmails: number;
  calculatedAt: string;
}

export interface ModerationItem {
  id: string;
  contentType: string;
  contentId: string;
  contentPreview?: string | null;
  reportedBy?: string | null;
  reportReason?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  moderatorId?: string | null;
  moderationNotes?: string | null;
  createdAt: string;
  moderatedAt?: string | null;
  priority: number;
}

export interface ActivityLog {
  id: string;
  adminId?: string | null;
  actionType: string;
  targetType: string;
  targetId?: string | null;
  details?: Record<string, unknown>;
  createdAt: string;
}

async function safeCount<T extends { count?: number | null; error?: unknown } | null>(
  query: () => Promise<T>,
): Promise<number> {
  try {
    const result = await query();
    return result?.count ?? 0;
  } catch {
    return 0;
  }
}

export function useAdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationItem[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_analytics_summary')
        .select('*')
        .single();

      if (!error && data) {
        setAnalytics(data);
        return;
      }

      const [
        totalUsersResult,
        tutorsResult,
        clientsResult,
        newUsersResult,
        totalJobsResult,
        openJobsResult,
        totalProposalsResult,
        activeContractsResult,
        completedContractsResult,
        totalReviewsResult,
        messages24hResult,
        pendingModerationResult,
        failedEmailsResult,
      ] = await Promise.all([
        safeCount(async () => supabase.from('profiles').select('id', { count: 'exact', head: true })),
        safeCount(async () => supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'TUTOR')),
        safeCount(async () => supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['STUDENT', 'PARENT'])),
        safeCount(async () => supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())),
        safeCount(async () => supabase.from('job_posts').select('id', { count: 'exact', head: true })),
        safeCount(async () => supabase.from('job_posts').select('id', { count: 'exact', head: true }).eq('status', 'OPEN')),
        safeCount(async () => supabase.from('proposals').select('id', { count: 'exact', head: true })),
        safeCount(async () => supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('status', 'ACTIVE')),
        safeCount(async () => supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('status', 'COMPLETED')),
        safeCount(async () => supabase.from('reviews').select('id', { count: 'exact', head: true })),
        safeCount(async () => supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())),
        safeCount(async () => supabase.from('moderation_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
        safeCount(async () => supabase.from('email_notifications').select('id', { count: 'exact', head: true }).neq('status', 'sent')),
      ]);

      const fallbackAnalytics: AdminAnalytics = {
        totalUsers: totalUsersResult,
        totalTutors: tutorsResult,
        totalClients: clientsResult,
        newUsers30d: newUsersResult,
        totalJobs: totalJobsResult,
        openJobs: openJobsResult,
        totalProposals: totalProposalsResult,
        activeContracts: activeContractsResult,
        completedContracts: completedContractsResult,
        totalReviews: totalReviewsResult,
        messages24h: messages24hResult,
        pendingModeration: pendingModerationResult,
        failedEmails: failedEmailsResult,
        calculatedAt: new Date().toISOString(),
      };

      setAnalytics(fallbackAnalytics);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setAnalytics({
        totalUsers: 0,
        totalTutors: 0,
        totalClients: 0,
        newUsers30d: 0,
        totalJobs: 0,
        openJobs: 0,
        totalProposals: 0,
        activeContracts: 0,
        completedContracts: 0,
        totalReviews: 0,
        messages24h: 0,
        pendingModeration: 0,
        failedEmails: 0,
        calculatedAt: new Date().toISOString(),
      });
    }
  }, [supabase]);

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [supabase]);

  const fetchModerationQueue = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setModerationQueue(data || []);
    } catch (err) {
      console.error('Failed to fetch moderation queue:', err);
    }
  }, [supabase]);

  const fetchActivityLog = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivityLog(data || []);
    } catch (err) {
      console.error('Failed to fetch activity log:', err);
    }
  }, [supabase]);

  const resolveModeration = async (
    moderationId: string,
    resolution: 'approved' | 'rejected' | 'escalated',
    notes: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.rpc('resolve_moderation', {
        moderation_id: moderationId,
        admin_id: user?.id,
        resolution,
        notes,
      });

      if (error) throw error;
      
      await fetchModerationQueue();
      return true;
    } catch (err) {
      console.error('Failed to resolve moderation:', err);
      return false;
    }
  };

  const suspendUser = async (userId: string, reason: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.rpc('admin_suspend_user', {
        target_user_id: userId,
        admin_id: user?.id,
        reason,
      });

      if (error) throw error;
      
      await fetchUsers();
      return true;
    } catch (err) {
      console.error('Failed to suspend user:', err);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAnalytics(),
        fetchUsers(),
        fetchModerationQueue(),
        fetchActivityLog(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchAnalytics, fetchUsers, fetchModerationQueue, fetchActivityLog]);

  return {
    analytics,
    users,
    moderationQueue,
    activityLog,
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
    refreshUsers: fetchUsers,
    refreshModeration: fetchModerationQueue,
    refreshActivityLog: fetchActivityLog,
    resolveModeration,
    suspendUser,
  };
}

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin((data.role || '').toString().toUpperCase() === 'ADMIN');
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}
