import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/navigate")({
  head: () => ({ meta: [{ title: "Navigate to parking — SmartPark AI" }] }),
  component: NavigatePage,
});

function NavigatePage() {
  return (
    <Screen padBottom={false}>
      <div className="relative h-[65vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#e0ecff,#e6faf1)]" />
        <svg viewBox="0 0 400 500" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={"h" + i} x1="0" x2="400" y1={i * 22} y2={i * 22} stroke="#cbd5e1" strokeWidth="0.4" />
          ))}
          <path d="M40 460 Q 120 380 180 320 T 300 160 Q 340 130 360 80" stroke="#2563EB" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="460" r="10" fill="#2563EB" />
          <circle cx="40" cy="460" r="18" fill="#2563EB" fillOpacity="0.25" />
          <circle cx="360" cy="80" r="12" fill="#10B981" />
        </svg>
        <TopBar transparent back />
      </div>

      <div className="relative -mt-8 rounded-t-3xl bg-background p-5 pb-24">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Navigation className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">4 min · 0.8 km</div>
            <div className="text-sm text-muted-foreground">Arriving by 1:56 PM</div>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary font-bold">↰</div>
            <div>
              <div className="font-semibold">Turn left onto LBS Marg</div>
              <div className="text-xs text-muted-foreground">In 200 m</div>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
          <div className="text-2xl">🏬</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">Phoenix MarketCity</div>
            <div className="text-xs text-muted-foreground">Slot B14 · Gate B</div>
          </div>
          <span className="rounded-full bg-secondary/15 text-secondary text-[11px] font-semibold px-2.5 py-1">Held for you</span>
        </div>

        <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
          <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3 flex gap-2">
            <Button asChild variant="outline" className="flex-1 h-12 rounded-full"><Link to="/ticket">Show QR</Link></Button>
            <Button asChild className="flex-1 h-12 rounded-full"><Link to="/status">I've arrived</Link></Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}
