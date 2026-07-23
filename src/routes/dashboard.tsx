import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Wallet, Car, ParkingCircle, CalendarClock, ArrowUpRight,
  QrCode, MapPin, Plus,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell,
} from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/app/status-badge";
import { Button } from "@/components/ui/button";
import { bookings, revenueSeries, vehicleMix, stats } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartPark AI" },
      { name: "description", content: "Your live parking dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Monday, July 13</div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Welcome back, Aarav 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening across your parking today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="glass"><Link to="/slots"><MapPin className="h-4 w-4" />View slots</Link></Button>
          <Button asChild variant="hero"><Link to="/booking"><Plus className="h-4 w-4" />New booking</Link></Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard index={0} label="Available slots" value={stats.available} delta="+4 in last hour" icon={ParkingCircle} accent="success" />
        <StatCard index={1} label="Occupied" value={stats.occupied} delta="72% utilization" icon={Car} accent="primary" />
        <StatCard index={2} label="Reserved" value={stats.reserved} delta="6 upcoming today" icon={CalendarClock} accent="warning" />
        <StatCard index={3} label="Wallet balance" value="₹1,240" delta="+₹120 cashback" icon={Wallet} accent="secondary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Bookings & revenue</div>
              <div className="text-2xl font-bold">₹3,44,500</div>
            </div>
            <div className="text-xs text-success">▲ 12.4% MoM</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--secondary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="url(#rev)" strokeWidth={2} />
                <Area type="monotone" dataKey="bookings" stroke="var(--secondary)" fill="url(#bks)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
          <div className="text-sm text-muted-foreground">Vehicle mix</div>
          <div className="text-2xl font-bold mb-2">Today</div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={vehicleMix} innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {vehicleMix.map((v) => <Cell key={v.name} fill={v.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {vehicleMix.map((v) => (
              <div key={v.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: v.color }} />
                <span className="text-muted-foreground">{v.name}</span>
                <span className="ml-auto font-medium">{v.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">Recent bookings</div>
            <Link to="/history" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground uppercase">
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium py-2">Booking</th>
                  <th className="text-left font-medium py-2">Slot</th>
                  <th className="text-left font-medium py-2">When</th>
                  <th className="text-left font-medium py-2">Amount</th>
                  <th className="text-left font-medium py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-b border-border/40 last:border-none hover:bg-white/5 transition-colors">
                    <td className="py-3 font-mono text-xs">{b.id}</td>
                    <td className="py-3 font-semibold">{b.slotNumber}<span className="ml-1 text-muted-foreground text-xs">· F{b.floor}</span></td>
                    <td className="py-3 text-muted-foreground">{new Date(b.startTime).toLocaleDateString()}</td>
                    <td className="py-3 font-medium">₹{b.amount}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6">
          <div className="font-semibold mb-4">Quick actions</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Plus, label: "New booking", to: "/booking" },
              { icon: MapPin, label: "Find a slot", to: "/slots" },
              { icon: QrCode, label: "My QR pass", to: "/dashboard" },
              { icon: CalendarClock, label: "History", to: "/history" },
            ].map((a) => (
              <Link key={a.label} to={a.to} className="group glass rounded-xl p-4 hover:bg-white/10 transition-colors">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 border border-primary/30 text-primary mb-3 group-hover:shadow-glow transition-shadow">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">{a.label}</div>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl p-4 bg-[linear-gradient(135deg,var(--primary)/0.2,var(--secondary)/0.1)] border border-primary/30">
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">AI recommendation</div>
            <p className="mt-1 text-sm">Slot <span className="font-bold">B07</span> is likely to free up in 12 min near your usual bay.</p>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}