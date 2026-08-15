import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbodvtcvqxaglacbmhvw.supabase.co';
const supabaseKey = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (data) {
    if (data.length > 0) {
      console.log('Columns:', Object.keys(data[0]));
    } else {
      // no rows, try an insert that violates a constraint to see the error, but we can't because of auth.users fkey
      console.log('No rows in users');
    }
  } else {
    console.log('Error:', error);
  }
}

test();

