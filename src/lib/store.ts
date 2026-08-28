import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auth } from "./auth";
import { api } from "./db";

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
  isEV?: boolean;
  chargerType?: string;
  chargingPower?: string;
  chargingPricePerKwh?: number;
  chargerStatus?: "online" | "offline" | "maintenance";
}

export type CarServiceCategory = "Car Wash" | "Interior Cleaning" | "Tire Air Service" | "Oil Check" | "EV Charging" | "Valet Parking";
export type CarServiceStatus = "pending" | "in_progress" | "completed";

export interface CarServiceConfig {
  id: string;
  category: CarServiceCategory;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  vehicleTypes: VehicleType[];
}

export interface CarServiceRequest {
  id: string;
  serviceId: string;
  name: string;
  category: CarServiceCategory;
  price: number;
  durationMinutes: number;
  status: CarServiceStatus;
  bookingId: string;
  assignedStaff?: string;
  completedAt?: string;
  userId?: string;
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
  userId?: string;
  services?: CarServiceRequest[];
  paymentMethod?: "card" | "upi" | "wallet";
  evDetails?: {
    isCharging: boolean;
    batteryLevel: number;
    estimatedTimeRemaining: number;
    chargeStartTime?: string;
    chargeEndTime?: string;
    idleTimeMinutes: number;
    idleFee: number;
  };
}

export interface SavedVehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  model: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  joined: string;
  phone?: string;
  walletBalance: number;
  rewardPoints: number;
  vehicles: SavedVehicle[];
}

export type EmergencyType = "security" | "medical" | "breakdown" | "tow";
export type EmergencyStatus = "pending" | "dispatched" | "resolved" | "rejected";

export interface EmergencyRequest {
  id: string;
  type: EmergencyType;
  userId: string;
  userName: string;
  bookingId: string;
  slotNumber: string;
  floor: number;
  vehicleNumber: string;
  vehicleType: VehicleType;
  status: EmergencyStatus;
  timestamp: string;
  notes?: string;
  assignedStaff?: string;
}

export type EquipmentType = "Sensor" | "Camera" | "Barrier" | "Charger" | "Display";
export type EquipmentStatus = "Healthy" | "Warning" | "Failure" | "Offline";

export interface Equipment {
  id: string;
  type: EquipmentType;
  name: string;
  status: EquipmentStatus;
  location: string;
  installDate: string;
  lastMaintenance: string;
  batteryLevel?: number; // percentage
  healthScore: number; // AI calculated out of 100
  predictedFailureDate?: string;
  uptime: number; // percentage
  errorCount: number;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: "Preventive" | "Repair" | "Inspection";
  technician: string;
  issue: string;
  date: string;
  cost: number;
  status: "Completed" | "In Progress" | "Scheduled";
}

export type NotificationCategory = "Booking" | "Traffic" | "Pricing" | "AI" | "Parking" | "Payment" | "Maintenance" | "Incident";
export type NotificationPriority = "High" | "Medium" | "Low";

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  isRead: boolean;
  isDismissed: boolean;
  timestamp: string;
  actionLabel?: string;
  actionLink?: string;
  actionData?: any;
  userId?: string;
}

export type IncidentSeverity = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "Reported" | "Acknowledged" | "Assigned" | "In Progress" | "Resolved" | "Closed";

export interface Incident {
  id: string;
  category: string;
  title: string;
  description: string;
  photos: string[];
  slotNumber?: string;
  floor?: string;
  zone?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string; // User ID
  createdAt: string;
  updatedAt: string;
  assignedStaff?: string;
  estimatedResolutionTime?: string;
  internalNotes?: string;
}



interface StoreState {
  currentUserId: string | null;
  slots: ParkingSlot[];
  bookings: Booking[];
  users: User[];
  emergencyRequests: EmergencyRequest[];
  notifications: SmartNotification[];
  availableServices: CarServiceConfig[];
  serviceRequests: CarServiceRequest[];
  equipment: Equipment[];
  maintenanceRecords: MaintenanceRecord[];
  incidents: Incident[];
  activeTicketBookingId: string | null;
}

const mockIncidents: Incident[] = [
  {
    id: "INC-1001",
    category: "Broken Parking Sensor",
    title: "Sensor not detecting car",
    description: "The light stays green even though I parked in it.",
    photos: [],
    slotNumber: "A03",
    floor: "1",
    zone: "Block A",
    severity: "Medium",
    status: "Assigned",
    reportedBy: "U-1",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    assignedStaff: "Mike R."
  }
];


const statuses: SlotStatus[] = ["available", "occupied", "reserved", "available", "available"];
const types: VehicleType[] = ["car", "car", "bike", "ev", "suv"];

export const initialSlots: ParkingSlot[] = Array.from({ length: 48 }, (_, i) => {
  const floor = Math.floor(i / 16) + 1;
  const idx = (i % 16) + 1;
  const type = types[i % types.length];
  const isEV = type === "ev";
  const chargerTypes = ["AC Type-2", "DC Fast CCS2", "DC Fast CCS2", "AC Type-2"];
  const powers = ["22kW", "60kW", "120kW", "7kW"];
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
      chargerType: chargerTypes[i % 4],
      chargingPower: powers[i % 4],
      chargingPricePerKwh: 18,
      chargerStatus: Math.random() > 0.8 ? "maintenance" : ("online" as const),
    } : {}),
  };
});

const initialServices: CarServiceConfig[] = [
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

const initialEquipment: Equipment[] = [
  { id: "EQ-SEN-012", type: "Sensor", name: "Slot Sensor A12", status: "Warning", location: "Slot A12", installDate: "2024-01-15T00:00:00Z", lastMaintenance: "2025-11-20T00:00:00Z", batteryLevel: 14, healthScore: 45, predictedFailureDate: new Date(Date.now() + 7 * 86400000).toISOString(), uptime: 99.2, errorCount: 5 },
  { id: "EQ-CAM-003", type: "Camera", name: "ANPR Camera 03 (Exit)", status: "Warning", location: "North Exit", installDate: "2023-06-10T00:00:00Z", lastMaintenance: "2026-02-10T00:00:00Z", healthScore: 60, predictedFailureDate: new Date(Date.now() + 14 * 86400000).toISOString(), uptime: 99.9, errorCount: 12 },
  { id: "EQ-BAR-001", type: "Barrier", name: "Entry Barrier A", status: "Healthy", location: "Main Entry", installDate: "2023-01-05T00:00:00Z", lastMaintenance: "2026-05-01T00:00:00Z", healthScore: 82, predictedFailureDate: new Date(Date.now() + 180 * 86400000).toISOString(), uptime: 99.99, errorCount: 1 },
  { id: "EQ-CHG-005", type: "Charger", name: "EV Fast Charger 05", status: "Failure", location: "Slot A04", installDate: "2025-03-12T00:00:00Z", lastMaintenance: "2026-01-15T00:00:00Z", healthScore: 15, predictedFailureDate: new Date(Date.now() - 1 * 86400000).toISOString(), uptime: 95.5, errorCount: 8 },
  { id: "EQ-DIS-002", type: "Display", name: "Floor 1 Availability Display", status: "Offline", location: "Floor 1 Entrance", installDate: "2024-08-20T00:00:00Z", lastMaintenance: "2025-08-20T00:00:00Z", healthScore: 0, uptime: 92.4, errorCount: 3 },
  { id: "EQ-SEN-015", type: "Sensor", name: "Slot Sensor B05", status: "Healthy", location: "Slot B05", installDate: "2024-01-15T00:00:00Z", lastMaintenance: "2026-06-10T00:00:00Z", batteryLevel: 85, healthScore: 98, predictedFailureDate: new Date(Date.now() + 300 * 86400000).toISOString(), uptime: 99.9, errorCount: 0 },
];

const initialMaintenanceRecords: MaintenanceRecord[] = [
  { id: "MR-1001", equipmentId: "EQ-SEN-012", type: "Inspection", technician: "Raj Patel", issue: "Battery low warning", date: "2026-07-20T10:00:00Z", cost: 0, status: "Completed" },
  { id: "MR-1002", equipmentId: "EQ-CHG-005", type: "Repair", technician: "Amit Kumar", issue: "Connector fault, cooling unit failure", date: "2026-07-26T14:30:00Z", cost: 0, status: "In Progress" },
];

const DEFAULT_STATE: StoreState = {
  currentUserId: null,
  activeTicketBookingId: null,
  slots: initialSlots,
  bookings: [],
  users: [
    {
      id: "U-001",
      name: "Guest User",
      email: "guest@example.com",
      password: "password123",
      phone: "+1 234 567 8900",
      vehicles: [],
      role: "user",
      status: "active",
      joined: new Date().toISOString(),
      walletBalance: 1500,
      rewardPoints: 1250,
      createdAt: new Date().toISOString()
    },
    {
      id: "A-001",
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      phone: "+1 987 654 3210",
      vehicles: [],
      role: "admin",
      status: "active",
      joined: new Date().toISOString(),
      walletBalance: 0,
      rewardPoints: 0,
      createdAt: new Date().toISOString()
    }
  ],
  emergencyRequests: [],
  notifications: [
    {
      id: "NOTIF-MAINT-1",
      title: "Maintenance Recommended",
      message: "Sensor 12 battery is critically low (14%). Failure predicted within 7 days.",
      category: "Maintenance",
      priority: "High",
      isRead: false,
      isDismissed: false,
      timestamp: new Date().toISOString()
    },
    {
      id: "NOTIF-MAINT-2",
      title: "EV Charger Fault",
      message: "EV Fast Charger 05 has reported a critical fault and is currently offline.",
      category: "Maintenance",
      priority: "High",
      isRead: false,
      isDismissed: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  availableServices: initialServices,
  serviceRequests: [],
  equipment: initialEquipment,
  maintenanceRecords: initialMaintenanceRecords,
  incidents: []
};





const INITIAL_STATE = DEFAULT_STATE;

let currentState: StoreState = INITIAL_STATE;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
  listeners.forEach((listener) => listener());
}

function enrichBookingWithEVDetails(booking: any, slots: any[]): any {
  const isEVSlot = slots?.find((s: any) => s.slotNumber === booking.slotNumber)?.isEV;
  
  if ((booking.vehicleType !== "ev" && !isEVSlot) || booking.status !== "active") {
    return booking;
  }
  
  const now = Date.now();
  const startTime = new Date(booking.startTime).getTime();
  const timeElapsedMins = Math.max(0, (now - startTime) / 60000);
  
  // Fast charger: 60 mins to full. Start at ~20%
  const startBattery = 20;
  const rawBattery = startBattery + timeElapsedMins * (80 / 60);
  const batteryLevel = Math.min(100, rawBattery);
  
  // 60 kW charger -> 1 kWh per minute
  const energyConsumed = timeElapsedMins * 1;
  const estimatedTimeRemaining = Math.max(0, 60 - timeElapsedMins);
  
  const isCharging = batteryLevel < 100;
  const idleTimeMinutes = Math.max(0, timeElapsedMins - 60);
  const idleFee = idleTimeMinutes > 15 ? Math.floor(idleTimeMinutes - 15) * 5 : 0; // ₹5 per minute after 15 mins grace period

  return {
    ...booking,
    evDetails: {
      isCharging,
      batteryLevel,
      estimatedTimeRemaining: Math.floor(estimatedTimeRemaining),
      idleTimeMinutes: Math.floor(idleTimeMinutes),
      idleFee,
      chargeStartTime: booking.startTime,
      energyConsumed
    }
  };
}

let isSupabaseInitialized = false;

export const store = {
  getState: () => currentState,
  setState: (newState: Partial<StoreState>) => {
    currentState = { ...currentState, ...newState };
    emitChange();
  },
  openTicket: (id: string) => store.setState({ activeTicketBookingId: id }),
  closeTicket: () => store.setState({ activeTicketBookingId: null }),
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  refreshData: async () => {
    try {
      const data = await api.fetchAllData();
      
      const parsed = { ...DEFAULT_STATE };
      // Preserve current user ID
      parsed.currentUserId = store.getState().currentUserId;
      
      if (data.users && data.users.length > 0) {
        const currentUsers = store.getState().users;
        parsed.users = data.users.map((dbUser: any) => {
           const existing = currentUsers.find((u: any) => u.id === dbUser.id);
           if (!existing) return dbUser;
           
           // Always trust local state for these fields because Supabase RLS often blocks UPDATEs to them
           // causing the DB to return stale data (0) and wipe out our optimistic UI updates.
           return {
             ...dbUser,
             walletBalance: existing.walletBalance !== undefined ? existing.walletBalance : dbUser.walletBalance,
             rewardPoints: existing.rewardPoints !== undefined ? existing.rewardPoints : dbUser.rewardPoints,
             vehicles: existing.vehicles && existing.vehicles.length > 0 ? existing.vehicles : dbUser.vehicles
           };
        });
      }
      if (data.slots && data.slots.length > 0) parsed.slots = data.slots;
      if (data.bookings && data.bookings.length > 0) parsed.bookings = data.bookings.map(b => enrichBookingWithEVDetails(b, parsed.slots || []));
      if (data.incidents && data.incidents.length > 0) parsed.incidents = data.incidents;
      if (data.availableServices && data.availableServices.length > 0) parsed.availableServices = data.availableServices;
      if (data.serviceRequests && data.serviceRequests.length > 0) parsed.serviceRequests = data.serviceRequests;
      if (data.emergencyRequests && data.emergencyRequests.length > 0) parsed.emergencyRequests = data.emergencyRequests;
      if (data.notifications && data.notifications.length > 0) parsed.notifications = data.notifications;
      if (data.equipment && data.equipment.length > 0) parsed.equipment = data.equipment;
      
      store.setState(parsed);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  },
  
  initializeSupabase: async () => {
    if (isSupabaseInitialized) return;
    isSupabaseInitialized = true;
    
    await store.refreshData();

    // Add polling fallback every 10 seconds to ensure data stays perfectly synchronized across Admin and User pages
    // even if Supabase Realtime (postgres_changes) is not manually enabled in the Supabase Dashboard.
    setInterval(() => {
      store.refreshData();
    }, 10000);

    // Setup Real-time subscriptions
      if (api.subscribeToAll) {
        api.subscribeToAll((table: string, eventType: string, newRecord: any, oldRecord: any) => {
          const state = store.getState() as any;
          const tableToKey: Record<string, string> = {
            'users': 'users',
            'parking_slots': 'slots',
            'bookings': 'bookings',
            'incidents': 'incidents',
            'available_services': 'availableServices',
            'service_requests': 'serviceRequests',
            'emergency_requests': 'emergencyRequests',
            'notifications': 'notifications',
            'equipment': 'equipment',
            'maintenance_records': 'maintenanceRecords'
          };
          
          const stateKey = tableToKey[table];
          if (!stateKey) return;
          
          const list = [...(state[stateKey] || [])];
          
          if (eventType === 'INSERT') {
            const exists = list.find((item: any) => item.id === newRecord.id);
            if (!exists) {
              const itemToAdd = table === 'bookings' ? enrichBookingWithEVDetails(newRecord, state.slots || []) : newRecord;
              store.setState({ [stateKey]: [itemToAdd, ...list] });
              
              if (table === 'notifications' && !newRecord.id.startsWith("NOTIF-TEMP")) {
                 const currentUser = state.users?.find((u: any) => u.id === state.currentUserId);
                 const isAdmin = currentUser?.role === 'admin';
                 
                 const isForMe = !newRecord.userId || newRecord.userId === state.currentUserId || (isAdmin && newRecord.userId === 'admin');
                 
                 if (isForMe) {
                   toast(newRecord.title, {
                     description: newRecord.message,
                   });
                 }
              }
            }
          } else if (eventType === 'UPDATE') {
            const index = list.findIndex((item: any) => item.id === newRecord.id);
            if (index !== -1) {
              const itemToUpdate = table === 'bookings' ? enrichBookingWithEVDetails(newRecord, state.slots || []) : newRecord;
              list[index] = { ...list[index], ...itemToUpdate };
            } else {
              list.push(newRecord);
            }
          } else if (eventType === 'DELETE') {
            const index = list.findIndex((item: any) => item.id === oldRecord.id);
            if (index !== -1) list.splice(index, 1);
          }
          
          store.setState({ [stateKey]: list });
        }, () => {
          // Instant Broadcast Sync Handler
          store.refreshData();
        });
      }
      
      // Start EV simulation loop
      store.startEVSimulation();
  },

  startEVSimulation: () => {
    // Run every 5 seconds to simulate EV charging and idle fees
    setInterval(() => {
      const state = store.getState();
      const currentUserId = state.currentUserId;
      if (!currentUserId) return;
      
      const activeBookings = state.bookings.filter(b => b.status === "active" && b.evDetails);
      
      activeBookings.forEach(booking => {
        if (!booking.evDetails) return;
        
        const details = { ...booking.evDetails };
        
        if (details.isCharging && details.batteryLevel < 100) {
          // Simulate charging: +2% every 5 seconds for demo
          details.batteryLevel = Math.min(100, details.batteryLevel + 2);
          details.estimatedTimeRemaining = Math.max(0, (100 - details.batteryLevel) * 2); // 2 mins per percent
          
          if (details.batteryLevel === 100) {
            details.isCharging = false;
            details.chargeEndTime = new Date().toISOString();
            
            // Notify user
            if (booking.userId === currentUserId) {
              store.getState().addNotification({
                title: "EV Fully Charged ⚡",
                message: `Your vehicle at slot ${booking.slotNumber} is fully charged. Please move it to avoid idle fees.`,
                category: "Parking",
                priority: "High"
              });
            }
          }
        } else if (details.batteryLevel === 100 && !details.isCharging) {
          // Accumulate idle time (1 simulated minute per 5 real seconds)
          details.idleTimeMinutes += 1;
          // ₹5 per idle minute
          details.idleFee = details.idleTimeMinutes * 5;
        }
        
        store.updateBooking(booking.id, { evDetails: details });
      });
    }, 5000);
  },

  // Actions
  addSlot: (slot: ParkingSlot) => {
    api.insert("parking_slots", slot);
    store.setState({ slots: [...currentState.slots, slot] });
    
  },
  updateSlot: (id: string, updates: Partial<ParkingSlot>) => {
    api.update("parking_slots", id, updates);
    store.setState({
      slots: currentState.slots.map(s => s.id === id ? { ...s, ...updates } : s)
    });
    
  },
  updateSlotByNumber: (slotNumber: string, updates: Partial<ParkingSlot>) => {
    store.setState({
      slots: currentState.slots.map(s => s.slotNumber === slotNumber ? { ...s, ...updates } : s)
    });
    
  },
  deleteSlot: (id: string) => {
    api.delete("parking_slots", id);
    store.setState({
      slots: currentState.slots.filter(s => s.id !== id)
    });
    
  },
  addBooking: async (booking: Booking) => {
    // 1. Snapshot previous state for rollback
    const prevBookings = currentState.bookings;
    const prevSlots = currentState.slots;
    const prevServices = currentState.serviceRequests;
    
    // 2. Optimistic Update
    const enrichedBooking = enrichBookingWithEVDetails(booking, currentState.slots || []);
    store.setState({ bookings: [enrichedBooking, ...currentState.bookings] });
    const status = booking.status === "active" ? "occupied" : "reserved";
    store.updateSlotByNumber(booking.slotNumber, { status });
    if (booking.services && booking.services.length > 0) {
      store.setState({ serviceRequests: [...booking.services, ...currentState.serviceRequests] });
    }

    // 3. API Call
    try {
      // Find slot ID from slotNumber
      const slotId = currentState.slots.find(s => s.slotNumber === booking.slotNumber)?.id;
      if (!slotId) throw new Error("Slot not found");

      const dbBooking = await api.createBookingAtomic({
        p_user_id: booking.userId,
        p_slot_id: slotId,
        p_vehicle_number: booking.vehicleNumber,
        p_vehicle_type: booking.vehicleType,
        p_start_time: booking.startTime,
        p_end_time: booking.endTime,
        p_amount: booking.amount,
        p_payment_method: booking.paymentMethod || 'card'
      });

      // Explicitly update the slot status in the database to ensure it persists
      await api.update("parking_slots", slotId, { status });

      // Also insert services if any (not part of atomic booking RPC for now)
      if (booking.services) {
        for (const srv of booking.services) {
          await api.insert("service_requests", {
            ...srv,
            bookingId: dbBooking.id,
            userId: booking.userId
          });
        }
      }
    } catch (error) {
      console.error("Booking failed, rolling back:", error);
      // Rollback on failure
      store.setState({ bookings: prevBookings, slots: prevSlots, serviceRequests: prevServices });
      throw error;
    }
  },
  updateBooking: async (id: string, updates: Partial<Booking>) => {
    const prevBookings = currentState.bookings;
    const prevSlots = currentState.slots;
    
    const oldBooking = currentState.bookings.find(b => b.id === id);
    
    // Optimistic Update
    store.setState({
      bookings: currentState.bookings.map(b => b.id === id ? { ...b, ...updates } : b)
    });
    
    if (oldBooking && updates.status) {
      if (updates.status === "completed" || updates.status === "cancelled") {
        store.updateSlotByNumber(oldBooking.slotNumber, { status: "available" });
      } else if (updates.status === "active") {
        store.updateSlotByNumber(oldBooking.slotNumber, { status: "occupied" });
      }
    }

    try {
      await api.update("bookings", id, updates);
      
      // If status changed to completed/cancelled, update the slot status in DB too
      if (oldBooking && updates.status && (updates.status === "completed" || updates.status === "cancelled")) {
         const slotId = currentState.slots.find(s => s.slotNumber === oldBooking.slotNumber)?.id;
         if (slotId) {
            await api.update("parking_slots", slotId, { status: "available" });
         }
      } else if (oldBooking && updates.status === "active") {
         const slotId = currentState.slots.find(s => s.slotNumber === oldBooking.slotNumber)?.id;
         if (slotId) {
            await api.update("parking_slots", slotId, { status: "occupied" });
         }
      }
    } catch (error) {
      console.error("Failed to update booking, rolling back:", error);
      store.setState({ bookings: prevBookings, slots: prevSlots });
      throw error;
    }
  },
  addUser: (user: User) => {
    // Strip password before inserting into the database since it's not in the schema
    const { password, ...dbUser } = user;
    api.insert("users", dbUser);
    store.setState({ users: [...currentState.users, user] });
  },
  deleteUser: (id: string) => {
    store.setState({
      users: currentState.users.filter(u => u.id !== id)
    });
  },
  updateUser: (id: string, updates: Partial<User>) => {
    api.update("users", id, updates).catch(err => {
      console.warn("Could not sync user to DB (might be Guest/Admin or RLS):", err.message || err);
    });
    store.setState({
      users: currentState.users.map(u => u.id === id ? { ...u, ...updates } : u)
    });
  },
  addVehicle: (userId: string, vehicle: SavedVehicle) => {
    const updatedUsers = currentState.users.map(u => {
      if (u.id !== userId) return u;
      
      // If this is the first vehicle, make it default automatically
      const newVehicle = { ...vehicle, isDefault: u.vehicles.length === 0 ? true : vehicle.isDefault };
      const updatedVehicles = [...u.vehicles, newVehicle];
      
      
      return { ...u, vehicles: updatedVehicles };
    });
    store.setState({ users: updatedUsers });
  },
  removeVehicle: (userId: string, vehicleId: string) => {
    const updatedUsers = currentState.users.map(u => {
      if (u.id !== userId) return u;
      
      let updatedVehicles = u.vehicles.filter(v => v.id !== vehicleId);
      // If we removed the default, make the first remaining one default
      if (u.vehicles.find(v => v.id === vehicleId)?.isDefault && updatedVehicles.length > 0) {
        updatedVehicles[0].isDefault = true;
      }

      
      return { ...u, vehicles: updatedVehicles };
    });
    store.setState({ users: updatedUsers });
  },
  setDefaultVehicle: (userId: string, vehicleId: string) => {
    const updatedUsers = currentState.users.map(u => {
      if (u.id !== userId) return u;
      
      const updatedVehicles = u.vehicles.map(v => ({
        ...v,
        isDefault: v.id === vehicleId
      }));

      
      return { ...u, vehicles: updatedVehicles };
    });
    store.setState({ users: updatedUsers });
  },
  addFunds: (userId: string, amount: number) => {
    const user = currentState.users.find(u => u.id === userId);
    if (user) store.updateUser(userId, { walletBalance: user.walletBalance + amount });
  },
  deductFunds: (userId: string, amount: number) => {
    const user = currentState.users.find(u => u.id === userId);
    if (user) store.updateUser(userId, { walletBalance: Math.max(0, user.walletBalance - amount) });
  },
  addRewardPoints: (userId: string, points: number) => {
    const user = currentState.users.find(u => u.id === userId);
    if (user) store.updateUser(userId, { rewardPoints: (user.rewardPoints || 0) + points });
  },
  redeemRewardPoints: (userId: string, pointsToRedeem: number, cashValue: number) => {
    const user = currentState.users.find(u => u.id === userId);
    if (!user || user.rewardPoints < pointsToRedeem) return false;
    
    store.updateUser(userId, { 
      rewardPoints: user.rewardPoints - pointsToRedeem,
      walletBalance: user.walletBalance + cashValue
    });
    return true;
  },
  createEmergencyRequest: async (request: Omit<EmergencyRequest, "id" | "timestamp">) => {
    // Optimistic update
    const tempId = crypto.randomUUID();
    const tempRequest = { ...request, id: tempId, timestamp: new Date().toISOString() } as EmergencyRequest;
    store.setState({ emergencyRequests: [tempRequest, ...currentState.emergencyRequests] });
    
    try {
      // Actually insert into the database
      api.insert("emergency_requests", tempRequest);
        // Notify the user that their request was received
        store.getState().addNotification({
          userId: request.userId,
          title: "Emergency Request Received",
          message: `Your ${request.type} assistance request has been received. Our team is on the way.`,
          category: "Incident",
          priority: "High"
        });
        
        // Notify admins
        store.getState().addNotification({
          userId: "admin",
          title: `New SOS: ${request.type.toUpperCase()}`,
          message: `${request.userName} needs ${request.type} assistance at Slot ${request.slotNumber}.`,
          category: "Incident",
          priority: "High"
        });
    } catch (error) {
      console.error("Failed to create emergency request:", error);
    }
  },
  updateEmergencyRequestStatus: async (id: string, updates: Partial<EmergencyRequest>) => {
    // Get the existing request to know the userId
    const existingReq = store.getState().emergencyRequests.find(r => r.id === id);
    
    // Optimistic update
    store.setState({
      emergencyRequests: currentState.emergencyRequests.map(r => r.id === id ? { ...r, ...updates } : r)
    });
    
    api.update("emergency_requests", id, updates);
    
    try {
      if (!id.startsWith("SOS-TEMP")) {
        // Local only, no DB operation needed
        // Notify the user of status changes
        if (existingReq && existingReq.userId) {
          if (updates.status === "dispatched") {
            let msg = `Help is on the way to Slot ${existingReq.slotNumber}.`;
            if (existingReq.type === "security") msg = "Security team is on the way.";
            if (existingReq.type === "medical") msg = "Medical team dispatched.";
            if (existingReq.type === "tow") msg = "Tow truck assigned.";
            if (existingReq.type === "breakdown") msg = "Vehicle assistance is arriving.";
            
            store.getState().addNotification({
              userId: existingReq.userId,
              title: "Help is arriving",
              message: msg,
              category: "System",
              priority: "High"
            });
          } else if (updates.status === "resolved") {
            store.getState().addNotification({
              userId: existingReq.userId,
              title: "Request Completed",
              message: `Your ${existingReq.type} assistance request has been marked as resolved.`,
              category: "System",
              priority: "Low"
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to update emergency request:", error);
    }
  },
  addNotification: async (notification: Omit<SmartNotification, "id" | "isRead" | "isDismissed" | "timestamp">) => {
    const tempId = `NOTIF-TEMP-${Date.now()}`;
    const newNotification: SmartNotification = {
      ...notification,
      id: tempId,
      isRead: false,
      isDismissed: false,
      timestamp: new Date().toISOString(),
    };
    store.setState({ notifications: [newNotification, ...currentState.notifications] });
    
    try {
      // Remove temp ID for real insert
      const { id, ...dbNotif } = newNotification;
      const result = await api.insert("notifications", dbNotif);
      
      // Replace temp with real ID (if not already handled by realtime subscription)
      store.setState({
        notifications: store.getState().notifications.map(n => n.id === tempId ? result : n)
      });
    } catch (e) {
      console.error("Failed to save notification", e);
    }
  },
  markNotificationAsRead: (id: string) => {
    store.setState({
      notifications: currentState.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
    });
    if (!id.startsWith("NOTIF-TEMP")) {
      api.update("notifications", id, { isRead: true });
    }
  },
  
  // Maintenance Actions
  updateEquipment: (id: string, updates: Partial<Equipment>) => {
    api.update("equipment", id, updates);
    store.setState({
      equipment: currentState.equipment.map(e => e.id === id ? { ...e, ...updates } : e)
    });
  },
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, "id">) => {
    const newRecord = { ...record, id: `MR-${Date.now()}` };
    api.insert("maintenance_records", newRecord);
    store.setState({ maintenanceRecords: [...currentState.maintenanceRecords, newRecord] });
  },
  dismissNotification: (id: string) => {
    store.setState({
      notifications: currentState.notifications.map(n => n.id === id ? { ...n, isDismissed: true } : n)
    });
    if (!id.startsWith("NOTIF-TEMP")) {
      api.update("notifications", id, { isDismissed: true });
    }
  },
  
  markAllNotificationsAsRead: () => {
    store.setState({
      notifications: currentState.notifications.map(n => ({ ...n, isRead: true }))
    });
    // Note: Batch update might be needed in a real API implementation
  },
  
  // Incident Actions
  reportIncident: (incident: Omit<Incident, "id" | "createdAt" | "updatedAt" | "status">) => {
    const id = `INC-${Math.floor(Math.random() * 9000) + 1000}`;
    const newIncident: Incident = {
      ...incident,
      id,
      status: "Reported",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    api.insert("incidents", newIncident);
    // Add incident
    store.setState({
      incidents: [newIncident, ...currentState.incidents]
    });

    // Notify admins
    store.getState().addNotification({
      userId: "admin",
      title: "New Incident Reported",
      message: `${incident.severity} priority: ${incident.title} (${incident.category})`,
      category: "Incident",
      priority: incident.severity === "Critical" || incident.severity === "High" ? "High" : "Medium",
    });
    
    return id;
  },
  
  updateIncidentStatus: (id: string, updates: Partial<Incident>) => {
    api.update("incidents", id, updates);
    const inc = currentState.incidents.find(i => i.id === id);
    if (!inc) return;

    const newStatus = updates.status || inc.status;
    const statusChanged = inc.status !== newStatus;
    
    store.setState({
      incidents: currentState.incidents.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i)
    });
    
    if (statusChanged && newStatus !== "Reported") {
      // Notify user
      store.addNotification({
        title: `Incident Update: ${inc.title}`,
        message: `Your incident status has been updated to ${newStatus}.`,
        category: "Incident",
        priority: "Low",
        userId: inc.reportedBy
      });
    }
  },
  
  // Car Services Actions
  requestCarServices: (requests: CarServiceRequest[]) => {
    store.setState({ serviceRequests: [...requests, ...currentState.serviceRequests] });
  },
  updateCarServiceStatus: (id: string, status: CarServiceStatus, staff?: string) => {
    const service = currentState.serviceRequests.find(s => s.id === id);
    const updates = {
      status,
      ...(staff ? { assignedStaff: staff } : {}),
      ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {})
    };
    
    // Optimistic UI update
    store.setState({
      serviceRequests: currentState.serviceRequests.map(s => {
        if (s.id === id) {
          return { ...s, ...updates };
        }
        return s;
      })
    });
    
    // Persist to database
    if (!id.startsWith("TEMP-")) {
      api.update("service_requests", id, updates).catch(err => {
        console.error("Failed to update service request status:", err);
      });
    }

    if (!service) return;

    let title = "";
    let message = "";
    if (status === "in_progress") {
      title = `${service.name} Started`;
      message = `Your ${service.category.toLowerCase()} is now in progress.`;
    } else if (status === "completed") {
      title = `${service.name} Completed`;
      message = `Your ${service.category.toLowerCase()} has been successfully completed.`;
    }
    if (title) {
      const nId = `N-${Date.now()}-SRV-${id}`;
      store.setState({
        notifications: [
          {
            id: nId,
            title, message, category: "AI", priority: "Medium",
            isRead: false, isDismissed: false, timestamp: new Date().toISOString(),
          },
          ...currentState.notifications
        ]
      });
    }
  },

  generateSmartNotifications: () => {
    const { slots, bookings, notifications } = currentState;
    const exists = (title: string) => notifications.some(n => n.title === title && !n.isDismissed);

    const occupied = slots.filter(s => s.status !== "available").length;
    const occupancyRate = occupied / (slots.length || 1);

    if (occupancyRate > 0.85 && !exists("Facility Filling Up")) {
      const id = `N-${Date.now()}-1`;
      store.setState({
        notifications: [
          {
            id, title: "Facility Filling Up",
            message: `Parking is ${Math.round(occupancyRate * 100)}% full. Only ${slots.length - occupied} slots remaining.`,
            category: "Parking", priority: "Medium", isRead: false, isDismissed: false, timestamp: new Date().toISOString()
          },
          ...currentState.notifications
        ]
      });
    }

    if (occupancyRate > 0.95 && !exists("Alternative Parking Available")) {
       const id = `N-${Date.now()}-alt`;
       store.setState({
         notifications: [
           {
             id, title: "Alternative Parking Available",
             message: "Selected location is nearly full. SmartPark Annex is 2 mins away with 50+ slots.",
             category: "Pricing", priority: "Medium", isRead: false, isDismissed: false, timestamp: new Date().toISOString(), actionLabel: "Reserve Now"
           },
           ...currentState.notifications
         ]
       });
    }

    const activeBooking = bookings.find(b => b.status === "active");
    if (activeBooking && !exists("Heavy Traffic Detected")) {
        const id = `N-${Date.now()}-4`;
        store.setState({
          notifications: [
            {
              id, title: "Heavy Traffic Detected",
              message: "Expect a 12-minute delay on your route. Alternate route suggested via Main St.",
              category: "Traffic", priority: "Medium", isRead: false, isDismissed: false, timestamp: new Date().toISOString(), actionLabel: "Navigate"
            },
            ...currentState.notifications
          ]
        });
    }

    const reservedBooking = bookings.find(b => b.status === "upcoming");
    if (reservedBooking && !exists("Reserved Slot Ready")) {
       const id = `N-${Date.now()}-5`;
       store.setState({
         notifications: [
           {
             id, title: "Reserved Slot Ready",
             message: `Your slot ${reservedBooking.slotNumber} on Floor ${reservedBooking.floor} is ready for you.`,
             category: "Booking", priority: "High", isRead: false, isDismissed: false, timestamp: new Date().toISOString(), actionLabel: "View Ticket", actionData: reservedBooking.id
           },
           ...currentState.notifications
         ]
       });
    }
  },
  resetData: () => {
    store.setState(DEFAULT_STATE);
  }
};

export function useStore() {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    // Sync with Supabase on mount
    store.initializeSupabase();
    
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, []);

  return state;
}

export function useStats() {
  const { slots } = useStore();
  return {
    available: slots.filter((s) => s.status === "available").length,
    occupied: slots.filter((s) => s.status === "occupied").length,
    reserved: slots.filter((s) => s.status === "reserved").length,
    total: slots.length,
  };
}

export function useDashboardStats() {
  const { slots, bookings } = useStore();

  const typeCounts = { car: 0, suv: 0, ev: 0, bike: 0 };
  slots.forEach((s) => {
    if (typeCounts[s.type] !== undefined) typeCounts[s.type]++;
  });
  const totalSlots = slots.length || 1; 
  const vehicleMix = [
    { name: "Cars", value: Math.round((typeCounts.car / totalSlots) * 100), color: "var(--primary)" },
    { name: "SUVs", value: Math.round((typeCounts.suv / totalSlots) * 100), color: "var(--secondary)" },
    { name: "EVs", value: Math.round((typeCounts.ev / totalSlots) * 100), color: "var(--success)" },
    { name: "Bikes", value: Math.round((typeCounts.bike / totalSlots) * 100), color: "var(--warning)" },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  
  const revenueSeries = Array.from({ length: Math.max(7, currentMonthIndex + 1) }, (_, i) => ({
    m: months[i] || `M${i+1}`,
    revenue: 0,
    bookings: 0
  }));

  bookings.forEach(b => {
    const d = new Date(b.startTime);
    const mIdx = d.getMonth();
    if (mIdx < revenueSeries.length) {
      revenueSeries[mIdx].revenue += b.amount;
      revenueSeries[mIdx].bookings += 1;
    }
  });

  const occupancySeries = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(i * 2).toString().padStart(2, "0")}:00`,
    occupied: 0,
    reserved: 0
  }));
  
  const today = new Date().toDateString();
  bookings.forEach(b => {
     if (new Date(b.startTime).toDateString() === today) {
         const hour = new Date(b.startTime).getHours();
         const block = Math.floor(hour / 2);
         if (block >= 0 && block < 12) {
            if (b.status === "active") occupancySeries[block].occupied++;
            if (b.status === "upcoming") occupancySeries[block].reserved++;
         }
     }
  });

  const mtdRevenue = revenueSeries[currentMonthIndex]?.revenue || 0;
  const totalBookings = bookings.length;
  
  let evChargingRevenue = 0;
  let energyDelivered = 0;
  let chargingSessions = 0;
  bookings.forEach(b => {
      const s = slots.find(x => x.slotNumber === b.slotNumber);
      if (s?.isEV && b.vehicleType === 'ev') {
          chargingSessions++;
          energyDelivered += 20; 
          evChargingRevenue += 20 * (s.chargingPricePerKwh || 18);
      }
  });

  return {
    vehicleMix,
    revenueSeries,
    occupancySeries,
    mtdRevenue,
    totalBookings,
    evChargingRevenue,
    energyDelivered,
    chargingSessions
  };
}
