import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbodvtcvqxaglacbmhvw.supabase.co';
const supabaseKey = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing signup...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: {
        name: 'Test User',
        role: 'user',
        vehicles: []
      }
    }
  });
  console.log(error ? error : 'Signup OK');
}

test();

