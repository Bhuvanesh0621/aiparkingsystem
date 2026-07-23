import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { Home, CalendarClock, MapPin, Bell, User, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/bookings", label: "Bookings", icon: CalendarClock },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Screen({
  children,
  className,
  bg = "app",
  padBottom = true,
}: {
  children: ReactNode;
  className?: string;
  bg?: "app" | "white" | "hero";
  padBottom?: boolean;
}) {
  const bgClass =
    bg === "white" ? "bg-white" : bg === "hero" ? "bg-background bg-hero" : "bg-background";
  return (
    <div className={cn("min-h-screen w-full", bgClass)}>
      <div className={cn("mx-auto w-full max-w-md min-h-screen flex flex-col relative", className)}>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className={cn("flex-1 flex flex-col", padBottom && "pb-24")}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function TopBar({
  title,
  subtitle,
  back = true,
  right,
  transparent = false,
}: {
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  transparent?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center gap-3 px-4 h-14",
        transparent ? "bg-transparent" : "bg-background/85 backdrop-blur-md border-b border-border/70",
      )}
    >
      {back && (
        <button
          onClick={() => router.history.back()}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted transition-colors -ml-2"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {title && <div className="font-semibold truncate">{title}</div>}
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
      </div>
      {right}
    </header>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex justify-center px-3 pb-3 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-border shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.12)] px-2 py-1.5">
        <ul className="grid grid-cols-5">
          {tabs.map((t) => {
            const active = pathname === t.to || (t.to !== "/home" && pathname.startsWith(t.to));
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className={cn(
                    "grid place-items-center h-8 w-14 rounded-full transition-all",
                    active ? "bg-primary/12" : "",
                  )}>
                    <t.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function StatusPill({
  tone = "primary",
  children,
  className,
}: {
  tone?: "primary" | "success" | "warning" | "muted" | "danger";
  children: ReactNode;
  className?: string;
}) {
  const map = {
    primary: "bg-primary/10 text-primary",
    success: "bg-secondary/12 text-secondary",
    warning: "bg-warning/15 text-[color:oklch(0.55_0.15_60)]",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        map[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}