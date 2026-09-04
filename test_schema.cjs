const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lbodvtcvqxaglacbmhvw.supabase.co', 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM');
(async () => {
    const { data: bookings } = await supabase.from('bookings').select('*').limit(1);
    console.log("Bookings schema:", bookings ? Object.keys(bookings[0] || {}) : null);
    
    const { data: slots } = await supabase.from('parking_slots').select('*').limit(1);
    console.log("Slots schema:", slots ? Object.keys(slots[0] || {}) : null);
})();
