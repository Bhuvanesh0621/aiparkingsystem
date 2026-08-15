import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { auth } from "@/lib/auth";
import { BatteryCharging, BatteryFull, Zap, MapPin, Clock, Info, ShieldAlert, Car, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { toast } from "sonner";

export const Route = createFileRoute("/ev-charging")({
  component: EVChargingDashboard,
});

function EVChargingDashboard() {
  const { bookings } = useStore();
  const navigate = useNavigate();
  const currentUser = auth.getCurrentUser();
  
  const activeEVBooking = bookings.find(
    (b) => b.userId === currentUser?.id && b.status === "active" && b.evDetails
  );

  if (!activeEVBooking || !activeEVBooking.evDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
          <Zap className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Active EV Session</h2>
        <p className="text-muted-foreground mb-8">
          You don't have any active EV charging sessions. Book an EV slot to track your charging status here.
        </p>
        <Link to="/booking">
          <Button size="lg" className="rounded-xl shadow-glow">Book an EV Slot</Button>
        </Link>
      </div>
    );
  }

  const { evDetails } = activeEVBooking;
  const isComplete = evDetails.batteryLevel >= 100;

  // Calculate costs (parking cost + idle fee)
  const parkingCost = activeEVBooking.amount;
  const idleFee = evDetails.idleFee || 0;
  const totalCost = parkingCost + idleFee;

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/dashboard" })} className="rounded-full hover:bg-white/10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Charging Dashboard
            {evDetails.isCharging && <span className="relative flex h-3 w-3 ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span></span>}
          </h1>
          <p className="text-muted-foreground">Manage your EV charging session</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Left Column: Battery Display */}
        <div className="glass-strong rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-elegant border border-white/10">
          <div className={cn(
            "absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-30 transition-colors duration-1000",
            isComplete ? "bg-success" : "bg-primary"
          )} />
          
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-white/10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - evDetails.batteryLevel / 100)}`}
                strokeLinecap="round"
                className={cn("transition-all duration-1000 ease-out", isComplete ? "text-success" : "text-primary")}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex items-start">
                <span className="text-5xl font-black">{Math.floor(evDetails.batteryLevel)}</span>
                <span className="text-xl font-bold text-muted-foreground">%</span>
              </div>
              <div className={cn("text-xs uppercase tracking-wider font-semibold mt-1", isComplete ? "text-success" : "text-primary")}>
                {isComplete ? "Fully Charged" : "Charging"}
              </div>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Time Remaining</div>
              <div className="font-semibold text-lg flex items-center justify-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                {evDetails.estimatedTimeRemaining > 0 ? `${evDetails.estimatedTimeRemaining} min` : 'Done'}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Power Rate</div>
              <div className="font-semibold text-lg flex items-center justify-center gap-1.5">
                <Zap className="h-4 w-4 text-warning" />
                {isComplete ? "0 kW" : "60 kW"}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Idle Fees */}
        <div className="flex flex-col gap-6">
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h3 className="font-semibold mb-4 text-lg">Session Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-muted-foreground"><Car className="h-4 w-4" /> Vehicle</div>
                <div className="font-medium">{activeEVBooking.vehicleNumber}</div>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Location</div>
                <div className="font-medium">Floor {activeEVBooking.floor}, Slot {activeEVBooking.slotNumber}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground"><BatteryCharging className="h-4 w-4" /> Started At</div>
                <div className="font-medium">
                  {evDetails.chargeStartTime ? new Date(evDetails.chargeStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "rounded-2xl p-6 border transition-colors", 
            isComplete && evDetails.idleFee > 0 ? "bg-destructive/10 border-destructive/30" : "glass border-white/10"
          )}>
            <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
              Cost Breakdown 
              {evDetails.idleFee > 0 && <ShieldAlert className="h-4 w-4 text-destructive animate-pulse" />}
            </h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Parking Rate (Flat)</span>
                <span>₹{parkingCost}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Energy Delivered (Complimentary)</span>
                <span className="text-success">₹0</span>
              </div>
              
              {isComplete && (
                <div className="flex justify-between items-center text-sm text-destructive font-medium pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1">
                    Idle Fees 
                    <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded ml-1">₹5/min</span>
                  </div>
                  <span>₹{idleFee}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/10 font-bold text-xl">
              <span>Total Current</span>
              <span>₹{totalCost}</span>
            </div>
          </div>

          <Button 
            size="lg" 
            variant={isComplete ? "destructive" : "hero"}
            className={cn("w-full shadow-glow rounded-xl h-14", isComplete ? "" : "")}
            onClick={() => {
              if (isComplete) {
                toast.success("Notification sent to valet. Your car will be moved shortly.");
              } else {
                toast.success("Charging manually stopped.");
              }
            }}
          >
            {isComplete ? "Move Car Now" : "Stop Charging"}
          </Button>
        </div>
      </div>
    </div>
  );
}
