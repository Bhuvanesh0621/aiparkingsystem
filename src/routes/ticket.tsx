import { createFileRoute, Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { Share2, Download, MapPin } from "lucide-react";
import { bookings } from "@/lib/mock-data";

export const Route = createFileRoute("/ticket")({
  head: () => ({ meta: [{ title: "Your parking ticket — SmartPark AI" }] }),
  component: TicketPage,
});

function TicketPage() {
  const b = bookings[0];
  return (
    <Screen>
      <TopBar title="Parking ticket" right={
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"><Share2 className="h-5 w-5" /></button>
      } />
      <div className="px-5 pt-4 pb-8">
        <div className="rounded-3xl overflow-hidden shadow-elegant">
          <div className="bg-gradient-to-br from-primary to-[color:oklch(0.6_0.2_230)] text-white px-5 py-6">
            <div className="text-xs uppercase tracking-wider opacity-90 font-semibold">SmartPark pass</div>
            <div className="mt-2 text-lg font-semibold">{b.lotName}</div>
            <div className="text-sm opacity-90">Booking {b.id}</div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center rounded-2xl bg-white/15 p-3">
              <div><div className="text-[10px] opacity-80 uppercase">Slot</div><div className="font-bold text-lg">{b.slot}</div></div>
              <div><div className="text-[10px] opacity-80 uppercase">Floor</div><div className="font-bold text-lg">{b.floor}</div></div>
              <div><div className="text-[10px] opacity-80 uppercase">Hours</div><div className="font-bold text-lg">{b.hours}</div></div>
            </div>
          </div>

          <div className="relative bg-white">
            <div className="absolute -top-3 left-0 right-0 flex justify-between px-2">
              {Array.from({ length: 16 }).map((_, i) => <span key={i} className="h-6 w-6 rounded-full bg-background" />)}
            </div>
            <div className="py-8 flex flex-col items-center">
              <div className="p-3 rounded-2xl border border-border">
                <QRCodeSVG value={b.qr} size={180} bgColor="#ffffff" fgColor="#111827" level="H" />
              </div>
              <div className="mt-3 font-mono text-sm text-muted-foreground">{b.qr}</div>
              <div className="mt-1 text-xs text-muted-foreground">Scan at the gate to enter</div>
            </div>
          </div>

          <div className="bg-white border-t border-dashed border-border px-5 py-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Vehicle</div>
              <div className="font-semibold">{b.vehicle}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Amount</div>
              <div className="font-semibold">₹{b.amount}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Start</div>
              <div className="font-semibold">{new Date(b.start).toLocaleString("en", { hour: "numeric", minute: "2-digit" })}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Ends</div>
              <div className="font-semibold">{new Date(b.end).toLocaleString("en", { hour: "numeric", minute: "2-digit" })}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-full"><Download className="h-4 w-4" /> Save</Button>
          <Button asChild className="h-12 rounded-full"><Link to="/navigate"><MapPin className="h-4 w-4" /> Navigate</Link></Button>
        </div>
      </div>
    </Screen>
  );
}
