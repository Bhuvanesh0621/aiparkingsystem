import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseKey && 
  typeof supabaseUrl === 'string' && 
  supabaseUrl.startsWith('http')
);

// Safe zero-network mock client when Supabase is not configured or in offline demo mode
const createSafeMockSupabase = () => ({
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Offline mode") }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error("Offline mode") }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => {
    const chain: any = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      order: () => chain,
      single: async () => ({ data: null, error: null }),
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
      catch: (reject: any) => Promise.resolve({ data: [], error: null }).catch(reject),
    };
    return chain;
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
    send: async () => {},
  }),
  rpc: async () => ({ data: null, error: null }),
});

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : (createSafeMockSupabase() as any);
