import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { motion } from "motion/react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Area, AreaChart, Legend,
} from "recharts";
import { toast } from "sonner";
import { DollarSign, Users, ParkingCircle, CalendarClock, Activity, Sparkles, Zap, AlertCircle, ShieldAlert, HeartPulse, Wrench, Truck, CheckCircle2, Droplets, Camera, Radio, Monitor, BatteryWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/app/status-badge";
import { useStore, useDashboardStats, store } from "@/lib/store";
import { AlertTriangle, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — SmartPark AI" }] }),
  beforeLoad: async () => {
    if (!(await auth.isAdmin())) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

function AdminPage() {
  const { bookings = [], users = [], emergencyRequests = [], serviceRequests = [], equipment = [] } = useStore();
  const { revenueSeries, occupancySeries, mtdRevenue, totalBookings, evChargingRevenue, energyDelivered, chargingSessions } = useDashboardStats();

  const activeUsersCount = users.filter((u) => u.status === "active").length;
  
  const totalServiceRevenue = serviceRequests.reduce((acc, req) => acc + req.price, 0);
  const activeServiceRequests = serviceRequests.filter(req => req.status !== 'completed');
  
  const totalDevices = equipment.length;
  const healthyDevices = equipment.filter(e => e.status === "Healthy").length;
  const predictedFailures = equipment.filter(e => e.status === "Warning").length;
  const avgHealthScore = Math.round(equipment.reduce((acc, eq) => acc + eq.healthScore, 0) / (totalDevices || 1));
  
  const state = useStore();
  const totalSlots = state.slots.length || 1;
  const occupiedSlots = state.slots.filter(s => s.status === 'occupied').length;
  const utilization = Math.round((occupiedSlots / totalSlots) * 100);

  // Incident Analytics
  const { incidents = [] } = state;
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter(i => i.status === "Reported" || i.status === "Acknowledged").length;
  const criticalIncidents = incidents.filter(i => i.severity === "Critical" && i.status !== "Resolved" && i.status !== "Closed").length;
  const resolvedIncidents = incidents.filter(i => i.status === "Resolved" || i.status === "Closed").length;

  return (
    <AppShell>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Admin overview</h1>
          <p className="text-muted-foreground mt-1">Operations, revenue and utilization at a glance.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard index={0} label="Revenue MTD" value={`₹${mtdRevenue.toLocaleString()}`} delta="+12.4%" icon={DollarSign} accent="primary" />
        <StatCard index={1} label="Bookings" value={totalBookings.toLocaleString()} delta="+8.1%" icon={CalendarClock} accent="secondary" />
        <StatCard index={2} label="Active users" value={activeUsersCount.toLocaleString()} delta="+320 new" icon={Users} accent="success" />
        <StatCard index={3} label="Utilization" value={`${utilization}%`} delta="+4.2 pts" icon={ParkingCircle} accent="warning" />
      </div>

      {/* Incident Management Section */}
      <div className="mb-4 flex items-center gap-2 mt-8">
         <AlertTriangle className="h-5 w-5 text-destructive" />
         <h2 className="font-semibold text-lg tracking-tight">Incident Management</h2>
      </div>
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard index={0} label="Total Incidents" value={totalIncidents.toString()} delta="" icon={AlertCircle} accent="primary" />
        <StatCard index={1} label="Open & Pending" value={openIncidents.toString()} delta="Needs attention" icon={Clock} accent="warning" />
        <StatCard index={2} label="Critical Priority" value={criticalIncidents.toString()} delta="Active emergencies" icon={AlertTriangle} accent="destructive" />
        <StatCard index={3} label="Resolved" value={resolvedIncidents.toString()} delta="All time" icon={CheckCircle2} accent="success" />
      </div>

      <div className="glass rounded-2xl p-6 mb-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase">
            <tr className="border-b border-white/10">
              <th className="text-left font-medium py-3 px-4">ID / Slot</th>
              <th className="text-left font-medium py-3 px-4">Title / Category</th>
              <th className="text-left font-medium py-3 px-4">Severity</th>
              <th className="text-left font-medium py-3 px-4">Reported</th>
              <th className="text-left font-medium py-3 px-4">Status</th>
              <th className="text-right font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-mono text-xs">
                   {inc.id}
                   <div className="text-muted-foreground font-sans mt-0.5">Slot: {inc.slotNumber || "N/A"}</div>
                </td>
                <td className="py-3 px-4">
                   <div className="font-medium">{inc.title}</div>
                   <div className="text-xs text-muted-foreground mt-0.5">{inc.category}</div>
                </td>
                <td className="py-3 px-4">
                   <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                     inc.severity === 'Critical' ? 'bg-destructive/20 text-destructive' :
                     inc.severity === 'High' ? 'bg-orange-500/20 text-orange-500' :
                     inc.severity === 'Medium' ? 'bg-warning/20 text-warning' :
                     'bg-blue-500/20 text-blue-500'
                   }`}>
                     {inc.severity}
                   </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground text-xs">
                   {new Date(inc.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                   <StatusBadge status={inc.status.toLowerCase().replace(" ", "_")} />
                </td>
                <td className="py-3 px-4 text-right">
                   <select 
                     className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs"
                     value={inc.status}
                     onChange={(e) => store.updateIncidentStatus(inc.id, { status: e.target.value as any })}
                   >
                     <option value="Reported">Reported</option>
                     <option value="Acknowledged">Acknowledged</option>
                     <option value="Assigned">Assigned</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Resolved">Resolved</option>
                     <option value="Closed">Closed</option>
                   </select>
                </td>
              </tr>
            ))}
            {incidents.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">No incidents reported.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mb-4 flex items-center gap-2">
         <Zap className="h-5 w-5 text-primary fill-primary/20" />
         <h2 className="font-semibold text-lg tracking-tight">EV Charging Analytics</h2>
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard index={0} label="EV Charging Revenue" value={`₹${evChargingRevenue.toLocaleString()}`} delta="+18.2%" icon={DollarSign} accent="primary" />
        <StatCard index={1} label="Energy Delivered" value={`${energyDelivered.toLocaleString()} kWh`} delta="+310 kWh" icon={Zap} accent="secondary" />
        <StatCard index={2} label="Charging Sessions" value={chargingSessions.toLocaleString()} delta="+42 today" icon={Activity} accent="success" />
        <StatCard index={3} label="Charger Utilization" value="68%" delta="+5.1 pts" icon={ParkingCircle} accent="warning" />
      </div>

      <div className="mb-4 flex items-center gap-2">
         <AlertCircle className="h-5 w-5 text-red-500" />
         <h2 className="font-semibold text-lg tracking-tight">Emergency Management (SOS)</h2>
      </div>
      <div className="glass rounded-2xl p-6 mb-8">
        {emergencyRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
             <CheckCircle2 className="h-10 w-10 text-success/50 mx-auto mb-3" />
             <p>No active emergency requests.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="text-left font-medium py-3 px-4">User & Request</th>
                  <th className="text-left font-medium py-3 px-4">Type</th>
                  <th className="text-left font-medium py-3 px-4">Location</th>
                  <th className="text-left font-medium py-3 px-4">Vehicle</th>
                  <th className="text-left font-medium py-3 px-4">Time</th>
                  <th className="text-left font-medium py-3 px-4">Status</th>
                  <th className="text-right font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emergencyRequests.map((req) => {
                  const user = users.find(u => u.id === req.userId);
                  return (
                  <tr key={req.id} className="border-t border-border/40 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="font-medium text-sm">{user?.name || req.userName || "Unknown User"}</div>
                      <div className="text-xs text-muted-foreground">{user?.email || ""}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/60 mt-1">{req.id?.toString().substring(0, 8)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 capitalize font-semibold">
                        {req.type === "security" && <ShieldAlert className="h-4 w-4 text-blue-400" />}
                        {req.type === "medical" && <HeartPulse className="h-4 w-4 text-red-400" />}
                        {req.type === "breakdown" && <Wrench className="h-4 w-4 text-orange-400" />}
                        {req.type === "tow" && <Truck className="h-4 w-4 text-purple-400" />}
                        {req.type}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      Slot {req.slotNumber}<br/><span className="text-muted-foreground text-xs">Floor {req.floor}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{req.vehicleNumber}</span><br/><span className="text-muted-foreground text-xs capitalize">{req.vehicleType}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="py-3 px-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                         req.status === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                         req.status === 'dispatched' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                         'bg-success/10 text-success border-success/20'
                       }`}>
                         {req.status}
                       </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                       {req.status === "pending" && (
                         <Button size="sm" variant="outline" className="h-8 border-primary/30 text-primary hover:bg-primary/10" onClick={() => {
                            store.updateEmergencyRequestStatus(req.id, { status: "dispatched", assignedStaff: "Response Team Alpha" });
                            toast.success(`Response team dispatched for ${req.id}`);
                         }}>Dispatch Team</Button>
                       )}
                       {req.status === "dispatched" && (
                         <Button size="sm" variant="outline" className="h-8 border-success/30 text-success hover:bg-success/10" onClick={() => {
                            store.updateEmergencyRequestStatus(req.id, { status: "resolved" });
                            toast.success(`Request ${req.id} marked as resolved`);
                         }}>Mark Resolved</Button>
                       )}
                       {req.status === "resolved" && (
                         <span className="text-muted-foreground text-xs flex items-center justify-end gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</span>
                       )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Car Services Management */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg tracking-tight">Car Services Management</h2>
        </div>
        
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-4">
          <StatCard index={0} label="Active Services" value={activeServiceRequests.length.toString()} delta={`${serviceRequests.length} total today`} icon={Activity} accent="warning" />
          <StatCard index={1} label="Services Revenue" value={`₹${totalServiceRevenue.toLocaleString()}`} delta="MTD" icon={DollarSign} accent="primary" />
        </div>

        {activeServiceRequests.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground border border-dashed border-white/20">
            <Droplets className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No active service requests.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="text-left font-medium py-3 px-4">Booking ID</th>
                  <th className="text-left font-medium py-3 px-4">Service</th>
                  <th className="text-left font-medium py-3 px-4">Category</th>
                  <th className="text-left font-medium py-3 px-4">Status</th>
                  <th className="text-right font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {activeServiceRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono text-xs">{req.bookingId}</td>
                    <td className="py-3 px-4 font-semibold">{req.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{req.category}</td>
                    <td className="py-3 px-4">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                         req.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                         'bg-primary/10 text-primary border-primary/20'
                       }`}>
                         {req.status === 'pending' ? 'Pending' : 'In Progress'}
                       </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                       {req.status === "pending" && (
                         <Button size="sm" variant="outline" className="h-8 border-primary/30 text-primary hover:bg-primary/10" onClick={() => {
                            store.updateCarServiceStatus(req.id, "in_progress", "Staff Team 1");
                            toast.success(`Service ${req.id} started`);
                         }}>Start Service</Button>
                       )}
                       {req.status === "in_progress" && (
                         <Button size="sm" variant="outline" className="h-8 border-success/30 text-success hover:bg-success/10" onClick={() => {
                            store.updateCarServiceStatus(req.id, "completed");
                            toast.success(`Service ${req.id} completed`);
                         }}>Complete</Button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
         <Wrench className="h-5 w-5 text-indigo-500" />
         <h2 className="font-semibold text-lg tracking-tight">Smart Maintenance & AI Diagnostics</h2>
      </div>
      
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-4">
        <StatCard index={0} label="Total Devices" value={totalDevices.toString()} delta="Monitored" icon={Activity} accent="primary" />
        <StatCard index={1} label="Healthy" value={healthyDevices.toString()} delta={`${Math.round((healthyDevices/totalDevices)*100)}% uptime`} icon={CheckCircle2} accent="success" />
        <StatCard index={2} label="Predicted Failures" value={predictedFailures.toString()} delta="Next 14 days" icon={AlertCircle} accent="warning" />
        <StatCard index={3} label="Avg Health Score" value={`${avgHealthScore}/100`} delta="AI Calculated" icon={Sparkles} accent="secondary" />
      </div>

      <div className="glass rounded-2xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground uppercase bg-white/5">
            <tr>
              <th className="text-left font-medium py-3 px-4">Equipment</th>
              <th className="text-left font-medium py-3 px-4">Type</th>
              <th className="text-left font-medium py-3 px-4">Location</th>
              <th className="text-left font-medium py-3 px-4">Health Score</th>
              <th className="text-left font-medium py-3 px-4">Status</th>
              <th className="text-right font-medium py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {equipment.map((eq) => (
              <tr key={eq.id} className="hover:bg-white/5">
                <td className="py-3 px-4">
                  <div className="font-semibold">{eq.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{eq.id}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {eq.type === "Sensor" && <Radio className="h-4 w-4" />}
                    {eq.type === "Camera" && <Camera className="h-4 w-4" />}
                    {eq.type === "Barrier" && <AlertCircle className="h-4 w-4" />}
                    {eq.type === "Charger" && <Zap className="h-4 w-4" />}
                    {eq.type === "Display" && <Monitor className="h-4 w-4" />}
                    {eq.type}
                  </div>
                </td>
                <td className="py-3 px-4">{eq.location}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">{eq.healthScore}</span>
                    <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${eq.healthScore > 80 ? 'bg-success' : eq.healthScore > 50 ? 'bg-warning' : 'bg-destructive'}`}
                        style={{ width: `${eq.healthScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                     eq.status === 'Healthy' ? 'bg-success/10 text-success border-success/20' : 
                     eq.status === 'Warning' ? 'bg-warning/10 text-warning border-warning/20' : 
                     eq.status === 'Failure' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                     'bg-slate-500/10 text-slate-400 border-slate-500/20'
                   }`}>
                     {eq.status}
                   </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button size="sm" variant="outline" className="h-8 hover:bg-white/5" onClick={() => toast.success(`Maintenance scheduled for ${eq.name}`)}>
                    Schedule Fix
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Monthly revenue</div>
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/30">
                  <Sparkles className="h-3 w-3" />
                  AI Yield Optimized
                </div>
              </div>
              <div className="text-2xl font-bold mt-1">₹{mtdRevenue.toLocaleString()}</div>
            </div>
            <div className="text-xs text-success">▲ 12.4% MoM</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#ar)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="text-sm text-muted-foreground">Peak hours (today)</div>
          <div className="text-2xl font-bold">14:00 – 18:00</div>
          <div className="h-52 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancySeries}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="occupied" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="reserved" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Recent bookings</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium py-2">Booking</th>
                  <th className="text-left font-medium py-2">Slot</th>
                  <th className="text-left font-medium py-2">Vehicle</th>
                  <th className="text-left font-medium py-2">Amount</th>
                  <th className="text-left font-medium py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-border/40 last:border-none hover:bg-white/5">
                    <td className="py-3 font-mono text-xs">{b.id}</td>
                    <td className="py-3 font-semibold">{b.slotNumber}</td>
                    <td className="py-3">{b.vehicleNumber}</td>
                    <td className="py-3 font-medium">₹{b.amount}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="font-semibold mb-4">New users</div>
          <div className="space-y-3">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] grid place-items-center text-xs font-semibold text-white">
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <StatusBadge status={u.role} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}