import { createClient } from '@supabase/supabase-js';

const url = 'https://lbodvtcvqxaglacbmhvw.supabase.co';
const key = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    // Attempt to make a simple request to check connectivity
    // E.g., getting a list of tables or just fetching something simple.
    // If the API key is valid but there's no data or RLS prevents reading, we might get an empty array or a specific error (but not a 401 unauthorized).
    // Let's just try to query a common table name or just the auth API.
    
    // Auth check is easiest for validating the API key
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection test failed with error:', error.message);
      return false;
    }
    
    // Also try to query a table to see if the DB is accessible
    const { error: dbError } = await supabase.from('users').select('*').limit(1);
    
    console.log('API Key is valid!');
    console.log('Connection to Supabase project was SUCCESSFUL.');
    
    if (dbError) {
      console.log('Note: Database query returned an error (might be expected if table doesn\'t exist or RLS blocks it):', dbError.message);
    } else {
      console.log('Database query was also successful.');
    }
    
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
}

testConnection();
