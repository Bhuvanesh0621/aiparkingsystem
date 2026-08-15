import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const newUserData = {
    name: 'Bhuvaneshkumar M',
    email: 'bhuvaneshkumar299@gmail.com',
    role: 'admin',
    status: 'active',
    wallet_balance: 500,
    phone: '9941135545'
  };
  
  console.log("Attempting insert...");
  const { data, error } = await supabase.from('users').insert([newUserData]).select('id, role').single();
  
  if (error) {
    console.error("Error inserting:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! User created with ID:", data.id);
  }
}

test();
