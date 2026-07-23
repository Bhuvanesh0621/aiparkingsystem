import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar, BottomNav } from "@/components/mobile/shell";
import { notifications } from "@/lib/mock-data";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications — SmartPark AI" },
    { name: "description", content: "Booking updates, alerts and AI suggestions." },
  ] }),
  component: NotificationsPage,
});

const iconMap = {
  info: { icon: Info, cls: "bg-primary/10 text-primary" },
  success: { icon: CheckCircle2, cls: "bg-secondary/12 text-secondary" },
  warning: { icon: AlertTriangle, cls: "bg-warning/20 text-[color:oklch(0.55_0.15_60)]" },
} as const;

function NotificationsPage() {
  return (
    <Screen>
      <TopBar title="Notifications" back={false} right={
        <button className="text-xs text-primary font-semibold px-2">Mark all read</button>
      } />
      <div className="px-4 py-3 space-y-2">
        {notifications.map((n) => {
          const meta = iconMap[n.tone];
          return (
            <div key={n.id} className={`rounded-2xl border border-border bg-card p-4 flex gap-3 ${n.unread ? "border-l-4 border-l-primary" : ""}`}>
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${meta.cls}`}>
                <meta.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold truncate">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground shrink-0">{n.time}</div>
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>
              </div>
            </div>
          );
        })}
      </div>
      <BottomNav />
    </Screen>
  );
}
