import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { motion } from "motion/react";
import {
  Wallet, Car, ParkingCircle, CalendarClock, ArrowUpRight,
  QrCode, MapPin, Plus, Sparkles, CheckCircle2, Clock, Wrench, AlertTriangle, Mail, Zap
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell,
} from "recharts";
import { AppShell } from "@/components/app/app-shell";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/app/status-badge";
import { WalletCard } from "@/components/app/wallet-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStore, useStats, useDashboardStats, store } from "@/lib/store";
import { ReportIncidentModal } from "@/components/app/report-incident-modal";
import { ARNavigation } from "@/components/app/ar-navigation";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartPark AI" },
      { name: "description", content: "Your live parking dashboard." },
    ],
  }),
  beforeLoad: async () => {
    if (!(await auth.isUser())) throw redirect({ to: (await auth.isAdmin()) ? "/admin" : "/login" });
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { bookings, serviceRequests, incidents = [], users } = useStore();
  const currentUser = auth.getCurrentUser();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    auth.getCurrentProfile().then(setProfile);
  }, []);

  const displayName = profile?.name ? profile.name.split(" ")[0] : "Guest";

  const activeBooking = bookings.find(b => b.status === "active");
  const activeServices = activeBooking ? serviceRequests.filter(s => s.bookingId === activeBooking.id) : [];
  const activeIncidents = incidents.filter(i => i.reportedBy === currentUser?.id && i.status !== "Resolved" && i.status !== "Closed");
  const stats = useStats();
  const { revenueSeries, vehicleMix, mtdRevenue } = useDashboardStats();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFindMyCarOpen, setIsFindMyCarOpen] = useState(false);

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Welcome back, {displayName} 👋</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Mail className="h-4 w-4" /> {profile?.email || "guest@example.com"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="glass"><Link to="/slots"><MapPin className="h-4 w-4" />View slots</Link></Button>
          <Button asChild variant="hero"><Link to="/booking"><Plus className="h-4 w-4" />New booking</Link></Button>
        </div>
      </div>

      {activeBooking && (
        <div className={`mb-8 rounded-2xl bg-[linear-gradient(135deg,var(--${activeBooking.evDetails ? 'success' : 'primary'})/0.15,var(--secondary)/0.05)] border border-${activeBooking.evDetails ? 'success' : 'primary'}/20 p-6 overflow-hidden relative`}>
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            {activeBooking.evDetails ? <Zap className="h-32 w-32" /> : <Car className="h-32 w-32" />}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className={`inline-flex items-center gap-1.5 rounded-full bg-${activeBooking.evDetails ? 'success' : 'primary'}/20 px-2.5 py-1 text-xs font-semibold text-${activeBooking.evDetails ? 'success' : 'primary'} border border-${activeBooking.evDetails ? 'success' : 'primary'}/30 mb-3`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${activeBooking.evDetails ? 'success' : 'primary'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 bg-${activeBooking.evDetails ? 'success' : 'primary'}`}></span>
                </span>
                {activeBooking.evDetails ? 'EV Charging Session' : 'Active Parking Session'}
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Slot {activeBooking.slotNumber} · F{activeBooking.floor}</h2>
              <p className="text-muted-foreground mb-4">{activeBooking.vehicleNumber} · Since {new Date(activeBooking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <Button variant="hero" onClick={() => setIsFindMyCarOpen(true)} className="gap-2 shadow-glow bg-blue-600 hover:bg-blue-700 text-white">
                <MapPin className="h-4 w-4" />
                Live AR Navigation
              </Button>
            </div>
            
            {activeServices.length > 0 && (
              <div className="flex-1 max-w-md w-full bg-background/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg">
                <div className="text-sm font-semibold mb-3 flex items-center justify-between">
                  <span>Live Service Progress</span>
                  <span className="text-xs text-muted-foreground font-normal">{activeServices.filter(s => s.status === 'completed').length}/{activeServices.length} Completed</span>
                </div>
                <div className="space-y-3">
                  {activeServices.map(srv => (
                    <div key={srv.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {srv.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : srv.status === 'in_progress' ? (
                          <Wrench className="h-4 w-4 text-primary animate-pulse" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground opacity-50" />
                        )}
                        <span className={srv.status === 'completed' ? 'text-muted-foreground line-through' : 'font-medium'}>{srv.name}</span>
                      </div>
                      <span className={`text-xs font-medium ${srv.status === 'completed' ? 'text-success' : srv.status === 'in_progress' ? 'text-primary' : 'text-muted-foreground'}`}>
                         {srv.status === 'completed' ? 'Done' : srv.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeBooking.evDetails && (
              <div className="flex-1 max-w-md w-full bg-background/40 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-success animate-pulse" />
                    <span className="text-sm font-semibold">Live Charging</span>
                  </div>
                  <span className="text-sm font-bold text-success">{activeBooking.evDetails.batteryLevel}%</span>
                </div>
                <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-success transition-all duration-1000" 
                    style={{ width: `${activeBooking.evDetails.batteryLevel}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex flex-col">
                    <span>Energy</span>
                    <span className="font-medium text-foreground">{activeBooking.evDetails.energyConsumed.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span>Time Left</span>
                    <span className="font-medium text-foreground">{activeBooking.evDetails.estimatedTimeRemaining} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeIncidents.length > 0 && (
        <div className="mb-8 rounded-2xl bg-[linear-gradient(135deg,var(--destructive)/0.1,transparent)] border border-destructive/20 p-4">
          <div className="flex items-center gap-2 mb-2 text-destructive">
             <AlertTriangle className="h-5 w-5" />
             <h3 className="font-semibold text-foreground">Your Active Incidents</h3>
          </div>
          <div className="space-y-2">
            {activeIncidents.map(inc => (
               <div key={inc.id} className="flex items-center justify-between bg-black/20 rounded-lg p-3 text-sm border border-white/5">
                 <div>
                   <span className="font-medium">{inc.title}</span>
                   <div className="text-xs text-muted-foreground mt-0.5">{inc.category} • Slot {inc.slotNumber || "N/A"}</div>
                 </div>
                 <StatusBadge status={inc.status.toLowerCase()} />
               </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3 items-start mb-8">
        
        {/* Left Column: Stats & Quick Actions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Stat Cards Row */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 items-start">
            <StatCard index={0} label="Available" value={stats.available} delta="+4 in last hour" icon={ParkingCircle} accent="success" />
            <StatCard index={1} label="Occupied" value={stats.occupied} delta="72% utilization" icon={Car} accent="primary" />
            <StatCard index={2} label="Reserved" value={stats.reserved} delta="6 upcoming today" icon={CalendarClock} accent="warning" />
          </div>

          {/* Quick Actions Block */}
          <div className="glass rounded-2xl p-6">
          <div className="font-semibold mb-4 text-lg">Quick actions</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { icon: Plus, label: "New booking", to: "/booking" },
              { icon: MapPin, label: "Find a slot", to: "/slots" },
              { icon: QrCode, label: "My QR pass", action: "qr" },
              { icon: CalendarClock, label: "History", to: "/history" },
            ].map((a) => (
              a.to ? (
                <Link key={a.label} to={a.to} className="group glass rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 border border-primary/30 text-primary mb-3 group-hover:shadow-glow transition-shadow">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="font-medium">{a.label}</div>
                </Link>
              ) : (
                <button key={a.label} onClick={() => {
                  if (a.action === 'qr') {
                     if (activeBooking) {
                       store.openTicket(activeBooking.id);
                     } else {
                       toast.error("No active bookings found to show QR pass.");
                     }
                  }
                }} className="group glass rounded-xl p-4 hover:bg-white/10 transition-colors text-left">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 border border-primary/30 text-primary mb-3 group-hover:shadow-glow transition-shadow">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="font-medium">{a.label}</div>
                </button>
              )
            ))}
            <button onClick={() => setIsReportModalOpen(true)} className="group glass rounded-xl p-4 hover:bg-white/10 transition-colors text-left col-span-2 sm:col-span-1">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-destructive/15 border border-destructive/30 text-destructive mb-3 group-hover:shadow-glow transition-shadow">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="font-medium">Report Incident</div>
            </button>
          </div>

          <div className="mt-6 flex items-start gap-4 rounded-xl p-4 bg-[linear-gradient(135deg,var(--primary)/0.15,var(--secondary)/0.05)] border border-primary/20">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-primary font-bold">AI recommendation</div>
              <p className="mt-0.5 text-sm">Slot <span className="font-bold">B07</span> is likely to free up in 12 min near your usual bay. Want me to reserve it for you?</p>
            </div>
          </div>
        </div>
        </div>


        {/* Right Column: Wallet & Recent Bookings */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <WalletCard />
          
          <div className="glass rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">Recent bookings</div>
            <Link to="/history" className="text-xs text-primary hover:underline inline-flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1">
            {bookings.slice(0, 4).map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-semibold">{b.slotNumber} <span className="text-xs font-normal text-muted-foreground ml-1">· F{b.floor}</span></div>
                  <div className="text-xs text-muted-foreground mt-0.5">{new Date(b.startTime).toLocaleDateString()}</div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="font-medium text-sm">₹{b.amount}</div>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">No recent bookings</div>
            )}
          </div>
        </div>
      </div>
      </div>
      <ReportIncidentModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} defaultSlotNumber={activeBooking?.slotNumber} />
      {activeBooking && isFindMyCarOpen && (
        <ARNavigation 
          slotNumber={activeBooking.slotNumber} 
          onClose={() => setIsFindMyCarOpen(false)} 
        />
      )}
    </AppShell>
  );
}