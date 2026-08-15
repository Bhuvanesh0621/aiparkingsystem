
fetch('https://lbodvtcvqxaglacbmhvw.supabase.co/rest/v1/users?limit=1', {
  headers: {
    'apikey': 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM',
    'Authorization': 'Bearer sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM'
  }
}).then(res => res.json()).then(data => console.log(data));

