const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lbodvtcvqxaglacbmhvw.supabase.co', 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM');
(async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log("Select result:", data);
    console.log("Error:", error);
})();
