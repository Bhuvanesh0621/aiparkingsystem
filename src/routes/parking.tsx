import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Navigation, ShieldCheck, Zap, Clock, MapPin, Sparkles } from "lucide-react";
import { Screen, TopBar, StatusPill } from "@/components/mobile/shell";
import { lots } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/parking")({
  head: () => ({ meta: [{ title: "Parking details — SmartPark AI" }] }),
  component: ParkingPage,
});

function ParkingPage() {
  const l = lots[0];
  return (
    <Screen padBottom={false} className="pb-32">
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/15">
        <TopBar transparent back />
        <div className="absolute inset-0 grid place-items-center text-8xl opacity-90">{l.hero}</div>
      </div>
      <div className="relative -mt-6 rounded-t-3xl bg-background p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{l.name}</h1>
            <div className="text-sm text-muted-foreground truncate flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {l.address}</div>
          </div>
          <StatusPill tone="success"><Zap className="h-3 w-3" /> {l.available}/{l.total} free</StatusPill>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { k: `${l.distanceKm} km`, v: "Distance" },
            { k: `${l.etaMin} min`, v: "Drive time" },
            { k: `₹${l.pricePerHour}/hr`, v: "Rate" },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-border p-3">
              <div className="font-semibold">{s.k}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /> <span className="font-semibold">{l.rating}</span></div>
          <span className="text-muted-foreground">· 2,148 reviews</span>
        </div>

        <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> AI insight
          </div>
          <p className="mt-1 text-sm">Book by 2:30 PM to get a covered EV bay near Gate B. Availability drops fast after 4 PM.</p>
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold mb-2">Amenities</div>
          <div className="flex flex-wrap gap-2">
            {l.amenities.map((a) => (
              <span key={a} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium">{a}</span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold mb-2">Slots on Floor B</div>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const status = i === 5 ? "you" : i % 5 === 0 ? "occupied" : i % 7 === 0 ? "reserved" : "available";
              const c = status === "available" ? "bg-secondary/15 border-secondary text-secondary" :
                        status === "occupied" ? "bg-muted border-border text-muted-foreground" :
                        status === "reserved" ? "bg-warning/20 border-warning/50 text-[color:oklch(0.55_0.15_60)]" :
                        "bg-primary text-primary-foreground border-primary shadow-elegant";
              return (
                <div key={i} className={`aspect-square rounded-lg border-2 text-[10px] font-bold grid place-items-center ${c}`}>
                  {status === "you" ? "★" : `B${i + 1}`}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-secondary" /> Free</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-warning" /> Reserved</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-muted" /> Occupied</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary" /> AI pick</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-30 flex justify-center px-4 pb-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3 flex items-center gap-3">
          <div>
            <div className="text-xs text-muted-foreground">From</div>
            <div className="text-lg font-bold">₹{l.pricePerHour}<span className="text-xs text-muted-foreground font-normal">/hr</span></div>
          </div>
          <Button asChild size="lg" className="ml-auto h-12 rounded-full px-6">
            <Link to="/booking/schedule">Book slot</Link>
          </Button>
        </div>
      </div>
    </Screen>
  );
}
