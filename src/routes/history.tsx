import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar, StatusPill } from "@/components/mobile/shell";
import { bookings } from "@/lib/mock-data";
import { ChevronRight, Clock } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [
    { title: "Parking history — SmartPark AI" },
    { name: "description", content: "Every past parking session, ready to review." },
  ] }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <Screen>
      <TopBar title="Parking history" />
      <div className="px-5 pt-4 pb-6 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "34", v: "Sessions" },
            { k: "128h", v: "Total parked" },
            { k: "₹4,320", v: "Spent" },
          ].map((s) => (
            <div key={s.v} className="rounded-2xl border border-border bg-card p-3 text-center">
              <div className="text-lg font-bold">{s.k}</div>
              <div className="text-[11px] text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>

        {bookings.map((b) => (
          <Link key={b.id} to="/ticket" className="block rounded-3xl border border-border bg-card p-4 hover:border-primary transition">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono text-muted-foreground">{b.id}</div>
              <StatusPill tone={b.status === "active" ? "primary" : b.status === "upcoming" ? "warning" : b.status === "completed" ? "success" : "danger"}>
                {b.status[0].toUpperCase() + b.status.slice(1)}
              </StatusPill>
            </div>
            <div className="mt-2 font-semibold truncate">{b.lotName}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(b.start).toLocaleString("en", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="font-semibold text-foreground">₹{b.amount}</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
