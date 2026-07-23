import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Ticket, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/payment-success")({
  head: () => ({ meta: [{ title: "Payment successful — SmartPark AI" }] }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 15 }}
          className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-secondary to-emerald-500 shadow-elegant text-white"
        >
          <Check className="h-14 w-14" strokeWidth={3} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h1 className="mt-8 text-3xl font-bold">Payment successful</h1>
          <p className="mt-2 text-muted-foreground">
            Your booking <span className="font-mono text-foreground">SP-24081</span> is confirmed.<br />
            A QR pass has been added to your wallet.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-4 text-left flex items-center gap-3">
            <div className="text-2xl">🏬</div>
            <div className="min-w-0">
              <div className="font-semibold truncate">Phoenix MarketCity</div>
              <div className="text-xs text-muted-foreground">Slot B14 · Today 2:00 PM</div>
            </div>
            <div className="ml-auto font-bold">₹180</div>
          </div>
          <div className="mt-8 grid gap-2">
            <Button asChild size="lg" className="h-12 rounded-full"><Link to="/ticket"><Ticket className="h-4 w-4" /> View ticket</Link></Button>
            <Button asChild variant="ghost" size="lg" className="h-12 rounded-full"><Link to="/navigate"><MapPin className="h-4 w-4" /> Navigate to lot</Link></Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
