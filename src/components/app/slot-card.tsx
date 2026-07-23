import { motion } from "motion/react";
import { Car, Bike, Zap, Truck, Check } from "lucide-react";
import type { ParkingSlot } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = { car: Car, bike: Bike, ev: Zap, suv: Truck } as const;

const statusStyles = {
  available: "border-success/40 bg-success/5 hover:bg-success/10",
  occupied: "border-destructive/40 bg-destructive/5 cursor-not-allowed opacity-70",
  reserved: "border-warning/40 bg-warning/5",
} as const;

export function SlotCard({
  slot, selected, onSelect, index = 0,
}: {
  slot: ParkingSlot;
  selected?: boolean;
  onSelect?: (s: ParkingSlot) => void;
  index?: number;
}) {
  const Icon = icons[slot.type];
  const disabled = slot.status === "occupied";
  const statusColor =
    slot.status === "available" ? "text-success"
    : slot.status === "occupied" ? "text-destructive"
    : "text-warning";
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(slot)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: (index % 20) * 0.02 }}
      whileHover={disabled ? undefined : { y: -3, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        "relative rounded-2xl border p-4 text-left transition-all glass",
        statusStyles[slot.status],
        selected && "!border-primary bg-primary/15 shadow-glow ring-1 ring-primary",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold tracking-tight">{slot.slotNumber}</span>
        <Icon className={cn("h-4 w-4", statusColor)} />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className={cn("text-[10px] uppercase tracking-wider font-medium", statusColor)}>{slot.status}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Floor {slot.floor}</div>
        </div>
        <div className="text-sm font-semibold">₹{slot.pricePerHour}<span className="text-[10px] text-muted-foreground">/hr</span></div>
      </div>
      {selected && (
        <span className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-white shadow-glow">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </motion.button>
  );
}