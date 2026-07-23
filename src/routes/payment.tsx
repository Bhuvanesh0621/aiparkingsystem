import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Screen, TopBar } from "@/components/mobile/shell";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Smartphone, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/payment")({
  head: () => ({ meta: [{ title: "Payment — SmartPark AI" }] }),
  component: PaymentPage,
});

const methods = [
  { id: "card", icon: CreditCard, label: "Visa •• 4242", sub: "Expires 08/28", badge: "Default" },
  { id: "upi", icon: Smartphone, label: "UPI", sub: "aarav@okhdfc" },
  { id: "wallet", icon: Wallet, label: "SmartPark Wallet", sub: "₹1,240 available" },
];

function PaymentPage() {
  const [sel, setSel] = useState("card");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const pay = () => { setBusy(true); setTimeout(() => nav({ to: "/payment-success" }), 1200); };

  return (
    <Screen>
      <TopBar title="Payment" />
      <div className="px-5 pt-4">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[color:oklch(0.6_0.2_230)] text-white p-5 shadow-elegant">
          <div className="text-xs opacity-90 uppercase tracking-wider">Amount to pay</div>
          <div className="mt-1 text-4xl font-bold">₹180</div>
          <div className="mt-1 text-xs opacity-90">Phoenix MarketCity · Slot B14 · 3 hrs</div>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Payment method</div>
          <div className="space-y-2">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSel(m.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition ${sel === m.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${sel === m.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{m.label}</div>
                    {m.badge && <span className="rounded-full bg-secondary/15 text-secondary text-[10px] font-semibold px-2 py-0.5">{m.badge}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{m.sub}</div>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 ${sel === m.id ? "border-primary bg-primary" : "border-border"}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-muted p-4 flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          Payments are secured with 256-bit encryption. Refunds arrive in 3-5 business days.
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 flex justify-center px-4 pb-4">
        <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-elegant p-3">
          <Button size="lg" className="w-full h-12 rounded-full" onClick={pay} disabled={busy}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : "Pay ₹180 securely"}
          </Button>
        </div>
      </div>
    </Screen>
  );
}
