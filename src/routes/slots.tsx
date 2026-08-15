import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useMemo, useState, useEffect } from "react";
import { Search, Filter, Zap, Wrench, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { SlotCard } from "@/components/app/slot-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useStore, ParkingSlot } from "@/lib/store";

export const Route = createFileRoute("/slots")({
  head: () => ({
    meta: [
      { title: "Parking Slots — SmartPark AI" },
      { name: "description", content: "Live parking slot availability grid." },
    ],
  }),
  beforeLoad: async () => {
    if (!(await auth.isUser())) throw redirect({ to: (await auth.isAdmin()) ? "/admin" : "/login" });
  },
  component: SlotsPage,
});

function SlotsPage() {
  const [q, setQ] = useState("");
  const [floor, setFloor] = useState("all");
  const [type, setType] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [selected, setSelected] = useState<ParkingSlot | null>(null);
  const { slots, equipment = [], incidents = [] } = useStore();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    auth.isAdmin().then(setIsAdmin);
  }, []);

  const filtered = useMemo(() => slots.filter((s) => {
    if (q && !s.slotNumber.toLowerCase().includes(q.toLowerCase())) return false;
    if (floor !== "all" && s.floor !== Number(floor)) return false;
    if (type !== "all" && s.type !== type) return false;
    if (availability !== "all" && s.status !== availability) return false;
    return true;
  }), [q, floor, type, availability]);

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Parking slots</h1>
          <p className="text-muted-foreground mt-1">Live grid across all floors. Tap any available bay to select.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success shadow-glow"/>Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning"/>Reserved</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive"/>Occupied</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary shadow-glow"/>Selected</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search slot number (e.g. A03)" className="pl-9 h-10 bg-white/5" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={floor} onValueChange={setFloor}>
          <SelectTrigger className="w-36 h-10 bg-white/5"><Filter className="h-3.5 w-3.5" /><SelectValue placeholder="Floor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All floors</SelectItem>
            <SelectItem value="1">Floor 1</SelectItem>
            <SelectItem value="2">Floor 2</SelectItem>
            <SelectItem value="3">Floor 3</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36 h-10 bg-white/5"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="car">Car</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="bike">Bike</SelectItem>
            <SelectItem value="ev">EV</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="w-40 h-10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any availability</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
        {filtered.map((s, i) => {
          const slotEq = equipment.find(e => e.location.includes(s.slotNumber));
          const slotInc = incidents.find(inc => inc.slotNumber === s.slotNumber && inc.status !== "Resolved" && inc.status !== "Closed");
          return (
            <SlotCard 
              key={s.id} 
              slot={s} 
              selected={selected?.id === s.id} 
              onSelect={setSelected} 
              index={i} 
              equipmentHealth={isAdmin ? slotEq?.status : undefined}
              incidentSeverity={slotInc?.severity}
            />
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full glass rounded-2xl p-10 text-center text-muted-foreground">
            No slots match your filters.
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass-strong rounded-2xl px-5 py-3 flex flex-col sm:flex-row items-center gap-4 shadow-elegant w-[90%] sm:w-auto">
          <div className="text-sm text-center sm:text-left flex-1">
            <div className="font-semibold flex items-center justify-center sm:justify-start gap-1.5">
              Slot {selected.slotNumber} selected
              {selected.isEV && <span className="inline-flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary"><Zap className="h-3 w-3 fill-primary" /> EV</span>}
              {isAdmin && equipment.find(e => e.location.includes(selected.slotNumber))?.status !== "Healthy" && (
                <span className="inline-flex items-center gap-1 rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] text-destructive"><AlertCircle className="h-3 w-3" /> Maintenance Required</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Floor {selected.floor} · ₹{selected.pricePerHour}/hr
              {selected.isEV && ` · ${selected.chargerType} (${selected.chargingPower}) at ₹${selected.chargingPricePerKwh}/kWh`}
            </div>
          </div>
          {isAdmin ? (
            <Button asChild variant="hero" size="sm" className="w-full sm:w-auto"><Link to="/admin/parking">Manage Slot</Link></Button>
          ) : (
            <Button asChild variant="hero" size="sm" className="w-full sm:w-auto"><Link to="/booking">Continue</Link></Button>
          )}
        </div>
      )}
    </AppShell>
  );
}