import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseKey && 
  typeof supabaseUrl === 'string' && 
  supabaseUrl.startsWith('http')
);

if (!isSupabaseConfigured) {
  console.info("⚡ SmartPark.AI running in hybrid mode (local storage + reactive state engine active)");
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : createClient('https://mock-supabase.local', 'mock-anon-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
