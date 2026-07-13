import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { SlotCard } from "@/components/app/slot-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { parkingSlots, type ParkingSlot } from "@/lib/mock-data";

export const Route = createFileRoute("/slots")({
  head: () => ({
    meta: [
      { title: "Parking Slots — SmartPark AI" },
      { name: "description", content: "Live parking slot availability grid." },
    ],
  }),
  component: SlotsPage,
});

function SlotsPage() {
  const [q, setQ] = useState("");
  const [floor, setFloor] = useState("all");
  const [type, setType] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [selected, setSelected] = useState<ParkingSlot | null>(null);

  const filtered = useMemo(() => parkingSlots.filter((s) => {
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
        {filtered.map((s, i) => (
          <SlotCard key={s.id} slot={s} selected={selected?.id === s.id} onSelect={setSelected} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full glass rounded-2xl p-10 text-center text-muted-foreground">
            No slots match your filters.
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass-strong rounded-2xl px-5 py-3 flex items-center gap-4 shadow-elegant">
          <div className="text-sm">
            <div className="font-semibold">Slot {selected.slotNumber} selected</div>
            <div className="text-xs text-muted-foreground">Floor {selected.floor} · ₹{selected.pricePerHour}/hr</div>
          </div>
          <Button asChild variant="hero" size="sm"><Link to="/booking">Continue</Link></Button>
        </div>
      )}
    </AppShell>
  );
}