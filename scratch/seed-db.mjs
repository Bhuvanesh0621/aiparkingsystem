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
  { id: "srv-1", category: "Car Wash", name: "Exterior Wash", price: 299, durationMinutes: 20, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
  { id: "srv-2", category: "Car Wash", name: "Premium Wash", price: 599, durationMinutes: 45, isActive: true, vehicleTypes: ["car", "suv", "ev"] },
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
