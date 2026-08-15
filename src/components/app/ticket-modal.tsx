import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useStore, store } from "@/lib/store";

export function TicketModal() {
  const { activeTicketBookingId, bookings } = useStore();
  
  if (!activeTicketBookingId) return null;
  
  const booking = bookings.find(b => b.id === activeTicketBookingId);
  if (!booking) {
    store.closeTicket();
    return null;
  }
  
  const date = booking.startTime.split("T")[0];
  const time = new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  return (
    <Dialog open={!!activeTicketBookingId} onOpenChange={(open) => !open && store.closeTicket()}>
      <DialogContent className="glass-strong border-white/10 z-[100]">
        <DialogHeader>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/20 text-success shadow-glow mb-2">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center text-2xl">Your QR Pass</DialogTitle>
        </DialogHeader>
        <div className="text-center text-sm text-muted-foreground -mt-1">Slot {booking.slotNumber} • {date} • {time}</div>
        <div className="mx-auto mt-4 grid h-48 w-48 place-items-center rounded-2xl bg-white p-3">
          <QRCodeSVG value={`SMARTPARK|${booking.slotNumber}|${date}|${time}|${booking.vehicleNumber}`} size={168} />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">Show this QR at the gate to enter.</div>
        <Button variant="hero" className="mt-4" onClick={() => store.closeTicket()}>Done</Button>
      </DialogContent>
    </Dialog>
  );
}