const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lbodvtcvqxaglacbmhvw.supabase.co', 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM');
(async () => {
    // Attempt to insert a dummy user to see schema error or what columns work
    const { data, error } = await supabase.from('users').update({ test_column: 1 }).eq('id', 'U-001');
    console.log("Error:", error);
})();
