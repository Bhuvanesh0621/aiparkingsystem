import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbodvtcvqxaglacbmhvw.supabase.co';
const supabaseKey = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const res1 = await supabase.from('emergency_requests').select('*').limit(1);
  console.log('Emergencies:', res1.error || 'OK');

  const res2 = await supabase.from('service_requests').select('*').limit(1);
  console.log('ServiceRequests:', res2.error || 'OK');

  const res3 = await supabase.from('notifications').select('*').limit(1);
  console.log('Notifications:', res3.error || 'OK');
}

test();

