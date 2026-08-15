import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log("Starting transactional data cleanup...");
  
  const tables = [
    'maintenance_records',
    'notifications',
    'emergency_requests',
    'service_requests',
    'incidents',
    'bookings'
  ];

  for (const table of tables) {
    console.log(`Deleting all records from ${table}...`);
    const { data: rows } = await supabase.from(table).select('id');
    if (rows && rows.length > 0) {
      const ids = rows.map(r => r.id);
      
      // Delete in batches of 100 to avoid request size limits if many records
      const batchSize = 100;
      for (let i = 0; i < ids.length; i += batchSize) {
         const batch = ids.slice(i, i + batchSize);
         const { error: delError } = await supabase.from(table).delete().in('id', batch);
         if (delError) {
           console.error(`Failed to delete from ${table}:`, delError);
         }
      }
      console.log(`Deleted ${rows.length} records from ${table}.`);
    } else {
       console.log(`No records to delete from ${table}.`);
    }
  }

  console.log("Cleanup complete!");
}

cleanup().catch(console.error);
