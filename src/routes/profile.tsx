import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar, BottomNav } from "@/components/mobile/shell";
import { user } from "@/lib/mock-data";
import { Car, CreditCard, Bell, ShieldCheck, HelpCircle, LogOut, ChevronRight, Wallet, Gift, Star, Plus } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profile — SmartPark AI" },
    { name: "description", content: "Manage your vehicles, payments, wallet and preferences." },
  ] }),
  component: ProfilePage,
});

function Row({ icon: Icon, title, desc, right, tone = "muted" }: any) {
  const tones: Record<string, string> = { muted: "bg-muted text-muted-foreground", primary: "bg-primary/10 text-primary", secondary: "bg-secondary/12 text-secondary" };
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {desc && <div className="text-xs text-muted-foreground truncate">{desc}</div>}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
}

function ProfilePage() {
  return (
    <Screen>
      <TopBar title="Profile" back={false} />
      <div className="px-5 pt-2 pb-6 space-y-5">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-[color:oklch(0.6_0.2_230)] text-white p-5 shadow-elegant">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 grid place-items-center text-2xl font-bold">A</div>
            <div className="min-w-0">
              <div className="text-lg font-bold truncate">{user.name}</div>
              <div className="text-sm opacity-90 truncate">{user.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                <Star className="h-3 w-3 fill-white" /> {user.tier} member · since {user.memberSince}
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Wallet</div>
              <div className="mt-0.5 text-xl font-bold">₹{user.wallet}</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <div className="text-[10px] uppercase tracking-wider opacity-80">Rewards</div>
              <div className="mt-0.5 text-xl font-bold">1,245 pts</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-2">
          <div className="px-3 pt-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">My vehicles</div>
            <button className="text-xs text-primary font-semibold inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>
          </div>
          {user.vehicles.map((v) => (
            <Row key={v.plate} icon={Car} title={v.model} desc={`${v.plate} · ${v.type}${v.primary ? " · Primary" : ""}`} tone="primary" />
          ))}
        </div>

        <div className="rounded-3xl border border-border bg-card p-2">
          <div className="px-3 pt-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Payment</div>
            <button className="text-xs text-primary font-semibold inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Add card</button>
          </div>
          {user.cards.map((c) => (
            <Row key={c.id} icon={CreditCard} title={`${c.brand} •• ${c.last4}`} desc={c.primary ? "Default payment method" : "Backup"} tone="secondary" />
          ))}
          <Row icon={Wallet} title="SmartPark Wallet" desc={`Balance ₹${user.wallet}`} tone="muted" />
        </div>

        <div className="rounded-3xl border border-border bg-card p-2">
          <div className="px-3 pt-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Preferences</div>
          <Row icon={Bell} title="Notifications" desc="Booking, extension, offers" tone="muted" />
          <Row icon={ShieldCheck} title="Privacy & security" desc="2FA · Biometric login" tone="muted" />
          <Row icon={Gift} title="Refer & earn" desc="Get ₹100 for every friend" tone="muted" />
          <Row icon={HelpCircle} title="Help center" tone="muted" />
        </div>

        <Link to="/login" className="block rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive p-4 text-sm font-semibold text-center inline-flex items-center justify-center gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </Link>
      </div>
      <BottomNav />
    </Screen>
  );
}
