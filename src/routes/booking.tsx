import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { CheckCircle2, CalendarClock, Car, MapPin, CreditCard, ShieldCheck, Sparkles, Zap, BatteryCharging } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { SlotCard } from "@/components/app/slot-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore, store, VehicleType, CarServiceRequest } from "@/lib/store";
import { calculateDynamicPrice } from "@/lib/pricing";
import { useRazorpay } from "@/lib/useRazorpay";

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return {
    value: `${hour.toString().padStart(2, "0")}:${min}`,
    label: `${hour12}:${min} ${ampm}`
  };
});

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [{ title: "New Booking — SmartPark AI" }, { name: "description", content: "Book a parking slot." }],
  }),
  beforeLoad: async () => {
    if (!(await auth.isUser())) throw redirect({ to: (await auth.isAdmin()) ? "/admin" : "/login" });
  },
  component: BookingPage,
});

function BookingPage() {
  const { slots, availableServices, users, bookings } = useStore();
  const currentUser = auth.getCurrentUser();
  const user = users.find((u) => u.id === currentUser?.id);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  // Default to the current real-time hour (e.g. 14:00)
  const currentHourStr = new Date().getHours().toString().padStart(2, '0') + ":00";
  const [time, setTime] = useState(currentHourStr);
  const [duration, setDuration] = useState("2");
  const [slot, setSlot] = useState("A03");
  const [payment, setPayment] = useState("card");
  const [open, setOpen] = useState(false);
  const [earnedPointsDisplay, setEarnedPointsDisplay] = useState(0);
  const [batteryTarget, setBatteryTarget] = useState("80");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const [isCustomVehicle, setIsCustomVehicle] = useState(false);

  // Automatically populate vehicle details from user's registered vehicles OR past bookings
  useEffect(() => {
    if (user && !vehicleNumber) {
      if (user.vehicles && user.vehicles.length > 0) {
        const defaultVehicle = user.vehicles.find(v => v.isDefault) || user.vehicles[0];
        setVehicleNumber(defaultVehicle.plateNumber);
        setVehicleType(defaultVehicle.type);
      } else {
        setIsCustomVehicle(true);
        // Fallback: analyze user's past bookings to auto-fill their credentials
        const userBookings = bookings.filter(b => b.userId === user.id);
        if (userBookings.length > 0) {
          // Get the most recent booking
          const lastBooking = userBookings[userBookings.length - 1];
          setVehicleNumber(lastBooking.vehicleNumber);
          setVehicleType(lastBooking.vehicleType);
        }
      }
    }
  }, [user, bookings]);

  // Calculate occupancy for dynamic pricing
  const totalSlots = slots.length;
  const occupiedSlots = slots.filter(s => s.status === 'occupied').length;
  const occupancyPercentage = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

  const { basePrice, surgeAmount, totalPrice, isSurgeActive, surgeMultiplier } = calculateDynamicPrice(Number(duration), time, occupancyPercentage);
  
  const available = slots
    .filter((s) => s.status === "available")
    .sort((a, b) => {
      if (vehicleType === "ev") {
        if (a.isEV && !b.isEV) return -1;
        if (!a.isEV && b.isEV) return 1;
      }
      return 0;
    })
    .slice(0, 30);

  const selectedSlotDetails = slots.find((s) => s.slotNumber === slot);
  
  // Estimate charging
  const chargingHours = Math.min(Number(duration), 4); // assume max 4 hours needed
  const chargingCost = selectedSlotDetails?.isEV && vehicleType === "ev" ? Math.round(chargingHours * 7 * (selectedSlotDetails.chargingPricePerKwh || 18)) : 0; // 7kW avg

  const validServices = availableServices.filter(s => s.isActive && s.vehicleTypes.includes(vehicleType as VehicleType));
  const selectedServices = validServices.filter(s => selectedServiceIds.includes(s.id));
  const servicesCost = selectedServices.reduce((acc, s) => acc + s.price, 0);

  const finalPrice = totalPrice + chargingCost + servicesCost;

  const isRazorpayLoaded = useRazorpay();
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotDetails) {
      toast.error("Please select a slot");
      return;
    }
    // Correctly parse local date/time into proper UTC ISO strings for database
    const localDateTimeString = `${date}T${time}:00`;
    const startObj = new Date(localDateTimeString);
    const endObj = new Date(startObj.getTime() + Number(duration) * 60 * 60 * 1000);

    const newBooking = {
      id: crypto.randomUUID(),
      slotNumber: slot,
      floor: selectedSlotDetails.floor,
      vehicleNumber,
      vehicleType: vehicleType as VehicleType,
      startTime: startObj.toISOString(),
      endTime: endObj.toISOString(),
      amount: finalPrice,
      status: "active" as const,
      paymentStatus: "paid" as const,
      userId: currentUser?.id,
      paymentMethod: payment as "card" | "upi" | "wallet"
    };
    
    // Generate Car Service Requests
    const serviceRequests: CarServiceRequest[] = selectedServices.map((srv, idx) => ({
      id: crypto.randomUUID(),
      serviceId: srv.id,
      name: srv.name,
      category: srv.category,
      price: srv.price,
      durationMinutes: srv.durationMinutes,
      status: "pending",
      bookingId: newBooking.id,
    }));

    if (serviceRequests.length > 0) {
      (newBooking as any).services = serviceRequests;
    }
    
    // Calculate Rewards Points
    let earnedPoints = 10; // Base points
    if (vehicleType === 'ev') earnedPoints += 50;
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 9 || hour >= 18) earnedPoints += 20;
    
    setPendingBookingData({ booking: newBooking, earnedPoints });
    
    // Skip external payment modal if wallet is selected (mock instant deduction)
    if (payment === "wallet") {
      handlePaymentSuccess({ booking: newBooking, earnedPoints });
      return;
    }

    if (!isRazorpayLoaded) {
      toast.error("Razorpay SDK not loaded. Please check your internet connection.");
      return;
    }

    const toastId = toast.loading("Securely initializing payment...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalPrice }),
      });

      if (!response.ok) throw new Error("Failed to create order");
      
      const order = await response.json();
      toast.dismiss(toastId);

      const options = {
        key: "rzp_test_TNZpVjGtbaFqJQ",
        amount: order.amount,
        currency: order.currency,
        name: "SmartPark AI",
        description: `Booking for slot ${slot}`,
        order_id: order.id,
        handler: function (response: any) {
          handlePaymentSuccess({ booking: newBooking, earnedPoints });
        },
        prefill: {
          name: currentUser?.name || "John Doe",
          email: currentUser?.email || "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Could not connect to payment server. Ensure the backend is running.");
      console.error(err);
    }
  };

  const handlePaymentSuccess = async (data = pendingBookingData) => {
    if (!data) return;
    try {
      setEarnedPointsDisplay(data.earnedPoints);
      await store.addBooking(data.booking);
      if (currentUser) {
        store.addRewardPoints(currentUser.id, data.earnedPoints);
      }
      setOpen(true); // Open the success receipt dialog
      toast.success(`Booking confirmed! You earned ${data.earnedPoints} Eco-Rewards!`);
    } catch (err: any) {
      toast.error(err.message || "Booking failed. Please try again.");
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">New booking</h1>
        <p className="text-muted-foreground mt-1">Reserve your bay in under 30 seconds.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={submit}
          className="glass rounded-2xl p-6 lg:col-span-2 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Vehicle number</Label>
              {user && user.vehicles && user.vehicles.length > 0 && !isCustomVehicle ? (
                <Select value={vehicleNumber} onValueChange={(val) => {
                  if (val === "custom") {
                    setIsCustomVehicle(true);
                    setVehicleNumber("");
                    return;
                  }
                  setVehicleNumber(val);
                  const selectedVehicle = user.vehicles.find(v => v.plateNumber === val);
                  if (selectedVehicle) setVehicleType(selectedVehicle.type);
                }}>
                  <SelectTrigger className="h-11 bg-white/5"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                  <SelectContent>
                    {user.vehicles.map(v => (
                      <SelectItem key={v.id} value={v.plateNumber}>
                        {v.plateNumber} ({v.model}) {v.isDefault && "★"}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">+ Other / Type manually</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} className="h-11 bg-white/5" placeholder="Enter plate number" />
                  {user && user.vehicles && user.vehicles.length > 0 && (
                    <Button variant="outline" className="h-11 px-3" onClick={() => setIsCustomVehicle(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Vehicle type</Label>
              <Select value={vehicleType} onValueChange={setVehicleType} disabled={!isCustomVehicle && user?.vehicles?.length > 0}>
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
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="h-11 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0">Parking slot</Label>
              {vehicleType === "ev" && (
                <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full uppercase flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> EV Slots Prioritized
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1 pb-4">
              {available.map((s, i) => (
                <SlotCard
                  key={s.id}
                  slot={s}
                  selected={slot === s.slotNumber}
                  onSelect={(s) => setSlot(s.slotNumber)}
                  index={i}
                />
              ))}
            </div>
            {vehicleType === "ev" && selectedSlotDetails?.isEV && (
              <div className="mt-3 flex flex-wrap sm:flex-nowrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                <BatteryCharging className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-semibold text-primary">EV Charger Available</div>
                  <div className="text-xs text-muted-foreground">{selectedSlotDetails.chargerType} · {selectedSlotDetails.chargingPower}</div>
                </div>
                <div className="w-full sm:w-28">
                  <Label className="text-[10px]">Target Battery %</Label>
                  <Input type="number" value={batteryTarget} onChange={(e) => setBatteryTarget(e.target.value)} className="h-7 text-xs bg-white/10 border-white/20 px-2 mt-0.5" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Additional Services</Label>
              <span className="text-xs text-muted-foreground">Optional</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {validServices.map((srv) => {
                const isSelected = selectedServiceIds.includes(srv.id);
                return (
                  <button
                    type="button" key={srv.id}
                    onClick={() => {
                       setSelectedServiceIds(prev => 
                          prev.includes(srv.id) ? prev.filter(id => id !== srv.id) : [...prev, srv.id]
                       );
                    }}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className="text-xs font-semibold line-clamp-1">{srv.name}</div>
                       <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-white/20"}`}>
                         {isSelected && <CheckCircle2 className="h-3 w-3" />}
                       </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-1">{srv.category} • {srv.durationMinutes}m</div>
                    <div className={`text-sm font-bold ${isSelected ? "text-primary" : ""}`}>
                      {srv.price > 0 ? `₹${srv.price}` : "Included"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment method</Label>
            <div className="grid grid-cols-3 gap-2">
              {[{ v: "card", l: "Card" }, { v: "upi", l: "UPI" }, { v: "wallet", l: `Wallet (₹${user?.walletBalance || 0})` }].map((p) => (
                <button
                  key={p.v} type="button" onClick={() => setPayment(p.v)}
                  className={`rounded-xl border p-3 text-sm transition-all flex flex-col items-center justify-center gap-1 ${
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
            Confirm booking · ₹{finalPrice}
          </Button>
        </form>

        <aside
          className="glass rounded-2xl p-6 h-fit sticky top-24"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Booking summary</div>
            {isSurgeActive && (
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/30">
                <Sparkles className="h-3 w-3" />
                AI Optimized
              </div>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">
            ₹{finalPrice}
            <span className="text-sm text-muted-foreground font-normal">/{duration}h</span>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <Row icon={Car} label="Vehicle" value={`${vehicleNumber} · ${vehicleType.toUpperCase()}`} />
            <Row icon={MapPin} label="Slot" value={`${slot} · Central Garage`} />
            <Row icon={CalendarClock} label="When" value={`${date} · ${time}`} />
          </div>

          <div className="mt-5 pt-5 border-t border-border/50 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Base rate</span><span>₹{basePrice}</span></div>
            {isSurgeActive && (
              <div className="flex justify-between text-primary font-medium">
                <span className="flex items-center gap-1.5">Demand surge ({surgeMultiplier}x)</span>
                <span>+₹{surgeAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground"><span>Convenience fee</span><span>₹0</span></div>
            {chargingCost > 0 && (
               <div className="flex justify-between text-muted-foreground">
                 <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> EV Charging (est.)</span>
                 <span>+₹{chargingCost}</span>
               </div>
            )}
            {selectedServices.map(srv => (
               <div key={srv.id} className="flex justify-between text-muted-foreground">
                 <span className="flex items-center gap-1.5 line-clamp-1"><Sparkles className="h-3 w-3" /> {srv.name}</span>
                 <span>{srv.price > 0 ? `+₹${srv.price}` : 'Free'}</span>
               </div>
            ))}
            <div className="flex justify-between text-muted-foreground"><span>GST</span><span>Included</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border/50 mt-2"><span>Total</span><span>₹{finalPrice}</span></div>
          </div>

          <div className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success mt-0.5" />
            Free cancellation up to 30 min before your slot. QR access issued instantly.
          </div>
        </aside>
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
          <div className="text-center text-xs text-muted-foreground mt-2">Show this QR at the gate to enter.</div>
          
          <div className="mt-4 rounded-xl bg-[linear-gradient(135deg,var(--primary)/0.2,transparent)] border border-primary/20 p-3 text-center">
            <div className="text-xs uppercase tracking-wider text-primary font-bold mb-1">Eco-Rewards Earned</div>
            <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
              <Sparkles className="h-5 w-5 text-primary" /> +{earnedPointsDisplay} pts
            </div>
          </div>
          
          <Button variant="hero" onClick={() => setOpen(false)} className="mt-2">Done</Button>
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