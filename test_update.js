const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lbodvtcvqxaglacbmhvw.supabase.co', 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM');
(async () => {
    const { data, error } = await supabase.from('users').update({ reward_points: 50 }).eq('id', 'U-001').select();
    console.log("Update result:", data);
    console.log("Error:", error);
})();
