
import { Car, Bike, Zap, Truck, Check, BatteryCharging, AlertTriangle, Lock } from "lucide-react";
import type { ParkingSlot } from "@/lib/store";
import { cn } from "@/lib/utils";

const icons = { car: Car, bike: Bike, ev: Zap, suv: Truck } as const;

const statusStyles = {
  available: "border-border/50 bg-card hover:border-border cursor-pointer",
  occupied: "border-border/50 bg-card cursor-not-allowed opacity-90",
  reserved: "border-border/50 bg-card cursor-not-allowed opacity-90",
} as const;

export function SlotCard({
  slot, selected, onSelect, index = 0, equipmentHealth, incidentSeverity
}: {
  slot: ParkingSlot;
  selected?: boolean;
  onSelect?: (s: ParkingSlot) => void;
  index?: number;
  equipmentHealth?: "Healthy" | "Warning" | "Failure" | "Offline";
  incidentSeverity?: "Low" | "Medium" | "High" | "Critical";
}) {
  const Icon = icons[slot.type];
  const disabled = slot.status === "occupied" || slot.status === "reserved";
  const statusColor =
    slot.status === "available" ? "text-success"
    : slot.status === "occupied" ? "text-destructive"
    : "text-warning";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(slot)}
      className={cn(
        "relative rounded-2xl border p-4 text-left transition-all flex flex-col justify-between gap-3 shadow-sm",
        statusStyles[slot.status],
        selected && "!border-primary bg-primary/15 ring-1 ring-primary",
        !disabled && "hover:scale-[1.02] active:scale-[0.98]"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            {slot.slotNumber}
          </span>
          {equipmentHealth && equipmentHealth !== "Healthy" && (
            <div 
              className={cn(
                "h-2 w-2 rounded-full",
                equipmentHealth === "Warning" ? "bg-warning shadow-glow shadow-warning/50" : 
                equipmentHealth === "Failure" ? "bg-destructive shadow-glow shadow-destructive/50" : 
                "bg-slate-500"
              )}
              title={`Equipment Status: ${equipmentHealth}`}
            />
          )}
          {incidentSeverity && (
            <AlertTriangle className={cn(
              "h-3 w-3",
              incidentSeverity === "Critical" ? "text-destructive" :
              incidentSeverity === "High" ? "text-orange-500" :
              incidentSeverity === "Medium" ? "text-warning" : "text-blue-500"
            )} title={`Active Incident: ${incidentSeverity} Severity`} />
          )}
        </div>
        {disabled ? (
          <Lock className={cn("h-4 w-4", statusColor)} />
        ) : (
          <Icon className={cn("h-4 w-4", statusColor)} />
        )}
      </div>

      <div>
        <div className={cn("text-[10px] uppercase tracking-wider font-bold mb-1", statusColor)}>
          {slot.status}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Floor {slot.floor}</div>
          <div className="text-sm font-bold text-foreground">₹{slot.pricePerHour}<span className="text-[10px] text-muted-foreground font-normal">/hr</span></div>
        </div>
      </div>

      {selected && (
        <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-glow">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}