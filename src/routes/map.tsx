import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SlidersHorizontal, Star, Navigation, Zap, ShieldCheck } from "lucide-react";
import { Screen, BottomNav } from "@/components/mobile/shell";
import { lots } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [
    { title: "Nearby parking — SmartPark AI" },
    { name: "description", content: "Explore live parking near you on the map." },
  ] }),
  component: MapPage,
});

const filters = ["All", "EV Charge", "Covered", "24/7", "Under ₹50"];

function MapPage() {
  const [f, setF] = useState("All");
  return (
    <Screen padBottom>
      <div className="relative h-[52vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#e0ecff,#e6faf1)]" />
        <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 400 400" preserveAspectRatio="none">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={"h" + i} x1="0" x2="400" y1={i * 22} y2={i * 22} stroke="#cbd5e1" strokeWidth="0.4" />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={"v" + i} y1="0" y2="400" x1={i * 22} x2={i * 22} stroke="#cbd5e1" strokeWidth="0.4" />
          ))}
          <path d="M0 220 Q 120 180 220 240 T 400 200" stroke="#94a3b8" strokeWidth="4" fill="none" />
          <path d="M60 0 Q 100 140 200 200 T 320 400" stroke="#94a3b8" strokeWidth="3" fill="none" />
        </svg>

        {lots.map((l, i) => (
          <Link
            key={l.id}
            to="/parking"
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${20 + (i * 15) % 70}%`, top: `${25 + (i * 22) % 55}%` }}
          >
            <div className="rounded-full bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 shadow-elegant flex items-center gap-1">
              ₹{l.pricePerHour}
            </div>
          </Link>
        ))}

        <div className="absolute top-4 inset-x-4 flex gap-2">
          <div className="flex-1 flex items-center gap-2 h-12 rounded-full bg-white shadow-elegant px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search a place" className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-elegant">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white shadow-elegant">
          <Navigation className="h-4 w-4 text-primary" />
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-3xl bg-background pt-5 pb-3">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
        <div className="mt-4 px-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{lots.length} lots nearby</h2>
            <span className="text-xs text-muted-foreground">Sorted by distance</span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((t) => (
              <button
                key={t}
                onClick={() => setF(t)}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${f === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-3 px-5">
          {lots.map((l) => (
            <Link key={l.id} to="/parking" className="flex gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary transition">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-muted text-3xl">{l.hero}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{l.name}</div>
                  <div className="text-xs text-secondary font-semibold flex items-center gap-0.5 shrink-0"><Zap className="h-3 w-3" /> {l.available}</div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{l.address}</div>
                <div className="mt-1.5 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" /> {l.rating}</span>
                  <span className="text-muted-foreground">{l.distanceKm} km · {l.etaMin} min</span>
                  <span className="ml-auto font-semibold">₹{l.pricePerHour}/hr</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </Screen>
  );
}
