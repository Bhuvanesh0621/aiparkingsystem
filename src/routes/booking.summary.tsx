import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { MapPin, Car, Clock, Sparkles, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/booking/summary")({
  head: () => ({ meta: [{ title: "Review booking — SmartPark AI" }] }),
  component: SummaryPage,
});

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function SummaryPage() {
  return (
    <Screen>
      <TopBar title="Review & confirm" />
      <div className="px-5 pt-4 space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Parking</div>
              <div className="mt-1 font-semibold truncate">Phoenix MarketCity</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> LBS Rd, Kurla West</div>
            </div>
            <div className="text-4xl">🏬</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted p-3 text-center">
            <div><div className="text-xs text-muted-foreground">Slot</div><div className="font-bold mt-0.5">B14</div></div>
            <div><div className="text-xs text-muted-foreground">Floor</div><div className="font-bold mt-0.5">B2</div></div>
            <div><div className="text-xs text-muted-foreground">Gate</div><div className="font-bold mt-0.5">B</div></div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Session</div>
          <div className="divide-y divide-border mt-1">
            <Row label="Date" value="Thu, 23 Jul 2026" />
            <Row label="Start" value="2:00 PM" />
            <Row label="Duration" value="3 hours" />
            <Row label="Ends" value="5:00 PM" />
            <Row label="Vehicle" value="MH12 AB 4521" mono />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Price breakdown</div>
          <div className="divide-y divide-border mt-1">
            <Row label="3 × ₹60/hr" value="₹180" />
            <Row label="Platform fee" value="₹5" />
            <Row label="Gold discount" value="− ₹5" />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="font-semibold">Total</div>
            <div className="text-xl font-bold text-primary">₹180</div>
          </div>
        </div>

        <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-primary mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Free cancellation</span> up to 30 minutes before your start time.
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3 flex items-center gap-3">
          <div>
            <div className="text-xs text-muted-foreground">To pay</div>
            <div className="text-lg font-bold">₹180</div>
          </div>
          <Button asChild size="lg" className="ml-auto h-12 rounded-full px-6">
            <Link to="/payment">Proceed to pay</Link>
          </Button>
        </div>
      </div>
    </Screen>
  );
}
