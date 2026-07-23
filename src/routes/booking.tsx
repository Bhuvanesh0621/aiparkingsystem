import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { CheckCircle2, CalendarClock, Car, MapPin, CreditCard, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parkingSlots } from "@/lib/mock-data";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [{ title: "New Booking — SmartPark AI" }, { name: "description", content: "Book a parking slot." }],
  }),
  component: BookingPage,
});

function BookingPage() {
  const [vehicleNumber, setVehicleNumber] = useState("MH 12 AB 4521");
  const [vehicleType, setVehicleType] = useState("car");
  const [date, setDate] = useState("2026-07-13");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("2");
  const [slot, setSlot] = useState("A03");
  const [payment, setPayment] = useState("card");
  const [open, setOpen] = useState(false);

  const price = Number(duration) * 50;
  const available = parkingSlots.filter((s) => s.status !== "occupied").slice(0, 30);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(true);
    toast.success("Booking confirmed — QR pass generated");
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">New booking</h1>
        <p className="text-muted-foreground mt-1">Reserve your bay in under 30 seconds.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 lg:col-span-2 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vehicle number</Label>
              <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="h-11 bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label>Vehicle type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="h-11 bg-white/5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="ev">EV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 bg-white/5" />
            </div>
            <div className="space-y-2">
              <Label>Duration (hours)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-11 bg-white/5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 6, 8, 12, 24].map((h) => <SelectItem key={h} value={String(h)}>{h}h</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Parking slot</Label>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-56 overflow-auto p-1">
              {available.map((s) => (
                <button
                  type="button" key={s.id} onClick={() => setSlot(s.slotNumber)}
                  className={`rounded-lg border p-2 text-xs font-semibold transition-all ${
                    slot === s.slotNumber
                      ? "border-primary bg-primary/20 text-primary shadow-glow"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {s.slotNumber}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment method</Label>
            <div className="grid grid-cols-3 gap-2">
              {[{ v: "card", l: "Card" }, { v: "upi", l: "UPI" }, { v: "wallet", l: "Wallet" }].map((p) => (
                <button
                  key={p.v} type="button" onClick={() => setPayment(p.v)}
                  className={`rounded-xl border p-3 text-sm transition-all ${
                    payment === p.v
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" /> {p.l}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            Confirm booking · ₹{price}
          </Button>
        </motion.form>

        <motion.aside
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="glass rounded-2xl p-6 h-fit sticky top-24"
        >
          <div className="text-sm text-muted-foreground">Booking summary</div>
          <div className="mt-2 text-2xl font-bold tracking-tight">₹{price}<span className="text-sm text-muted-foreground font-normal">/{duration}h</span></div>

          <div className="mt-5 space-y-3 text-sm">
            <Row icon={Car} label="Vehicle" value={`${vehicleNumber} · ${vehicleType.toUpperCase()}`} />
            <Row icon={MapPin} label="Slot" value={`${slot} · Central Garage`} />
            <Row icon={CalendarClock} label="When" value={`${date} · ${time}`} />
          </div>

          <div className="mt-5 pt-5 border-t border-border/50 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Base</span><span>₹{price}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Convenience fee</span><span>₹0</span></div>
            <div className="flex justify-between text-muted-foreground"><span>GST</span><span>Included</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border/50 mt-2"><span>Total</span><span>₹{price}</span></div>
          </div>

          <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success mt-0.5" />
            Free cancellation up to 30 min before your slot. QR access issued instantly.
          </div>
        </motion.aside>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass-strong border-white/10">
          <DialogHeader>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/20 text-success shadow-glow mb-2">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center text-2xl">Booking confirmed</DialogTitle>
          </DialogHeader>
          <div className="text-center text-sm text-muted-foreground -mt-1">Slot {slot} · {date} · {time}</div>
          <div className="mx-auto mt-4 grid h-48 w-48 place-items-center rounded-2xl bg-white p-3">
            <QRCodeSVG value={`SMARTPARK|${slot}|${date}|${time}|${vehicleNumber}`} size={168} />
          </div>
          <div className="text-center text-xs text-muted-foreground">Show this QR at the gate to enter.</div>
          <Button variant="hero" onClick={() => setOpen(false)}>Done</Button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: import("lucide-react").LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 border border-white/10 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}