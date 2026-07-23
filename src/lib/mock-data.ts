// Mock data for the SmartPark AI mobile app.
export type SlotStatus = "available" | "occupied" | "reserved";
export type VehicleType = "car" | "bike" | "ev" | "suv";

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  etaMin: number;
  pricePerHour: number;
  rating: number;
  available: number;
  total: number;
  covered: boolean;
  ev: boolean;
  cctv: boolean;
  hero: string;
  lat: number;
  lng: number;
  amenities: string[];
  aiScore: number;
}

export const lots: ParkingLot[] = [
  { id: "lot-1", name: "Phoenix MarketCity", address: "LBS Rd, Kurla West", distanceKm: 0.8, etaMin: 4, pricePerHour: 60, rating: 4.8, available: 42, total: 220, covered: true, ev: true, cctv: true, hero: "🏬", lat: 19.086, lng: 72.888, amenities: ["Covered", "EV Charge", "CCTV", "Valet"], aiScore: 96 },
  { id: "lot-2", name: "Metro Junction Deck", address: "Andheri East, Metro Ln", distanceKm: 1.6, etaMin: 7, pricePerHour: 40, rating: 4.5, available: 12, total: 180, covered: true, ev: false, cctv: true, hero: "🚉", lat: 19.114, lng: 72.847, amenities: ["Covered", "CCTV", "24/7"], aiScore: 84 },
  { id: "lot-3", name: "R-City Central", address: "Ghatkopar West", distanceKm: 2.3, etaMin: 9, pricePerHour: 50, rating: 4.6, available: 88, total: 300, covered: true, ev: true, cctv: true, hero: "🛍️", lat: 19.101, lng: 72.916, amenities: ["Covered", "EV Charge", "CCTV"], aiScore: 91 },
  { id: "lot-4", name: "Bandra Sea View", address: "Bandra West Promenade", distanceKm: 3.1, etaMin: 12, pricePerHour: 80, rating: 4.9, available: 6, total: 60, covered: false, ev: true, cctv: true, hero: "🌊", lat: 19.055, lng: 72.822, amenities: ["Open", "EV Charge", "Sea view"], aiScore: 78 },
  { id: "lot-5", name: "Downtown Public", address: "Fort, MG Road", distanceKm: 4.4, etaMin: 16, pricePerHour: 30, rating: 4.2, available: 130, total: 500, covered: false, ev: false, cctv: true, hero: "🏛️", lat: 18.933, lng: 72.833, amenities: ["Open", "CCTV", "Budget"], aiScore: 72 },
];

export type BookingStatus = "active" | "upcoming" | "completed" | "cancelled";

export interface Booking {
  id: string;
  lotId: string;
  lotName: string;
  slot: string;
  floor: string;
  vehicle: string;
  vehicleType: VehicleType;
  start: string;
  end: string;
  hours: number;
  amount: number;
  status: BookingStatus;
  paid: boolean;
  qr: string;
}

export const bookings: Booking[] = [
  { id: "SP-24081", lotId: "lot-1", lotName: "Phoenix MarketCity", slot: "B14", floor: "B2", vehicle: "MH12 AB 4521", vehicleType: "car", start: "2026-07-23T14:00", end: "2026-07-23T17:00", hours: 3, amount: 180, status: "active", paid: true, qr: "SP-24081-B14" },
  { id: "SP-24072", lotId: "lot-3", lotName: "R-City Central", slot: "A07", floor: "A1", vehicle: "MH12 AB 4521", vehicleType: "car", start: "2026-07-25T09:30", end: "2026-07-25T12:30", hours: 3, amount: 150, status: "upcoming", paid: true, qr: "SP-24072-A07" },
  { id: "SP-23991", lotId: "lot-2", lotName: "Metro Junction Deck", slot: "C22", floor: "C3", vehicle: "MH12 AB 4521", vehicleType: "car", start: "2026-07-19T18:00", end: "2026-07-19T21:00", hours: 3, amount: 120, status: "completed", paid: true, qr: "SP-23991-C22" },
  { id: "SP-23880", lotId: "lot-4", lotName: "Bandra Sea View", slot: "P02", floor: "GF", vehicle: "MH12 AB 4521", vehicleType: "car", start: "2026-07-14T11:00", end: "2026-07-14T13:00", hours: 2, amount: 160, status: "completed", paid: true, qr: "SP-23880-P02" },
  { id: "SP-23770", lotId: "lot-5", lotName: "Downtown Public", slot: "D12", floor: "GF", vehicle: "MH12 AB 4521", vehicleType: "car", start: "2026-07-08T10:00", end: "2026-07-08T12:00", hours: 2, amount: 60, status: "cancelled", paid: false, qr: "SP-23770-D12" },
];

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "success" | "warning";
  unread: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n1", title: "Booking confirmed", body: "Slot B14 at Phoenix MarketCity is yours until 5:00 PM.", time: "2m ago", tone: "success", unread: true },
  { id: "n2", title: "Ends in 20 minutes", body: "Extend to avoid overstay charges of ₹90/hr.", time: "18m ago", tone: "warning", unread: true },
  { id: "n3", title: "AI tip", body: "R-City Central is 40% cheaper right now and 3 min further.", time: "1h ago", tone: "info", unread: false },
  { id: "n4", title: "Payment received", body: "₹180 charged to Visa •• 4242 for SP-24081.", time: "3h ago", tone: "success", unread: false },
  { id: "n5", title: "Weekend offer", body: "Flat 20% off all EV bays this Saturday.", time: "Yesterday", tone: "info", unread: false },
];

export const usage7d = [
  { d: "Mon", hrs: 2 }, { d: "Tue", hrs: 3.5 }, { d: "Wed", hrs: 1.5 },
  { d: "Thu", hrs: 4 }, { d: "Fri", hrs: 2 }, { d: "Sat", hrs: 5 }, { d: "Sun", hrs: 3 },
];

export const user = {
  name: "Aarav Sharma",
  email: "aarav@smartpark.ai",
  phone: "+91 98200 12345",
  memberSince: "March 2025",
  tier: "Gold",
  wallet: 1240,
  vehicles: [
    { plate: "MH12 AB 4521", model: "Hyundai Creta", type: "SUV" as const, primary: true },
    { plate: "MH14 KL 8899", model: "Ather 450X", type: "Bike" as const, primary: false },
  ],
  cards: [
    { id: "c1", brand: "Visa", last4: "4242", primary: true },
    { id: "c2", brand: "Mastercard", last4: "5566", primary: false },
  ],
};

export function lot(id: string) {
  return lots.find((l) => l.id === id) ?? lots[0];
}
