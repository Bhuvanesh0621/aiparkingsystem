import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { Car, Bike, Zap, ArrowRight, Minus, Plus } from "lucide-react";
import { user } from "@/lib/mock-data";

export const Route = createFileRoute("/booking/schedule")({
  head: () => ({ meta: [{ title: "Schedule booking — SmartPark AI" }] }),
  component: SchedulePage,
});

const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i);
  return { d: d.toLocaleDateString("en", { weekday: "short" }), n: d.getDate(), full: d.toISOString().slice(0, 10) };
});

function SchedulePage() {
  const [day, setDay] = useState(0);
  const [start, setStart] = useState("14:00");
  const [hours, setHours] = useState(3);
  const [vehIdx, setVehIdx] = useState(0);
  const [type, setType] = useState<"car" | "bike" | "ev">("car");

  return (
    <Screen>
      <TopBar title="Schedule" subtitle="Phoenix MarketCity" />
      <div className="px-5 pt-4 pb-6 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Select date</div>
          <div className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d, i) => (
              <button
                key={d.full}
                onClick={() => setDay(i)}
                className={`min-w-[60px] rounded-2xl border p-3 text-center transition ${i === day ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
              >
                <div className="text-[10px] uppercase font-semibold opacity-80">{d.d}</div>
                <div className="mt-1 text-xl font-bold">{d.n}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Start time</div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {times.map((t) => (
              <button
                key={t}
                onClick={() => setStart(t)}
                className={`h-11 rounded-xl border text-sm font-medium transition ${t === start ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duration</div>
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <button onClick={() => setHours(Math.max(1, hours - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-muted"><Minus className="h-4 w-4" /></button>
            <div className="text-center">
              <div className="text-3xl font-bold">{hours}<span className="text-lg text-muted-foreground"> hr</span></div>
              <div className="text-xs text-muted-foreground">ends {addHours(start, hours)}</div>
            </div>
            <button onClick={() => setHours(Math.min(12, hours + 1))} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"><Plus className="h-4 w-4" /></button>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Vehicle type</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { k: "car" as const, icon: Car, label: "Car" },
              { k: "bike" as const, icon: Bike, label: "Bike" },
              { k: "ev" as const, icon: Zap, label: "EV" },
            ].map((v) => (
              <button
                key={v.k}
                onClick={() => setType(v.k)}
                className={`flex flex-col items-center gap-2 rounded-2xl border py-4 transition ${type === v.k ? "border-primary bg-primary/8" : "border-border bg-card"}`}
              >
                <v.icon className={`h-5 w-5 ${type === v.k ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Vehicle</div>
          <div className="mt-3 space-y-2">
            {user.vehicles.map((v, i) => (
              <button
                key={v.plate}
                onClick={() => setVehIdx(i)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition ${vehIdx === i ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-muted"><Car className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{v.model}</div>
                  <div className="text-xs text-muted-foreground">{v.plate}</div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 ${vehIdx === i ? "border-primary bg-primary" : "border-border"}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3 flex items-center gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-bold">₹{60 * hours}</div>
          </div>
          <Button asChild size="lg" className="ml-auto h-12 rounded-full px-6">
            <Link to="/booking/summary">Continue <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </Screen>
  );
}

function addHours(t: string, h: number) {
  const [hh, mm] = t.split(":").map(Number);
  const total = hh * 60 + mm + h * 60;
  const H = Math.floor(total / 60) % 24;
  return `${String(H).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
