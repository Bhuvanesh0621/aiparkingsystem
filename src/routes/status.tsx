import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar, StatusPill } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { Clock, Zap, MapPin, ArrowRight } from "lucide-react";
import { bookings } from "@/lib/mock-data";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "Session status — SmartPark AI" }] }),
  component: StatusPage,
});

function StatusPage() {
  const b = bookings[0];
  const progress = 42;
  return (
    <Screen>
      <TopBar title="Active session" />
      <div className="px-5 pt-4 space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[color:oklch(0.6_0.2_230)] p-6 text-white shadow-elegant text-center">
          <StatusPill className="!bg-white/20 !text-white" tone="primary">Parked · {b.slot}</StatusPill>
          <div className="mt-4 text-5xl font-bold tabular-nums">01:24:32</div>
          <div className="mt-1 text-xs opacity-90">Time elapsed of 3 hours</div>
          <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1 flex justify-between text-[11px] opacity-90">
            <span>Started 2:00 PM</span>
            <span>Ends 5:00 PM</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Location</div>
          <div className="mt-1 font-semibold">{b.lotName}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Slot {b.slot} · Floor {b.floor}</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-muted p-3"><div className="text-xs text-muted-foreground">Rate</div><div className="font-bold mt-0.5">₹60/hr</div></div>
            <div className="rounded-2xl bg-muted p-3"><div className="text-xs text-muted-foreground">Paid</div><div className="font-bold mt-0.5">₹180</div></div>
            <div className="rounded-2xl bg-muted p-3"><div className="text-xs text-muted-foreground">Left</div><div className="font-bold mt-0.5">1h 36m</div></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12 rounded-full"><Link to="/timer"><Clock className="h-4 w-4" /> Extend</Link></Button>
          <Button asChild className="h-12 rounded-full"><Link to="/exit">End session <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </Screen>
  );
}
