import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Area, AreaChart, Legend,
} from "recharts";
import { DollarSign, Users, ParkingCircle, CalendarClock, Activity } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/app/status-badge";
import { revenueSeries, occupancySeries, bookings, adminUsers } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — SmartPark AI" }] }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AppShell admin>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-muted-foreground mt-1">Operations, revenue and utilization at a glance.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard index={0} label="Revenue MTD" value="₹6,85,240" delta="+12.4%" icon={DollarSign} accent="primary" />
        <StatCard index={1} label="Bookings" value="4,218" delta="+8.1%" icon={CalendarClock} accent="secondary" />
        <StatCard index={2} label="Active users" value="12,486" delta="+320 new" icon={Users} accent="success" />
        <StatCard index={3} label="Utilization" value="72%" delta="+4.2 pts" icon={ParkingCircle} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <motion.div className="glass rounded-2xl p-6 lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Monthly revenue</div>
              <div className="text-2xl font-bold">₹6,85,240</div>
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
        </motion.div>

        <motion.div className="glass rounded-2xl p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
        </motion.div>
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
            {adminUsers.slice(0, 5).map((u) => (
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