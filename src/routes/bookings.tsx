import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Screen, TopBar, BottomNav, StatusPill } from "@/components/mobile/shell";
import { bookings } from "@/lib/mock-data";
import { Clock, MapPin, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/bookings")({
  head: () => ({ meta: [
    { title: "My bookings — SmartPark AI" },
    { name: "description", content: "Manage upcoming, active and past parking bookings." },
  ] }),
  component: BookingsPage,
});

const tabs = ["Upcoming", "Active", "Past"] as const;
type Tab = typeof tabs[number];

function BookingsPage() {
  const [tab, setTab] = useState<Tab>("Active");
  const list = bookings.filter((b) =>
    tab === "Active" ? b.status === "active" :
    tab === "Upcoming" ? b.status === "upcoming" :
    b.status === "completed" || b.status === "cancelled");

  return (
    <Screen>
      <TopBar title="My bookings" back={false} />
      <div className="px-5 pt-2">
        <div className="grid grid-cols-3 rounded-2xl bg-muted p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`h-10 rounded-xl text-sm font-medium transition ${tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {list.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No {tab.toLowerCase()} bookings yet.
              <div className="mt-3"><Link to="/map" className="text-primary font-semibold">Find parking →</Link></div>
            </div>
          )}
          {list.map((b) => (
            <Link key={b.id} to="/ticket" className="block rounded-3xl border border-border bg-card p-4 hover:border-primary transition">
              <div className="flex items-center justify-between">
                <StatusPill tone={b.status === "active" ? "primary" : b.status === "upcoming" ? "warning" : b.status === "completed" ? "success" : "danger"}>
                  {b.status[0].toUpperCase() + b.status.slice(1)}
                </StatusPill>
                <div className="text-xs text-muted-foreground font-mono">{b.id}</div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-2xl">🅿️</div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{b.lotName}</div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Slot {b.slot} · {b.floor}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(b.start).toLocaleString("en", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                <span className="font-semibold">₹{b.amount}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </Screen>
  );
}
