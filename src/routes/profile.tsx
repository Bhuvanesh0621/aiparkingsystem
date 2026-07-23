import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera, Car, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — SmartPark AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [dark, setDark] = useState(true);
  const [vehicles, setVehicles] = useState([
    { id: 1, no: "MH 12 AB 4521", type: "Car" },
    { id: 2, no: "MH 12 XY 9987", type: "EV" },
  ]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account, vehicles and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="glass rounded-2xl p-6 text-center h-fit">
          <div className="relative mx-auto h-24 w-24">
            <div className="h-24 w-24 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] grid place-items-center text-3xl font-bold text-white shadow-glow">AS</div>
            <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border border-white/10 grid place-items-center hover:bg-white/10">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 font-semibold text-lg">Aarav Sharma</div>
          <div className="text-xs text-muted-foreground">aarav@smartpark.ai</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Stat n="24" l="Bookings" />
            <Stat n="3" l="Vehicles" />
            <Stat n="₹4.2k" l="Spent" />
          </div>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="glass rounded-xl">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="glass rounded-2xl p-6 mt-4 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue="Aarav Sharma" />
              <Field label="Email" defaultValue="aarav@smartpark.ai" />
              <Field label="Phone" defaultValue="+91 98765 43210" />
              <Field label="City" defaultValue="Mumbai" />
            </div>
            <Button variant="hero" onClick={() => toast.success("Profile updated")}>Save changes</Button>
          </TabsContent>

          <TabsContent value="password" className="glass rounded-2xl p-6 mt-4 space-y-5 max-w-md">
            <Field label="Current password" type="password" />
            <Field label="New password" type="password" />
            <Field label="Confirm new password" type="password" />
            <Button variant="hero" onClick={() => toast.success("Password updated")}>Update password</Button>
          </TabsContent>

          <TabsContent value="vehicles" className="glass rounded-2xl p-6 mt-4 space-y-4">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
                  <Car className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{v.no}</div>
                  <div className="text-xs text-muted-foreground">{v.type}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setVehicles((xs) => xs.filter((x) => x.id !== v.id))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="glass" className="w-full" onClick={() => setVehicles((xs) => [...xs, { id: Date.now(), no: "New vehicle", type: "Car" }])}>
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          </TabsContent>

          <TabsContent value="notifications" className="glass rounded-2xl p-6 mt-4 space-y-4">
            <Toggle label="Booking confirmations" desc="Email & push on new bookings" defaultChecked />
            <Toggle label="Reminders" desc="30 min before your slot" defaultChecked />
            <Toggle label="Promotions" desc="Cashback and offers" />
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <div>
                <div className="font-medium">Dark mode</div>
                <div className="text-xs text-muted-foreground">Toggle theme (client-side)</div>
              </div>
              <Switch checked={dark} onCheckedChange={(v) => {
                setDark(v);
                document.documentElement.classList.toggle("dark", v);
                document.documentElement.classList.toggle("light", !v);
              }} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 py-2">
      <div className="font-bold text-sm">{n}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{l}</div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} className="h-11 bg-white/5" />
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}