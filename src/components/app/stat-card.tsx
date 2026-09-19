import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "./../ui/spotlight-card";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "success" | "warning";
  index?: number;
}

const accents: Record<string, string> = {
  primary: "from-primary/30 to-primary/0 text-primary",
  secondary: "from-secondary/30 to-secondary/0 text-secondary",
  success: "from-success/30 to-success/0 text-success",
  warning: "from-warning/30 to-warning/0 text-warning",
};

export function StatCard({ label, value, delta, positive = true, icon: Icon, accent = "primary", index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="h-fit"
    >
      <SpotlightCard className="p-5 shadow-elegant h-full w-full">
        <div className={cn("absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl opacity-60", accents[accent])} />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
            <div className="mt-2 text-3xl font-bold tracking-tight">
              <motion.span
                key={value}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block"
              >
                {value}
              </motion.span>
            </div>
            {delta && (
              <div className={cn("mt-2 text-xs font-medium", positive ? "text-success" : "text-destructive")}>
                {positive ? "▲" : "▼"} {delta}
              </div>
            )}
          </div>
          <div className={cn("grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5", accents[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}