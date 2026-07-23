import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard, Car, CalendarClock, History, User, Shield,
  Users, Building2, ClipboardList, Bell, Search, Menu, X, LogOut,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const userNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/slots", label: "Parking Slots", icon: Car },
  { to: "/booking", label: "New Booking", icon: CalendarClock },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
];

const adminNav = [
  { to: "/admin", label: "Overview", icon: Shield },
  { to: "/admin/parking", label: "Manage Parking", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: ClipboardList },
];

export function AppShell({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const nav = admin ? adminNav : userNav;

  return (
    <div className="min-h-screen bg-background bg-hero">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-border/50 glass-strong px-4 py-5 flex-col gap-2 transition-transform",
          "lg:flex lg:translate-x-0",
          open ? "flex translate-x-0" : "flex -translate-x-full",
        )}
      >
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] shadow-glow">
            <Car className="h-5 w-5 text-white" />
          </span>
          <span className="font-bold">SmartPark<span className="gradient-text">.AI</span></span>
        </Link>
        <div className="mt-4 px-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {admin ? "Admin" : "Menu"}
          </div>
          <div className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary/15 text-foreground border border-primary/30 shadow-elegant"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  <n.icon className={cn("h-4 w-4", active && "text-primary")} />
                  {n.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-auto px-2 space-y-1">
          <Link
            to={admin ? "/dashboard" : "/admin"}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <Shield className="h-4 w-4" />
            Switch to {admin ? "User" : "Admin"}
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Link>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 glass border-b border-border/50">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search slots, bookings, users…" className="pl-9 h-10 bg-white/5 border-white/10" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-secondary shadow-glow" />
            </Button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border/50">
              <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] grid place-items-center text-sm font-semibold text-white">
                AS
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold leading-tight">Aarav Sharma</div>
                <div className="text-xs text-muted-foreground">{admin ? "Administrator" : "Member"}</div>
              </div>
            </div>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}