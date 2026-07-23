import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  active: "bg-primary/15 text-primary border-primary/30",
  upcoming: "bg-secondary/15 text-secondary border-secondary/30",
  completed: "bg-success/15 text-success border-success/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  paid: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  refunded: "bg-muted-foreground/15 text-muted-foreground border-border",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
  admin: "bg-secondary/15 text-secondary border-secondary/30",
  user: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}