import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbodvtcvqxaglacbmhvw.supabase.co';
const supabaseKey = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing signup with no metadata...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + 'nometa@example.com',
    password: 'password123',
  });
  console.log(error ? error : 'Signup OK');
}

test();

