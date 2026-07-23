import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/exit")({
  head: () => ({ meta: [{ title: "Exit gate — SmartPark AI" }] }),
  component: ExitPage,
});

function ExitPage() {
  const nav = useNavigate();
  return (
    <Screen>
      <TopBar title="Exit gate pass" />
      <div className="px-5 pt-4 text-center">
        <div className="rounded-3xl bg-white shadow-elegant border border-border p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Show this at the gate</div>
          <div className="mt-4 inline-block p-3 rounded-2xl border border-border">
            <QRCodeSVG value="SP-EXIT-24081" size={200} bgColor="#ffffff" fgColor="#111827" level="H" />
          </div>
          <div className="mt-4 font-mono text-sm">SP-EXIT-24081</div>
          <div className="mt-2 text-sm text-muted-foreground">Barrier lifts automatically after scan. Drive safe!</div>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Time parked</span>
            <span className="font-semibold">2h 41m</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold">₹180</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Refund (unused 19 min)</span>
            <span className="font-semibold text-secondary">− ₹19</span>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3">
          <Button size="lg" className="w-full h-12 rounded-full" onClick={() => nav({ to: "/rating" })}>Done · Rate your visit</Button>
        </div>
      </div>
    </Screen>
  );
}
