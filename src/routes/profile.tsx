import { createFileRoute, redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useState } from "react";
import { Camera, Car, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useStore, VehicleType } from "@/lib/store";
import { store } from "@/lib/store";
import { StatusBadge } from "@/components/app/status-badge";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — SmartPark AI" }] }),
  beforeLoad: async () => {
    if (!(await auth.isUser())) throw redirect({ to: (await auth.isAdmin()) ? "/admin" : "/login" });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const [dark, setDark] = useState(true);
  const { users, incidents = [] } = useStore();
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plateNumber: "", model: "", type: "car" as VehicleType });
  const currentUser = auth.getCurrentUser();
  const user = users.find(u => u.id === currentUser?.id);
  const userIncidents = incidents.filter(i => i.reportedBy === user?.id);

  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+91 98765 43210");
  const [profileCity, setProfileCity] = useState("Mumbai");

  if (!user) return null;

  const handleSaveProfile = () => {
    store.updateUser(user.id, {
      name: profileName,
      email: profileEmail,
      phone: profilePhone
    });
    toast.success("Profile updated successfully!");
  };

  const handleAddVehicle = () => {
    if (!newVehicle.plateNumber || !newVehicle.model) {
      toast.error("Please fill all vehicle details");
      return;
    }
    store.addVehicle(user.id, {
      id: `V-${Date.now()}`,
      plateNumber: newVehicle.plateNumber,
      model: newVehicle.model,
      type: newVehicle.type
    });
    setNewVehicle({ plateNumber: "", model: "", type: "car" });
    setIsAddingVehicle(false);
    toast.success("Vehicle added to garage");
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account, vehicles and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="glass rounded-2xl p-6 text-center h-fit">
          <div className="relative mx-auto h-24 w-24">
            <div className="h-24 w-24 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] grid place-items-center text-3xl font-bold text-white shadow-glow">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border border-white/10 grid place-items-center hover:bg-white/10">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 font-semibold text-lg">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Stat n="24" l="Bookings" />
            <Stat n={user.vehicles?.length.toString() || "0"} l="Vehicles" />
            <Stat n={`₹${user.walletBalance.toLocaleString()}`} l="Wallet" />
          </div>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="glass rounded-xl">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="incidents">Incidents ({userIncidents.length})</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="glass rounded-2xl p-6 mt-4 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
              <Field label="Email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
              <Field label="Phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
              <Field label="City" value={profileCity} onChange={(e) => setProfileCity(e.target.value)} />
            </div>
            <Button variant="hero" onClick={handleSaveProfile}>Save changes</Button>
          </TabsContent>

          <TabsContent value="password" className="glass rounded-2xl p-6 mt-4 space-y-5 max-w-md">
            <Field label="Current password" type="password" />
            <Field label="New password" type="password" />
            <Field label="Confirm new password" type="password" />
            <Button variant="hero" onClick={() => toast.success("Password updated")}>Update password</Button>
          </TabsContent>

          <TabsContent value="vehicles" className="glass rounded-2xl p-6 mt-4 space-y-4">
            {(user.vehicles || []).map((v) => (
              <div key={v.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 relative overflow-hidden group">
                {v.isDefault && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">DEFAULT</div>
                )}
                <div className="flex items-center gap-4">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {v.plateNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">{v.model} ({v.type.toUpperCase()})</div>
                  </div>
                  {!v.isDefault && (
                    <Button variant="outline" size="sm" className="h-8 text-xs hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => store.setDefaultVehicle(user.id, v.id)}>
                      Set Default
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => store.removeVehicle(user.id, v.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                {!v.isDefault && (
                  <Button variant="outline" size="sm" className="h-8 text-xs sm:hidden w-full mt-2" onClick={() => store.setDefaultVehicle(user.id, v.id)}>
                    Set Default
                  </Button>
                )}
              </div>
            ))}
            
            <Dialog open={isAddingVehicle} onOpenChange={setIsAddingVehicle}>
              <DialogTrigger asChild>
                <Button variant="glass" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add to Garage</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>License Plate</Label>
                    <Input 
                      placeholder="ABC-1234" 
                      className="bg-white/5" 
                      value={newVehicle.plateNumber}
                      onChange={e => setNewVehicle(prev => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alias (e.g., My Tesla, Wife's SUV)</Label>
                    <Input 
                      placeholder="My Tesla" 
                      className="bg-white/5" 
                      value={newVehicle.model}
                      onChange={e => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select value={newVehicle.type} onValueChange={(v: VehicleType) => setNewVehicle(prev => ({ ...prev, type: v }))}>
                      <SelectTrigger className="bg-white/5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="ev">EV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="hero" className="w-full mt-2" onClick={handleAddVehicle}>Save Vehicle</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="incidents" className="glass rounded-2xl p-6 mt-4 space-y-4">
            {userIncidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                 No incidents reported yet.
              </div>
            ) : (
              <div className="space-y-3">
                {userIncidents.map(inc => (
                  <div key={inc.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                        <StatusBadge status={inc.status.toLowerCase()} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{new Date(inc.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-base">{inc.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{inc.category} • Slot {inc.slotNumber || "N/A"}</div>
                    </div>
                    {inc.estimatedResolutionTime && (
                      <div className="text-xs text-primary mt-1">
                        Est. Resolution: {inc.estimatedResolutionTime}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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

function Field({ label, defaultValue, value, onChange, type = "text" }: { label: string; defaultValue?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} value={value} onChange={onChange} type={type} className="h-11 bg-white/5" />
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