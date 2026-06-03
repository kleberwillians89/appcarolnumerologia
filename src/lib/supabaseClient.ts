import { createClient } from '@supabase/supabase-js';
import { hasSupabaseConfig, supabaseAnonKey, supabaseUrl } from '@/config/env';

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
