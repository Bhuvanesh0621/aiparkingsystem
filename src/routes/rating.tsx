import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/rating")({
  head: () => ({ meta: [{ title: "Rate your visit — SmartPark AI" }] }),
  component: RatingPage,
});

const tags = ["Clean bay", "Fast entry", "Good signage", "Friendly staff", "Well lit", "Easy exit"];

function RatingPage() {
  const [r, setR] = useState(5);
  const [sel, setSel] = useState<string[]>([]);
  const nav = useNavigate();
  return (
    <Screen>
      <TopBar title="Rate your visit" />
      <div className="px-5 pt-4">
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <div className="text-4xl">🏬</div>
          <div className="mt-2 font-semibold">Phoenix MarketCity</div>
          <div className="text-xs text-muted-foreground">Slot B14 · 3h 0m</div>
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setR(n)} className="p-1">
                <Star className={`h-9 w-9 ${n <= r ? "fill-warning text-warning" : "text-border"}`} />
              </button>
            ))}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Tap to rate</div>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">What went well?</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => {
              const on = sel.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => setSel(on ? sel.filter((x) => x !== t) : [...sel, t])}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <textarea rows={3} placeholder="Anything else? (optional)" className="mt-5 w-full rounded-2xl border border-border bg-card p-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
      </div>
      <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3">
          <Button size="lg" className="w-full h-12 rounded-full" onClick={() => { toast.success("Thanks for your feedback!"); nav({ to: "/home" }); }}>
            Submit rating
          </Button>
        </div>
      </div>
    </Screen>
  );
}
