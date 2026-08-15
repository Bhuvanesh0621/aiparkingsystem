import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting update...");
  const { data, error } = await supabase.from('users').update({ role: 'admin' }).eq('email', 'bhuvaneshkumar299@gmail.com').select('id, role').single();
  
  if (error) {
    console.error("Error updating:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! User updated to admin with ID:", data.id);
  }
}

test();
