import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ShieldAlert, HeartPulse, Wrench, Truck, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useStore, store, EmergencyType } from "@/lib/store";
import { auth } from "@/lib/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const emergencyOptions = [
  { id: "security" as EmergencyType, label: "Call Security", icon: ShieldAlert, desc: "Notify security team instantly", color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "medical" as EmergencyType, label: "Medical Assistance", icon: HeartPulse, desc: "Request immediate medical help", color: "text-red-400", bg: "bg-red-400/10" },
  { id: "breakdown" as EmergencyType, label: "Vehicle Breakdown", icon: Wrench, desc: "Report dead battery, flat tire, etc.", color: "text-orange-400", bg: "bg-orange-400/10" },
  { id: "tow" as EmergencyType, label: "Tow Service", icon: Truck, desc: "Request towing assistance", color: "text-purple-400", bg: "bg-purple-400/10" },
];

export function SOSButton() {
  const { bookings = [], emergencyRequests = [] } = useStore();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"options" | "status">("options");

  const isUser = auth.isUser();
  const currentUser = auth.getCurrentUser();
  const activeBooking = bookings.find((b) => b.status === "active" && b.userId === currentUser?.id);
  const activeRequest = emergencyRequests.find(
    (r) => r.bookingId === activeBooking?.id && (r.status === "pending" || r.status === "dispatched")
  );

  useEffect(() => {
    if (activeRequest) {
      setActiveTab("status");
    } else {
      setActiveTab("options");
    }
  }, [activeRequest]);

  const handleRequest = (type: EmergencyType) => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;
    
    // Find the full user object to get the name
    const users = store.getState().users;
    const userDetails = users.find(u => u.id === currentUser.id);
    const userName = userDetails?.name || "Unknown User";

    const newRequest = {
      type,
      userId: currentUser.id,
      userName: userName,
      bookingId: activeBooking?.id || "N/A",
      slotNumber: activeBooking?.slotNumber || "N/A",
      floor: activeBooking?.floor || 0,
      vehicleNumber: activeBooking?.vehicleNumber || "N/A",
      vehicleType: activeBooking?.vehicleType || "car",
      status: "pending" as const,
    };

    store.createEmergencyRequest(newRequest);
    toast.success("Emergency request sent. Help is on the way.");
  };

  if (!isUser) return null;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6"
          >
            <button
              onClick={() => setOpen(true)}
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/20 transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20" />
              <AlertCircle className="h-8 w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-[2rem] border-t border-border/50 bg-background/80 backdrop-blur-xl sm:max-w-md sm:mx-auto">
          <SheetHeader className="mb-6 text-left relative">
             <div className="mx-auto mt-[-10px] mb-4 h-1.5 w-12 rounded-full bg-muted/50" />
             <SheetTitle className="text-2xl font-bold flex items-center gap-2">
               <AlertCircle className="h-6 w-6 text-red-500" />
               Emergency Assistance
             </SheetTitle>
             <SheetDescription>
               {activeBooking 
                 ? `Slot ${activeBooking.slotNumber} • Floor ${activeBooking.floor} • ${activeBooking.vehicleNumber}`
                 : "General Emergency Assistance"}
             </SheetDescription>
          </SheetHeader>

          <AnimatePresence mode="wait">
            {activeTab === "options" && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid gap-3 pb-8"
              >
                {emergencyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleRequest(opt.id)}
                    className="flex items-center gap-4 rounded-xl border border-border/40 bg-white/5 p-4 text-left transition-all hover:bg-white/10 active:scale-[0.98]"
                  >
                    <div className={`rounded-full p-3 ${opt.bg}`}>
                      <opt.icon className={`h-6 w-6 ${opt.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{opt.label}</div>
                      <div className="text-sm text-muted-foreground">{opt.desc}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </motion.div>
            )}

            {activeTab === "status" && activeRequest && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="pb-8"
              >
                <div className="rounded-xl border border-border/40 bg-white/5 p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20" />
                      <div className="rounded-full bg-red-500/10 p-4 text-red-500">
                        {activeRequest.status === "pending" ? (
                           <AlertCircle className="h-10 w-10 animate-pulse" />
                        ) : (
                           <CheckCircle2 className="h-10 w-10 text-success" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">
                    {activeRequest.status === "pending" ? "Request Received" : "Help is on the way"}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    {activeRequest.status === "pending" 
                      ? "We've notified the team. Stay near your vehicle."
                      : `Your request has been dispatched. ${activeRequest.assignedStaff ? `Assigned to: ${activeRequest.assignedStaff}` : ""}`
                    }
                  </p>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => {
                        store.updateEmergencyRequestStatus(activeRequest.id, { status: "resolved" });
                        toast.success("Emergency request cancelled.");
                    }}>
                      Cancel Request
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </>
  );
}
