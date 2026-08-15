import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function FloatingNav() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4"
    >
      <nav className="glass-strong shadow-elegant flex w-full max-w-5xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] shadow-glow">
            <Car className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-base font-bold tracking-tight">SmartPark<span className="gradient-text">.AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/register">Book</Link>
          </Button>
        </div>
      </nav>
    </motion.header>
  );
}