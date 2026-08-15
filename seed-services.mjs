const url = 'https://lbodvtcvqxaglacbmhvw.supabase.co/rest/v1/available_services';
const key = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';

const initialServices = [
  { id: "a3b1a8d5-3221-4f1b-90f7-ebf3458e0a81", category: "Car Wash", name: "Exterior Wash", price: 299, durationMinutes: 20, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
  { id: "d8a39a04-5178-43e8-8b9a-4c2813134f55", category: "Car Wash", name: "Premium Wash", price: 599, durationMinutes: 45, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
  { id: "b1154c1d-15e4-4115-be8d-71321457df78", category: "Car Wash", name: "Waterless Wash", price: 349, durationMinutes: 30, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
  { id: "6c3c252a-9e32-4753-93d4-1a9805908cd5", category: "Interior Cleaning", name: "Vacuum Cleaning", price: 199, durationMinutes: 15, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
  { id: "0e66d092-2cc3-4a17-ba42-b0cd3f7deab6", category: "Interior Cleaning", name: "Full Detailing", price: 1299, durationMinutes: 90, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
  { id: "a1122ab9-99a5-4eb1-b0db-fc6efb9b77fa", category: "Tire Air Service", name: "Pressure Check & Refill", price: 49, durationMinutes: 10, isActive: true, vehicleTypes: ["car", "suv", "ev", "bike"] },
  { id: "ccfc44b1-e1f9-4672-9b0d-eec65449efaf", category: "Oil Check", name: "Basic Inspection", price: 149, durationMinutes: 15, isActive: true, vehicleTypes: ["car", "suv"] },
  { id: "62be64e0-7988-4cf5-9cd7-8c5e62f4b4a1", category: "EV Charging", name: "Fast Charging (CCS2)", price: 0, durationMinutes: 0, isActive: true, vehicleTypes: ["ev"] },
  { id: "7f0db3dc-bf91-443f-b0dc-08cdbbec3c0a", category: "Valet Parking", name: "Valet Pickup & Return", price: 99, durationMinutes: 5, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
];

const toSnake = (o) => {
  if (o === null || o === undefined) return o;
  if (Array.isArray(o)) return o.map(toSnake);
  if (typeof o !== 'object') return o;
  const n = {};
  for (const [key, value] of Object.entries(o)) {
    const snakeKey = key.replace(/[A-Z]/g, g => `_${g.toLowerCase()}`);
    n[snakeKey] = toSnake(value);
  }
  return n;
};

async function seed() {
   const res = await fetch(url, {
       method: 'POST',
       headers: {
         'apikey': key,
         'Authorization': `Bearer ${key}`,
         'Content-Type': 'application/json',
         'Prefer': 'return=representation'
       },
       body: JSON.stringify(initialServices.map(toSnake))
   });
   console.log(await res.json());
}
seed();
