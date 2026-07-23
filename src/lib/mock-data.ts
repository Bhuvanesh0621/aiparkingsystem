// Shared mock data for SmartPark AI (frontend-only build).
export type SlotStatus = "available" | "occupied" | "reserved";
export type VehicleType = "car" | "bike" | "ev" | "suv";

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  floor: number;
  status: SlotStatus;
  type: VehicleType;
  pricePerHour: number;
  location: string;
}

export interface Booking {
  id: string;
  slotNumber: string;
  floor: number;
  vehicleNumber: string;
  vehicleType: VehicleType;
  startTime: string;
  endTime: string;
  amount: number;
  status: "active" | "completed" | "cancelled" | "upcoming";
  paymentStatus: "paid" | "pending" | "refunded";
}

const statuses: SlotStatus[] = ["available", "occupied", "reserved", "available", "available"];
const types: VehicleType[] = ["car", "car", "bike", "ev", "suv"];

export const parkingSlots: ParkingSlot[] = Array.from({ length: 48 }, (_, i) => {
  const floor = Math.floor(i / 16) + 1;
  const idx = (i % 16) + 1;
  const type = types[i % types.length];
  return {
    id: `S-${i + 1}`,
    slotNumber: `${String.fromCharCode(64 + floor)}${String(idx).padStart(2, "0")}`,
    floor,
    status: statuses[(i * 3) % statuses.length],
    type,
    pricePerHour: type === "bike" ? 20 : type === "ev" ? 80 : type === "suv" ? 70 : 50,
    location: `Block ${String.fromCharCode(64 + floor)}`,
  };
});

export const bookings: Booking[] = [
  { id: "BK-10241", slotNumber: "A03", floor: 1, vehicleNumber: "MH 12 AB 4521", vehicleType: "car", startTime: "2026-07-13T09:00", endTime: "2026-07-13T12:00", amount: 150, status: "active", paymentStatus: "paid" },
  { id: "BK-10240", slotNumber: "B11", floor: 2, vehicleNumber: "MH 12 AB 4521", vehicleType: "car", startTime: "2026-07-12T14:00", endTime: "2026-07-12T17:00", amount: 150, status: "completed", paymentStatus: "paid" },
  { id: "BK-10237", slotNumber: "C02", floor: 3, vehicleNumber: "MH 12 AB 4521", vehicleType: "ev", startTime: "2026-07-10T08:00", endTime: "2026-07-10T18:00", amount: 800, status: "completed", paymentStatus: "paid" },
  { id: "BK-10233", slotNumber: "A08", floor: 1, vehicleNumber: "MH 12 AB 4521", vehicleType: "car", startTime: "2026-07-08T11:00", endTime: "2026-07-08T13:00", amount: 100, status: "cancelled", paymentStatus: "refunded" },
  { id: "BK-10229", slotNumber: "B04", floor: 2, vehicleNumber: "MH 12 AB 4521", vehicleType: "bike", startTime: "2026-07-05T10:00", endTime: "2026-07-05T12:00", amount: 40, status: "completed", paymentStatus: "paid" },
  { id: "BK-10225", slotNumber: "A12", floor: 1, vehicleNumber: "MH 12 AB 4521", vehicleType: "car", startTime: "2026-07-14T09:00", endTime: "2026-07-14T11:00", amount: 100, status: "upcoming", paymentStatus: "paid" },
];

export const revenueSeries = [
  { m: "Jan", revenue: 32000, bookings: 420 },
  { m: "Feb", revenue: 38000, bookings: 510 },
  { m: "Mar", revenue: 42000, bookings: 560 },
  { m: "Apr", revenue: 48000, bookings: 620 },
  { m: "May", revenue: 55000, bookings: 710 },
  { m: "Jun", revenue: 61000, bookings: 780 },
  { m: "Jul", revenue: 68500, bookings: 860 },
];

export const occupancySeries = Array.from({ length: 12 }, (_, i) => ({
  hour: `${(i * 2).toString().padStart(2, "0")}:00`,
  occupied: Math.round(30 + Math.sin(i / 1.6) * 25 + Math.random() * 10),
  reserved: Math.round(10 + Math.cos(i / 2) * 6 + Math.random() * 4),
}));

export const vehicleMix = [
  { name: "Cars", value: 62, color: "var(--primary)" },
  { name: "SUVs", value: 18, color: "var(--secondary)" },
  { name: "EVs", value: 12, color: "var(--success)" },
  { name: "Bikes", value: 8, color: "var(--warning)" },
];

export const adminUsers = [
  { id: "U-001", name: "Aarav Sharma", email: "aarav@smartpark.ai", role: "user", status: "active", joined: "2026-05-12" },
  { id: "U-002", name: "Priya Iyer", email: "priya@smartpark.ai", role: "user", status: "active", joined: "2026-05-20" },
  { id: "U-003", name: "Rahul Nair", email: "rahul@smartpark.ai", role: "admin", status: "active", joined: "2026-01-04" },
  { id: "U-004", name: "Sara Khan", email: "sara@smartpark.ai", role: "user", status: "suspended", joined: "2026-03-18" },
  { id: "U-005", name: "Vikram Mehta", email: "vikram@smartpark.ai", role: "user", status: "active", joined: "2026-06-01" },
  { id: "U-006", name: "Neha Gupta", email: "neha@smartpark.ai", role: "user", status: "active", joined: "2026-06-08" },
];

export const stats = {
  available: parkingSlots.filter((s) => s.status === "available").length,
  occupied: parkingSlots.filter((s) => s.status === "occupied").length,
  reserved: parkingSlots.filter((s) => s.status === "reserved").length,
  total: parkingSlots.length,
};