import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useMemo, useState } from "react";
import { Search, Edit2, Trash2, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/app/status-badge";
import { useStore, store, User } from "@/lib/store";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Manage Users — Admin" }] }),
  beforeLoad: async () => {
    if (!(await auth.isAdmin())) throw redirect({ to: "/dashboard" });
  },
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { users } = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const filtered = useMemo(() => users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (q && !`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, role, users]);

  return (
    <AppShell admin>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1">Manage accounts, roles and access.</p>
      </div>

      <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users…" className="pl-9 h-10 bg-white/5" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-36 h-10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5">
              <tr>
                <th className="text-left font-medium py-3 px-4">User</th>
                <th className="text-left font-medium py-3 px-4">Email</th>
                <th className="text-left font-medium py-3 px-4">Role</th>
                <th className="text-left font-medium py-3 px-4">Status</th>
                <th className="text-left font-medium py-3 px-4">Joined</th>
                <th className="text-right font-medium py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border/40 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] grid place-items-center text-xs font-semibold text-white">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4"><StatusBadge status={u.role} /></td>
                  <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                  <td className="py-3 px-4 text-muted-foreground">{u.joined}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => toast.success(`Editing ${u.name}`)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        const newStatus = u.status === "suspended" ? "active" : "suspended";
                        store.setState({ users: store.getState().users.map((x) => x.id === u.id ? { ...x, status: newStatus as User["status"] } : x) });
                        toast.success(`${u.name} ${newStatus}`);
                      }}>
                        {u.status === "suspended" ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        store.deleteUser(u.id);
                        toast.success(`${u.name} deleted`);
                      }}><Trash2 className="h-4 w-4" /></Button>
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