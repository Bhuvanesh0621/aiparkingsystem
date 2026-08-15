import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  console.log("Fetching users from Supabase Auth...");
  
  // Fetch from auth.users
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error fetching auth users:", authError);
    return;
  }
  
  console.log(`Found ${authData.users.length} users in authentication system:\n`);
  
  authData.users.forEach((user, index) => {
    console.log(`User ${index + 1}:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`  Role Metadata: ${user.user_metadata?.role || 'user'}`);
    console.log(`  Name Metadata: ${user.user_metadata?.name || 'N/A'}`);
    console.log(`  Password: [ENCRYPTED/HIDDEN BY SUPABASE]`);
    console.log('--------------------------------------------------');
  });
  
  console.log("\nFetching users from public.users table...");
  const { data: publicData, error: publicError } = await supabaseAdmin.from('users').select('*');
  
  if (publicError) {
    console.error("Error fetching public users:", publicError);
    return;
  }
  
  console.log(`Found ${publicData.length} users in public profiles:\n`);
  publicData.forEach((user, index) => {
    console.log(`Profile ${index + 1}:`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log('--------------------------------------------------');
  });
}

listUsers();
