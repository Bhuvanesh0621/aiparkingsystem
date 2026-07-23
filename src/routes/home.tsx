import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bell, Search, MapPin, Sparkles, Zap, ArrowRight, ChevronRight, Car, Wallet, Ticket, Star, TrendingUp } from "lucide-react";
import { Screen, BottomNav, StatusPill } from "@/components/mobile/shell";
import { lots, bookings, usage7d, user } from "@/lib/mock-data";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export const Route = createFileRoute("/home")({
  head: () => ({ meta: [
    { title: "Home — SmartPark AI" },
    { name: "description", content: "Live nearby parking, AI picks and your active booking." },
  ] }),
  component: HomePage,
});

function HomePage() {
  const active = bookings.find((b) => b.status === "active");
  const nearby = lots.slice(0, 3);
  const aiPick = [...lots].sort((a, b) => b.aiScore - a.aiScore)[0];

  return (
    <Screen>
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-primary to-secondary grid place-items-center text-white font-semibold">A</div>
          <div>
            <div className="text-xs text-muted-foreground">Good afternoon</div>
            <div className="font-semibold">{user.name.split(" ")[0]} · {user.tier}</div>
          </div>
        </div>
        <Link to="/notifications" className="relative grid h-11 w-11 place-items-center rounded-full bg-card border border-border">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </Link>
      </header>

      <div className="px-5">
        <Link to="/map" className="flex items-center gap-3 h-13 rounded-2xl border border-border bg-card px-4 py-3 hover:border-primary transition">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search parking, address or lot</span>
        </Link>
      </div>

      {active && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-5 mt-5">
          <Link to="/status" className="block rounded-3xl bg-gradient-to-br from-primary to-[color:oklch(0.6_0.2_230)] p-5 text-white shadow-elegant">
            <div className="flex items-center justify-between">
              <div className="text-xs opacity-90 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" /> Active session
              </div>
              <ChevronRight className="h-4 w-4" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-lg font-semibold">{active.lotName}</div>
                <div className="text-sm opacity-90">Slot {active.slot} · {active.floor}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold tabular-nums">01:24:32</div>
                <div className="text-xs opacity-80">Ends 5:00 PM</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">₹180 paid</span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs">QR ready</span>
            </div>
          </Link>
        </motion.div>
      )}

      <div className="px-5 mt-6 grid grid-cols-4 gap-3">
        {[
          { icon: MapPin, label: "Book", to: "/map" as const, tone: "bg-primary/10 text-primary" },
          { icon: Ticket, label: "Ticket", to: "/ticket" as const, tone: "bg-secondary/12 text-secondary" },
          { icon: Wallet, label: "Wallet", to: "/profile" as const, tone: "bg-warning/15 text-[color:oklch(0.55_0.15_60)]" },
          { icon: Car, label: "History", to: "/history" as const, tone: "bg-accent text-primary" },
        ].map((a) => (
          <Link key={a.label} to={a.to} className="flex flex-col items-center gap-2">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl ${a.tone}`}>
              <a.icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="px-5 mt-6">
        <Link to="/parking" className="block rounded-3xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> AI recommendation
          </div>
          <div className="mt-2 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-semibold truncate">{aiPick.name}</div>
              <div className="text-xs text-muted-foreground truncate">{aiPick.distanceKm} km · {aiPick.etaMin} min · ₹{aiPick.pricePerHour}/hr</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl">{aiPick.hero}</div>
              <div className="text-[11px] font-semibold text-secondary flex items-center gap-1 justify-end mt-0.5">
                <TrendingUp className="h-3 w-3" /> {aiPick.aiScore}% match
              </div>
            </div>
          </div>
        </Link>
      </div>

      <section className="mt-7 px-5 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Nearby parking</h2>
        <Link to="/map" className="text-xs text-primary font-semibold inline-flex items-center gap-1">See all <ArrowRight className="h-3 w-3" /></Link>
      </section>
      <div className="mt-3 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {nearby.map((l) => (
          <Link key={l.id} to="/parking" className="min-w-[75%] shrink-0 rounded-3xl border border-border bg-card p-4 shadow-sm hover:border-primary transition">
            <div className="flex items-center justify-between">
              <div className="text-3xl">{l.hero}</div>
              <StatusPill tone={l.available > 30 ? "success" : l.available > 10 ? "warning" : "danger"}>
                <Zap className="h-3 w-3" /> {l.available} free
              </StatusPill>
            </div>
            <div className="mt-3 font-semibold truncate">{l.name}</div>
            <div className="text-xs text-muted-foreground truncate">{l.address}</div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" /> {l.rating}</span>
              <span className="text-muted-foreground">{l.distanceKm} km</span>
              <span className="font-semibold text-foreground">₹{l.pricePerHour}/hr</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-7 mx-5 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">This week</div>
            <div className="mt-1 text-2xl font-bold">21h parked</div>
          </div>
          <StatusPill tone="success">+18%</StatusPill>
        </div>
        <div className="mt-3 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usage7d}>
              <XAxis dataKey="d" axisLine={false} tickLine={false} fontSize={11} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="hrs" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <BottomNav />
    </Screen>
  );
}
