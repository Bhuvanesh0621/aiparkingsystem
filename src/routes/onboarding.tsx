import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, CalendarClock, Sparkles, ArrowRight, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started — SmartPark AI" }] }),
  component: OnboardingPage,
});

const steps = [
  { icon: MapPin, title: "Find nearby parking", body: "See live availability at hundreds of lots around you with real-time pricing.", accent: "from-primary to-sky-400" },
  { icon: CalendarClock, title: "Book in seconds", body: "Reserve your slot, get a QR pass, and skip the queue at the gate.", accent: "from-secondary to-emerald-400" },
  { icon: Sparkles, title: "Smarter with AI", body: "SmartPark suggests the fastest, cheapest, and most convenient bay for you.", accent: "from-indigo-500 to-primary" },
];

function OnboardingPage() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const step = steps[i];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-elegant">
              <Car className="h-4 w-4" />
            </span>
            <span className="font-semibold">SmartPark<span className="text-primary">.AI</span></span>
          </div>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Skip</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              <div className={`mx-auto grid h-56 w-56 place-items-center rounded-[36px] bg-gradient-to-br ${step.accent} shadow-elegant text-white`}>
                <step.icon className="h-24 w-24" strokeWidth={1.3} />
              </div>
              <h1 className="mt-10 text-3xl font-bold tracking-tight">{step.title}</h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">{step.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex justify-center gap-2">
            {steps.map((_, k) => (
              <span
                key={k}
                className={`h-1.5 rounded-full transition-all ${k === i ? "w-8 bg-primary" : "w-1.5 bg-border"}`}
              />
            ))}
          </div>
          <Button
            size="lg"
            className="w-full h-12 rounded-full text-base"
            onClick={() => (i === steps.length - 1 ? nav({ to: "/login" }) : setI(i + 1))}
          >
            {i === steps.length - 1 ? "Get started" : "Next"} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already a member? <Link to="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
