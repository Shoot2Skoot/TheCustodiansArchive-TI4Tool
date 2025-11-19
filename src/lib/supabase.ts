import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables from Doppler
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Make sure VITE_SUPABASE_PROJECT_URL and VITE_SUPABASE_ANON_KEY are set in Doppler.'
  );
}

// Create typed Supabase client
export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Type exports for convenience
export type TypedSupabaseClient = typeof supabase;
