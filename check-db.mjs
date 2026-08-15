const url = 'https://lbodvtcvqxaglacbmhvw.supabase.co/rest/v1/available_services';
const key = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';

async function check() {
  const res = await fetch(url, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const data = await res.json();
  console.log("Services IDs:", data.map(s => s.id));
}

check();
