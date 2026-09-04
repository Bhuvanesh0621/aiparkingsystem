import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import React, { useState, lazy, Suspense } from "react";
import { Plus, Trash2, Edit2, Building2, Zap, Power } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/app/status-badge";
import { useStore, store, ParkingSlot, VehicleType, SlotStatus } from "@/lib/store";

const SmartCityBackground = lazy(() => import("@/components/admin/smart-city-background"));
const DigitalTwinDashboard = lazy(() => import("@/components/admin/digital-twin-dashboard"));

export const Route = createFileRoute("/admin/parking")({
  head: () => ({ meta: [{ title: "Manage Parking — Admin" }] }),
  beforeLoad: async () => {
    if (!(await auth.isAdmin())) throw redirect({ to: "/dashboard" });
  },
  component: AdminParkingPage,
});

function AdminParkingPage() {
  const { slots } = useStore();
  const [floor, setFloor] = useState("1");
  const [count, setCount] = useState("8");
  const [type, setType] = useState<VehicleType>("car");

  const bulkCreate = () => {
    const n = Number(count);
    const newSlots = Array.from({ length: n }, (_, i) => ({
      id: `NEW-${Date.now()}-${i}`,
      slotNumber: `${String.fromCharCode(64 + Number(floor))}${String(slots.length + i + 1).padStart(2, "0")}`,
      floor: Number(floor),
      status: "available" as const,
      type: type as any,
      pricePerHour: type === "bike" ? 20 : type === "ev" ? 80 : type === "suv" ? 70 : 50,
      location: `Block ${String.fromCharCode(64 + Number(floor))}`,
      ...(type === "ev" ? {
        isEV: true,
        chargerType: "AC Type-2",
        chargingPower: "22kW",
        chargingPricePerKwh: 18,
        chargerStatus: "online" as const,
      } : {}),
    }));
    store.setState({ slots: [...slots, ...newSlots] });
    toast.success(`${n} slots created on floor ${floor}`);
  };

  return (
    <AppShell admin>
      <Suspense fallback={null}>
        <SmartCityBackground />
      </Suspense>
      <div className="mb-6 relative z-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Manage parking</h1>
        <p className="text-muted-foreground mt-1">Add areas, floors and bulk-create slots.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6 relative z-10">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4"><Building2 className="h-4 w-4 text-primary" /><span className="font-semibold">Parking area</span></div>
          <div className="space-y-3">
            <Field label="Name" defaultValue="Central Garage" />
            <Field label="Address" defaultValue="Bandra Kurla Complex, Mumbai" />
            <Button variant="hero" className="w-full" onClick={() => toast.success("Area saved")}>Save area</Button>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="font-semibold mb-4">Add floor</div>
          <div className="space-y-3">
            <Field label="Floor name" placeholder="Floor 4 / Basement B2" />
            <Field label="Total bays" placeholder="16" />
            <Button variant="hero" className="w-full" onClick={() => toast.success("Floor added")}>Add floor</Button>
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="font-semibold mb-4">Bulk create slots</div>
          <div className="space-y-3">
            <div>
              <Label>Floor</Label>
              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger className="h-11 bg-white/5 mt-2"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as VehicleType)}>
                <SelectTrigger className="h-11 bg-white/5 mt-2"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="car">Car</SelectItem><SelectItem value="bike">Bike</SelectItem><SelectItem value="ev">EV</SelectItem><SelectItem value="suv">SUV</SelectItem></SelectContent>
              </Select>
            </div>
            <Field label="Count" value={count} onChange={setCount} />
            <Button variant="hero" className="w-full" onClick={bulkCreate}><Plus className="h-4 w-4" /> Create {count} slots</Button>
          </div>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <Suspense fallback={<div className="h-[600px] w-full rounded-3xl bg-white/5 animate-pulse flex items-center justify-center">Loading 3D Twin...</div>}>
          <DigitalTwinDashboard />
        </Suspense>
      </div>

      <div className="glass rounded-2xl overflow-hidden relative z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="font-semibold">All slots · {slots.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="text-left font-medium py-3 px-4">Slot</th>
                <th className="text-left font-medium py-3 px-4">Floor</th>
                <th className="text-left font-medium py-3 px-4">Type</th>
                <th className="text-left font-medium py-3 px-4">Rate</th>
                <th className="text-left font-medium py-3 px-4">Status</th>
                <th className="text-right font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((s) => (
                <tr key={s.id} className="border-t border-border/40 hover:bg-white/5">
                  <td className="py-3 px-4 font-semibold">{s.slotNumber}</td>
                  <td className="py-3 px-4">F{s.floor}</td>
                  <td className="py-3 px-4 capitalize">
                    <div className="flex items-center gap-1.5">
                      {s.type}
                      {s.isEV && <Zap className="h-3 w-3 text-primary fill-primary" />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    ₹{s.pricePerHour}/hr
                    {s.isEV && <div className="text-[10px] text-primary">₹{s.chargingPricePerKwh}/kWh</div>}
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      {s.isEV && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={s.chargerStatus === "online" ? "text-success" : "text-destructive"}
                          onClick={() => {
                            store.updateSlot(s.id, { chargerStatus: s.chargerStatus === "online" ? "offline" : "online" });
                            toast.success(`Charger ${s.chargerStatus === "online" ? "disabled" : "enabled"}`);
                          }}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => toast.success(`Editing ${s.slotNumber}`)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { store.deleteSlot(s.id); toast.success("Slot removed"); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, defaultValue, placeholder, value, onChange }: { label: string; defaultValue?: string; placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined} placeholder={placeholder} className="h-11 bg-white/5 mt-2" />
    </div>
  );
}