import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Car, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { CyberBackground } from "./cyber-background";

export function AuthLayout({
  title, subtitle, children, footer,
}: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background bg-hero overflow-hidden">
      <CyberBackground />
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-between p-10 border-r border-border/40">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] shadow-glow">
              <Car className="h-5 w-5 text-white" />
            </span>
            <span className="font-bold">SmartPark<span className="gradient-text">.AI</span></span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-md"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-secondary" /> AI-powered smart parking
            </div>
            <h1 className="font-display text-4xl xl:text-5xl font-bold tracking-tight leading-tight">
              Parking that <span className="gradient-text">predicts</span> before you arrive.
            </h1>
            <p className="mt-4 text-muted-foreground">
              Live slot availability, one-tap booking, QR access and predictive routing — built for modern cities.
            </p>
            <div className="mt-10 glass rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#2563EB", "#38BDF8", "#22C55E"].map((c, i) => (
                    <div key={i} className="h-9 w-9 rounded-full border-2 border-background" style={{ background: c }} />
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">12,400+ drivers</div>
                  <div className="text-muted-foreground text-xs">parked with SmartPark this week</div>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="text-xs text-muted-foreground">© 2026 SmartPark AI · All systems operational</div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md glass-strong rounded-3xl p-8 shadow-elegant"
          >
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--primary),var(--secondary))]">
                <Car className="h-4 w-4 text-white" />
              </span>
              <span className="font-bold text-sm">SmartPark<span className="gradient-text">.AI</span></span>
            </Link>
            <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          </motion.div>
        </div>
      </div>
    </div>
  );
}