import { createClient } from '@supabase/supabase-js';

// Environment variables from Doppler
const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Make sure VITE_SUPABASE_PROJECT_URL and VITE_SUPABASE_ANON_KEY are set in Doppler.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
