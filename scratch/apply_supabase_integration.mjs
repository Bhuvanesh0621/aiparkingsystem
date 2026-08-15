import fs from 'fs';

let content = fs.readFileSync('src/lib/store.ts', 'utf8');

if (!content.includes('import { api }')) {
  content = content.replace("import { create } from", "import { api } from './db';\\nimport { create } from");
}

function insertApiCall(methodName, apiCall) {
  const regex = new RegExp(methodName + '\\\\s*:\\s*\\\\([^{]+\\\\{\\n');
  content = content.replace(regex, (match) => {
    return match + '    ' + apiCall + '\\n';
  });
}

// Re-inject the calls. I will use string replace so I don't have to deal with complex regexes.

content = content.replace(/addSlot: \\(slot: ParkingSlot\\) => \\{/g, 'addSlot: (slot: ParkingSlot) => {\\n    api.insert("parking_slots", slot);');
content = content.replace(/updateSlot: \\(id: string, updates: Partial<ParkingSlot>\\) => \\{/g, 'updateSlot: (id: string, updates: Partial<ParkingSlot>) => {\\n    api.update("parking_slots", id, updates);');
content = content.replace(/updateSlotByNumber: \\(slotNumber: string, updates: Partial<ParkingSlot>\\) => \\{/g, 'updateSlotByNumber: (slotNumber: string, updates: Partial<ParkingSlot>) => {\\n    api.updateBy("parking_slots", "slot_number", slotNumber, updates);');
content = content.replace(/deleteSlot: \\(id: string\\) => \\{/g, 'deleteSlot: (id: string) => {\\n    api.delete("parking_slots", id);');

content = content.replace(/addBooking: \\(booking: Booking\\) => \\{/g, 'addBooking: (booking: Booking) => {\\n    api.insert("bookings", booking);');
content = content.replace(/updateBooking: \\(id: string, updates: Partial<Booking>\\) => \\{/g, 'updateBooking: (id: string, updates: Partial<Booking>) => {\\n    api.update("bookings", id, updates);');

// fix addBooking service mapping
content = content.replace(
  'store.setState({ serviceRequests: [...booking.services, ...currentState.serviceRequests] });\\n    }',
  'store.setState({ serviceRequests: [...booking.services, ...currentState.serviceRequests] });\\n      booking.services.forEach(s => api.insert("service_requests", s));\\n    }'
);

content = content.replace(/addUser: \\(user: User\\) => \\{/g, 'addUser: (user: User) => {\\n    api.insert("users", user);');
content = content.replace(/updateUser: \\(id: string, updates: Partial<User>\\) => \\{/g, 'updateUser: (id: string, updates: Partial<User>) => {\\n    api.update("users", id, updates);');

// Emergency requests
const emergencyCreateOld = 'try {\\n      // For local memory, we just keep the temp request.\\n      \\n      // Notify the user that their request was received';
const emergencyCreateNew = 'try {\\n      const savedRequest = await api.insert("emergency_requests", tempRequest);\\n      if (savedRequest) {\\n        const { emergencyRequests } = store.getState();\\n        store.setState({\\n          emergencyRequests: emergencyRequests.map(r => r.id === tempId ? savedRequest : r)\\n        });\\n      }\\n      // Notify the user that their request was received';
content = content.replace(emergencyCreateOld, emergencyCreateNew);

const emergencyUpdateOld = 'try {\\n      if (!id.startsWith("SOS-TEMP")) {\\n        // Local only, no DB operation needed\\n        // Notify the user of status changes';
const emergencyUpdateNew = 'try {\\n      if (!id.startsWith("SOS-TEMP")) {\\n        await api.update("emergency_requests", id, updates);\\n        // Notify the user of status changes';
content = content.replace(emergencyUpdateOld, emergencyUpdateNew);

// Notifications
const notifOld = 'try {\\n      // Remove temp fields before inserting\\n      // Local only, no DB operation needed\\n    } catch (e) {';
const notifNew = 'try {\\n      const { id, timestamp, ...dbPayload } = newNotification;\\n      const savedNotif = await api.insert("notifications", dbPayload);\\n      if (savedNotif) {\\n        store.setState({\\n          notifications: store.getState().notifications.map(n => n.id === tempId ? savedNotif : n)\\n        });\\n      }\\n    } catch (e) {';
content = content.replace(notifOld, notifNew);

content = content.replace(/if \\(!id.startsWith\\("NOTIF-TEMP"\\)\\) \\{\\n      \\n    \\}/g, 'if (!id.startsWith("NOTIF-TEMP")) {\\n      api.update("notifications", id, { isRead: true });\\n    }');

content = content.replace(/updateEquipment: \\(id: string, updates: Partial<Equipment>\\) => \\{/g, 'updateEquipment: (id: string, updates: Partial<Equipment>) => {\\n    api.update("equipment", id, updates);');

// Now, handle initialization
const initOld = 'initializeSupabase: async () => {\\n    try {\\n      const data = await api.fetchAllData();\\n      \\n      const parsed = { ...DEFAULT_STATE };';
const initNew = 'initializeSupabase: async () => {\\n    try {\\n      const data = await api.fetchAllData();\\n      \\n      const parsed = { ...store.getState() };';
content = content.replace(initOld, initNew);


fs.writeFileSync('src/lib/store.ts', content);
console.log('Done injecting');
