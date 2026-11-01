import { createClient } from "@/lib/supabase";

/**
 * Unified API Client for PACA.
 * This client ensures that Web, Desktop, and Mobile apps 
 * interact with the backend using the same patterns.
 */
export const apiClient = {
  async request<T>(
    table: string, 
    operation: 'select' | 'insert' | 'update' | 'delete', 
    payload: any, 
    options: { filter?: any; single?: boolean } = {}
  ): Promise<T> {
    const supabase = createClient();
    let query: any = supabase.from(table);

    switch (operation) {
      case 'select':
        if (options.filter) {
          // Simple filter implementation for the unified client
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;
      case 'insert':
        query = query.insert(payload);
        break;
      case 'update':
        // Assuming payload contains the filter in a specific format or handled externally
        query = query.update(payload);
        break;
      case 'delete':
        query = query.delete();
        break;
    }

    if (options.single) {
      query = query.single();
    }

    const { data, error } = await query.select();

    if (error) {
      console.error(`[API Client Error] ${table} ${operation}:`, error);
      throw error;
    }

    return data as T;
  },

  /**
   * Specialized helper for fetching a single record by ID
   */
  async getById<T>(table: string, id: string): Promise<T> {
    return this.request<T>(table, 'select', {}, { filter: { id }, single: true });
  },

  /**
   * Specialized helper for updating a record by ID
   */
  async updateById<T>(table: string, id: string, updates: any): Promise<T> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }
};
