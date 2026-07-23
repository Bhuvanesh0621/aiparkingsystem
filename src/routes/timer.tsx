import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/timer")({
  head: () => ({ meta: [{ title: "Extend session — SmartPark AI" }] }),
  component: TimerPage,
});

const options = [30, 60, 90, 120];

function TimerPage() {
  const [min, setMin] = useState(60);
  const nav = useNavigate();
  const cost = Math.round((min / 60) * 60);
  return (
    <Screen>
      <TopBar title="Extend session" />
      <div className="px-5 pt-4 space-y-6">
        <div className="text-center rounded-3xl bg-card border border-border p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Ends currently at</div>
          <div className="mt-1 text-3xl font-bold">5:00 PM</div>
          <div className="mt-3 text-xs text-primary font-semibold">→ New end time {String(5 + Math.floor(min / 60)).padStart(1, "0")}:{String(min % 60).padStart(2, "0")} PM</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Add time</div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => setMin(o)}
                className={`h-16 rounded-2xl border text-sm font-semibold transition ${o === min ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
              >
                +{o}m
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">Traffic ahead — extending by <span className="font-semibold">60 min</span> avoids ₹90 overstay fees.</div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">You'll be charged</div>
          <div className="text-2xl font-bold text-primary">₹{cost}</div>
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3">
          <Button size="lg" className="w-full h-12 rounded-full" onClick={() => { toast.success(`Extended by ${min} min`); nav({ to: "/status" }); }}>
            Confirm extension
          </Button>
        </div>
      </div>
    </Screen>
  );
}
