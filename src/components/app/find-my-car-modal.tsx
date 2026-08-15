import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Navigation, PersonStanding, Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface FindMyCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotNumber: string;
  floor: number;
}

export function FindMyCarModal({ isOpen, onClose, slotNumber, floor }: FindMyCarModalProps) {
  // Simple layout mapping
  // A01-A10 (Top), B01-B10 (Bottom)
  // X range: 50 to 350. Y range: A=30, Aisle=100, B=170
  
  // Handle S-XX IDs correctly
  // Extract number from S-37, etc.
  const match = slotNumber.match(/\d+/);
  const colNum = match ? parseInt(match[0]) : 1;
  
  // Try to determine row A or B based on floor or slot if it's explicitly A or B
  // For S-XX IDs on floor 1, we map to A/B arbitrarily or based on ID modulo
  const isRowB = slotNumber.startsWith("B") || (slotNumber.startsWith("S") && colNum > 16);
  const isRowA = !isRowB;
  
  // Calculate target coordinates based on slot (max 10 columns visually)
  const visualCol = ((colNum - 1) % 10);
  const targetX = 50 + visualCol * 30;
  const targetY = isRowA ? 40 : 160;
  
  // Elevator / Pedestrian Entrance is on the left
  const startX = 20;
  const startY = 100;
  
  // Path follows the aisle then turns into the slot
  const pathD = `M ${startX} ${startY} L ${targetX} ${startY} L ${targetX} ${targetY}`;
  
  // Simulate distance
  const distanceMeters = Math.floor(targetX * 0.4);
  const timeMins = Math.ceil(distanceMeters / 60);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-fit glass-strong border-white/10 p-0 overflow-hidden">
        <div className="bg-black/40 p-6 border-b border-white/10 flex items-center justify-between">
          <div>
             <DialogTitle className="text-xl flex items-center gap-2">
               <Navigation className="h-5 w-5 text-primary" />
               Indoor Navigation
             </DialogTitle>
             <DialogDescription className="mt-1">
               Routing to Slot <span className="font-bold text-foreground">{slotNumber}</span> on Floor {floor}
             </DialogDescription>
          </div>
          <div className="text-right">
             <div className="text-xl font-bold text-primary">{Math.abs(distanceMeters)}m</div>
             <div className="text-xs text-muted-foreground">{Math.max(1, timeMins)} min walk</div>
          </div>
        </div>
        
        <div className="relative p-6 bg-[linear-gradient(135deg,#0a0a0a,#111)] flex items-center justify-center">
          
          <svg width="400" height="200" viewBox="0 0 400 200" className="w-full h-auto drop-shadow-xl">
            {/* Floor Background */}
            <rect x="0" y="0" width="400" height="200" rx="10" fill="#ffffff" fillOpacity="0.02" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            
            {/* Draw top row slots (A01 - A10) */}
            {Array.from({length: 10}).map((_, i) => (
              <rect key={`A${i}`} x={35 + i * 30} y="20" width="25" height="40" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
            ))}
            {/* Draw bottom row slots (B01 - B10) */}
            {Array.from({length: 10}).map((_, i) => (
              <rect key={`B${i}`} x={35 + i * 30} y="140" width="25" height="40" rx="3" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
            ))}
            
            {/* Aisle markings */}
            <line x1="20" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10 10" />

            {/* Target Slot Highlight */}
            <rect x={targetX - 15} y={isRowA ? 20 : 140} width="30" height="45" rx="4" fill="rgba(var(--primary-rgb), 0.2)" stroke="var(--primary)" strokeWidth="2" className="animate-pulse" />
            
            {/* Animated Path */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeDasharray="10 10"
              className="animate-[dash_2s_linear_infinite]"
            />
            
            {/* Entrance/Elevator Marker */}
            <circle cx={startX} cy={startY} r="12" fill="var(--background)" stroke="var(--primary)" strokeWidth="3" />
            
            {/* Target Car Marker */}
            <circle cx={targetX} cy={targetY} r="12" fill="var(--primary)" />
          </svg>

          {/* HTML Overlays for Icons */}
          <div className="absolute inset-0 pointer-events-none p-6">
            <div className="relative w-full h-full max-w-[400px] max-h-[200px] mx-auto">
              <div className="absolute" style={{ left: `${(startX / 400) * 100}%`, top: `${(startY / 200) * 100}%`, transform: 'translate(-50%, -50%)' }}>
                <PersonStanding className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute" style={{ left: `${(targetX / 400) * 100}%`, top: `${(targetY / 200) * 100}%`, transform: 'translate(-50%, -50%)' }}>
                <Car className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
        </div>
        
        <div className="bg-black/60 p-4 border-t border-white/10 text-xs text-muted-foreground flex justify-between items-center">
           <span>Follow the glowing path from the elevator.</span>
           <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Live AR coming soon</span>
        </div>
      </DialogContent>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}} />
    </Dialog>
  );
}
