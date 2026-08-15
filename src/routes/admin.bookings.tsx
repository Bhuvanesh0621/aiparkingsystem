import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useMemo, useState } from "react";
import { Search, Check, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/app/status-badge";
import { useStore, store } from "@/lib/store";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({ meta: [{ title: "All Bookings — Admin" }] }),
  beforeLoad: async () => {
    if (!(await auth.isAdmin())) throw redirect({ to: "/dashboard" });
  },
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const { bookings, users } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => {
    const result = bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (q && !`${b.id} ${b.slotNumber} ${b.vehicleNumber}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
    return result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [q, status, bookings]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground mt-1">Approve, cancel and complete bookings across the network.</p>
      </div>

      <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search bookings…" className="pl-9 h-10 bg-white/5" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44 h-10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="text-left font-medium py-3 px-4">User</th>
                <th className="text-left font-medium py-3 px-4">Slot</th>
                <th className="text-left font-medium py-3 px-4">Vehicle</th>
                <th className="text-left font-medium py-3 px-4">When</th>
                <th className="text-left font-medium py-3 px-4">Amount</th>
                <th className="text-left font-medium py-3 px-4">Status</th>
                <th className="text-right font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-border/40 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="font-medium">{users.find(u => u.id === b.userId)?.name || "Unknown User"}</div>
                    <div className="text-xs text-muted-foreground">{users.find(u => u.id === b.userId)?.email || b.userId}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold">{b.slotNumber} <span className="text-muted-foreground text-xs">· F{b.floor}</span></td>
                  <td className="py-3 px-4">{b.vehicleNumber}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="py-3 px-4 font-medium">₹{b.amount}</td>
                  <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => { store.updateBooking(b.id, { status: "active" }); toast.success("Approved"); }}><Check className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { store.updateBooking(b.id, { status: "completed" }); toast.success("Completed"); }}><CheckCircle2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { store.updateBooking(b.id, { status: "cancelled" }); toast.success("Cancelled"); }}><X className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}