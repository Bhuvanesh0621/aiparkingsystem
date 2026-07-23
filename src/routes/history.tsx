import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/app/status-badge";
import { bookings } from "@/lib/mock-data";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Booking History — SmartPark AI" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => bookings.filter((b) => {
    if (status !== "all" && b.status !== status) return false;
    if (q && !`${b.id} ${b.slotNumber} ${b.vehicleNumber}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, status]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Booking history</h1>
        <p className="text-muted-foreground mt-1">All your past and upcoming bookings in one place.</p>
      </div>

      <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search booking ID, slot, vehicle…" className="pl-9 h-10 bg-white/5" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44 h-10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
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
                <th className="text-left font-medium py-3 px-4">Booking</th>
                <th className="text-left font-medium py-3 px-4">Slot</th>
                <th className="text-left font-medium py-3 px-4">Vehicle</th>
                <th className="text-left font-medium py-3 px-4">Start</th>
                <th className="text-left font-medium py-3 px-4">Amount</th>
                <th className="text-left font-medium py-3 px-4">Payment</th>
                <th className="text-left font-medium py-3 px-4">Status</th>
                <th className="text-right font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-border/40 hover:bg-white/5">
                  <td className="py-3 px-4 font-mono text-xs">{b.id}</td>
                  <td className="py-3 px-4 font-semibold">{b.slotNumber} <span className="text-muted-foreground text-xs">· F{b.floor}</span></td>
                  <td className="py-3 px-4">{b.vehicleNumber}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(b.startTime).toLocaleString()}</td>
                  <td className="py-3 px-4 font-medium">₹{b.amount}</td>
                  <td className="py-3 px-4"><StatusBadge status={b.paymentStatus} /></td>
                  <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => toast.success("Receipt downloaded")}><Download className="h-4 w-4" /></Button>
                      {(b.status === "active" || b.status === "upcoming") && (
                        <Button variant="ghost" size="icon" onClick={() => toast.success("Booking cancelled")}><X className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 text-xs text-muted-foreground">
          <div>Showing {filtered.length} of {bookings.length} bookings</div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" disabled>Previous</Button>
            <Button variant="glass" size="sm">1</Button>
            <Button variant="ghost" size="sm">2</Button>
            <Button variant="ghost" size="sm">Next</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}