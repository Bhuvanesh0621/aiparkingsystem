import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Upload, Camera, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStore, store, IncidentSeverity } from "@/lib/store";
import { toast } from "sonner";
import { auth } from "@/lib/auth";

export function ReportIncidentModal({
  isOpen,
  onClose,
  defaultSlotNumber = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultSlotNumber?: string;
}) {
  const [category, setCategory] = useState("Other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slotNumber, setSlotNumber] = useState(defaultSlotNumber);
  const [severity, setSeverity] = useState<IncidentSeverity>("Medium");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      store.reportIncident({
        category,
        title,
        description,
        photos,
        slotNumber,
        floor: "1", // Mock auto-fill based on slot
        zone: "Block A", // Mock auto-fill
        severity,
        reportedBy: auth.getCurrentUser()?.id || "U-1",
      });
      
      toast.success("Incident reported successfully");
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPhotos((prev) => [...prev, base64String]);
      toast.success("Photo attached successfully");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    "Accident", "Broken Parking Sensor", "Damaged EV Charger",
    "Illegal Parking", "Water Leakage", "Poor Lighting",
    "Broken Boom Barrier", "Camera Failure", "Parking Slot Damage", "Other"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  <h2 className="font-semibold text-lg text-foreground">Report Incident</h2>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="incident-form" onSubmit={handleSubmit} className="space-y-5">
                  
                  <div className="space-y-2">
                    <Label>Incident Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Short Title <span className="text-destructive">*</span></Label>
                    <Input 
                      placeholder="e.g., Water leaking from ceiling" 
                      className="bg-white/5 border-white/10"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Detailed Description <span className="text-destructive">*</span></Label>
                    <Textarea 
                      placeholder="Please describe exactly what happened or what you see..." 
                      className="bg-white/5 border-white/10 min-h-[100px]"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location / Slot (Optional)</Label>
                      <div className="relative">
                         <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                         <Input 
                           placeholder="e.g. A03" 
                           className="bg-white/5 border-white/10 pl-9"
                           value={slotNumber}
                           onChange={e => setSlotNumber(e.target.value)}
                         />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select value={severity} onValueChange={(v: IncidentSeverity) => setSeverity(v)}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low (Minor Issue)</SelectItem>
                          <SelectItem value="Medium">Medium (Needs Attention)</SelectItem>
                          <SelectItem value="High">High (Urgent)</SelectItem>
                          <SelectItem value="Critical">Critical (Emergency)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label>Upload Photos</Label>
                    
                    {photos.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-white/20">
                            <img src={photo} alt="Upload preview" className="object-cover w-full h-full" />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 hover:bg-destructive/80 transition-colors"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="border-2 border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handlePhotoUpload}
                      />
                      <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-2 pointer-events-none">
                         <Camera className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium pointer-events-none">Tap to upload photos</p>
                      <p className="text-xs text-muted-foreground mt-1 pointer-events-none">Supports JPG, PNG (Max 5MB)</p>
                    </label>
                  </div>

                </form>
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 flex gap-3 justify-end">
                <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                <Button variant="hero" type="submit" form="incident-form" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
