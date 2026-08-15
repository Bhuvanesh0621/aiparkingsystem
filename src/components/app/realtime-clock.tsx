import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";

export function RealtimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-right">
      <Clock className="w-4 h-4 text-muted-foreground hidden lg:block" />
      <div>
        <div className="text-sm font-display font-bold tracking-wider text-foreground tabular-nums leading-tight">
          {format(time, "HH:mm:ss")}
        </div>
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-tight">
          {format(time, "dd MMM yyyy")}
        </div>
      </div>
    </div>
  );
}
