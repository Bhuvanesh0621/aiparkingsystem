import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = 'https://lbodvtcvqxaglacbmhvw.supabase.co';
const key = 'sb_publishable_CyCu0mFLtR44ZoE_nj04eQ_A6ctDRPM';

const supabase = createClient(url, key);

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

// Data to insert
const statuses = ["available", "occupied", "reserved", "available", "available"];
const types = ["car", "car", "bike", "ev", "suv"];
const initialSlots = Array.from({ length: 48 }, (_, i) => {
  const floor = Math.floor(i / 16) + 1;
  const idx = (i % 16) + 1;
  const type = types[i % types.length];
  const isEV = type === "ev";
  return {
    id: `S-${i + 1}`,
    slotNumber: `${String.fromCharCode(64 + floor)}${String(idx).padStart(2, "0")}`,
    floor,
    status: statuses[(i * 3) % statuses.length],
    type,
    pricePerHour: type === "bike" ? 20 : type === "ev" ? 80 : type === "suv" ? 70 : 50,
    location: `Block ${String.fromCharCode(64 + floor)}`,
    ...(isEV ? {
      isEV: true,
      chargerType: ["AC Type-2", "DC Fast CCS2", "DC Fast CCS2", "AC Type-2"][i % 4],
      chargingPower: ["22kW", "60kW", "120kW", "7kW"][i % 4],
      chargingPricePerKwh: 18,
      chargerStatus: "online",
    } : {}),
  };
});

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

const mockUsers = [
  {
    id: "U-001",
    name: "Guest User",
    email: "guest@example.com",
    role: "user",
    status: "active",
    password: "password123", // Even if there is no password column, the API insert will ignore unknown columns or fail. Wait, if it fails, I should remove it!
  },
  {
    id: "A-001",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    password: "password123",
  }
];

async function sync() {
  console.log("Checking slots...");
  const { data: slots } = await supabase.from('parking_slots').select('id');
  if (!slots || slots.length === 0) {
    console.log("Slots empty, inserting mock slots...");
    for (const slot of initialSlots) {
       await supabase.from('parking_slots').insert(toSnake(slot));
    }
  }

  console.log("Checking services...");
  const { data: srvs } = await supabase.from('available_services').select('id');
  if (!srvs || srvs.length === 0) {
    console.log("Services empty, inserting...");
    for (const srv of initialServices) {
       await supabase.from('available_services').insert(toSnake(srv));
    }
  }
  
  console.log("Checking users...");
  const { data: users } = await supabase.from('users').select('id');
  if (!users || users.length === 0) {
    console.log("Users empty, inserting mock users...");
    for (const user of mockUsers) {
       // Remove password before insert to avoid DB schema error
       const { password, ...userDb } = user;
       await supabase.from('users').insert(toSnake(userDb));
    }
  }

  console.log("Database seeded successfully!");
}

sync();
