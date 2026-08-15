import { supabase } from './supabase';
import type { 
  ParkingSlot, Booking, User, EmergencyRequest, 
  SmartNotification, CarServiceConfig, CarServiceRequest, 
  Equipment, MaintenanceRecord, Incident 
} from './store';

// Helper to convert DB snake_case to camelCase
const toCamel = (o: any) => {
  if (o === null || o === undefined) return o;
  if (Array.isArray(o)) return o.map(toCamel);
  if (typeof o !== 'object') return o;
  const n = {};
  for (const [key, value] of Object.entries(o)) {
    const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
    n[camelKey] = toCamel(value);
  }
  return n;
};

// Helper to convert camelCase to DB snake_case
const toSnake = (o: any) => {
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

export const api = {
  async fetchAllData() {
    const [
      { data: users },
      { data: slots },
      { data: bookings },
      { data: incidents },
      { data: availableServices },
      { data: serviceRequests },
      { data: emergencies },
      { data: notifications },
      { data: equipment },
    ] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('parking_slots').select('*'),
      supabase.from('bookings').select('*'),
      supabase.from('incidents').select('*'),
      supabase.from('available_services').select('*'),
      supabase.from('service_requests').select('*'),
      supabase.from('emergency_requests').select('*'),
      supabase.from('notifications').select('*'),
      supabase.from('equipment').select('*'),
    ]);

    return {
      users: (users || []).map(toCamel) as User[],
      slots: (slots || []).map(toCamel) as ParkingSlot[],
      bookings: (bookings || []).map(toCamel) as Booking[],
      incidents: (incidents || []).map(toCamel) as Incident[],
      availableServices: (availableServices || []).map(toCamel) as CarServiceConfig[],
      serviceRequests: (serviceRequests || []).map(toCamel) as CarServiceRequest[],
      emergencyRequests: (emergencies || []).map(toCamel) as EmergencyRequest[],
      notifications: (notifications || []).map(toCamel) as SmartNotification[],
      equipment: (equipment || []).map(toCamel) as Equipment[],
      maintenanceRecords: [], // Not fully mocked yet
    };
  },

  async insert(table: string, data: any) {
    const { data: result, error } = await supabase.from(table).insert(toSnake(data)).select().single();
    if (error) throw error;
    return toCamel(result);
  },

  async update(table: string, id: string, data: any) {
    const { data: result, error } = await supabase.from(table).update(toSnake(data)).eq('id', id).select().single();
    if (error) throw error;
    return toCamel(result);
  },
  
  async updateBy(table: string, column: string, value: string, data: any) {
    const { data: result, error } = await supabase.from(table).update(toSnake(data)).eq(toSnake(column), value).select().single();
    if (error) throw error;
    return toCamel(result);
  },

  async delete(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  async createBookingAtomic(params: any) {
    const { data: result, error } = await supabase.rpc('create_booking_atomic', toSnake(params));
    if (error) throw error;
    return toCamel(result);
  },

  subscribeToAll(callback: (table: string, eventType: string, newRecord: any, oldRecord: any) => void) {
    const channel = supabase.channel('custom-all-channel');
    
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => {
        callback(
          payload.table, 
          payload.eventType, 
          toCamel(payload.new), 
          toCamel(payload.old)
        );
      }
    ).subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Supabase Realtime connected');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`❌ Supabase Realtime disconnected (${status}):`, err);
        // Supabase client auto-reconnects the websocket, but we can re-subscribe if needed
        setTimeout(() => {
          console.log('🔄 Attempting to re-subscribe to channel...');
          channel.subscribe();
        }, 5000);
      }
    });
  }
};
