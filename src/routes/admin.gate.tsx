import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { auth } from "@/lib/auth";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, ShieldCheck, ShieldAlert, CheckCircle2, Loader2, Camera, CameraOff, Focus } from "lucide-react";
import { store, Booking } from "@/lib/store";
import Tesseract from "tesseract.js";

export const Route = createFileRoute("/admin/gate")({
  head: () => ({ meta: [{ title: "Gate Simulator — Admin" }] }),
  beforeLoad: async () => {
    if (!(await auth.isAdmin())) throw redirect({ to: "/dashboard" });
  },
  component: GateSimulatorPage,
});

function GateSimulatorPage() {
  const [plate, setPlate] = useState("MH 12 AB 4521");
  const [scanning, setScanning] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [result, setResult] = useState<{ type: "success" | "error" | null; message: string; booking?: Booking }>({ type: null, message: "" });
  const [gateOpen, setGateOpen] = useState(false);
  
  // Webcam state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize WebCam
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } // Prefer back camera on mobile, default webcam on desktop
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError("Could not access camera. Please check permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const scanningState = useRef({ ocr: false, db: false, success: false });
  scanningState.current = { ocr: ocrScanning, db: scanning, success: result.type === "success" };

  const checkPlateMatch = (input: string) => {
    setScanning(true);
    setResult({ type: null, message: "" });
    setGateOpen(false);

    setTimeout(() => {
      const state = store.getState();
      let plateToSearch = input;
      let isQR = false;

      // Check if it's a QR code payload: SMARTPARK|B07|2026-08-06|10:00|TN-01-AB-1234
      if (input.startsWith("SMARTPARK|")) {
        isQR = true;
        const parts = input.split("|");
        if (parts.length >= 5) {
          plateToSearch = parts[4]; // The vehicle number is the 5th part
        } else {
          setResult({ type: "error", message: "Invalid QR Code payload format." });
          setScanning(false);
          return;
        }
      }

      const cleanPlate = plateToSearch.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      
      if (cleanPlate.length < 3) {
        setResult({ type: "error", message: isQR ? "QR Code vehicle data invalid." : "Plate string too short or unrecognizable." });
        setScanning(false);
        return;
      }
      
      // Find the most recent upcoming/active booking to avoid matching old completed ones
      const match = state.bookings
        .filter(b => b.status === "upcoming" || b.status === "active")
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .find((b) => {
          const cleanBookingPlate = b.vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          // If it's a QR, require an exact match of the clean plate for security. If OCR, allow partial.
          if (isQR) return cleanBookingPlate === cleanPlate;
          return cleanBookingPlate.includes(cleanPlate) || cleanPlate.includes(cleanBookingPlate);
        });
      
      if (match) {
        setResult({ type: "success", message: isQR ? "QR Pass verified securely." : "Booking verified via OCR.", booking: match });
      } else {
        setResult({ type: "error", message: "No active or upcoming booking found for this vehicle" });
      }
      setScanning(false);
    }, 1000);
  };

  const handleManualScan = () => {
    if (!plate.trim()) return;
    checkPlateMatch(plate);
  };

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;
    
    // Draw current video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video stream
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw the image
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);

    setOcrScanning(true);
    setResult({ type: null, message: "" });
    setGateOpen(false);
    setPlate("");
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(
        imageDataUrl,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      
      const extractedText = result.data.text.trim().replace(/\n/g, ' ');
      setPlate(extractedText);
      
      if (extractedText) {
        checkPlateMatch(extractedText);
      } else {
        setResult({ type: "error", message: "Could not detect any text on the plate." });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setResult({ type: "error", message: "Failed to process image OCR." });
    } finally {
      setOcrScanning(false);
    }
  };

  const captureRef = useRef(captureAndScan);
  useEffect(() => { captureRef.current = captureAndScan; });

  useEffect(() => {
    if (!cameraActive) return;
    const interval = setInterval(() => {
      if (!scanningState.current.ocr && !scanningState.current.db && !scanningState.current.success) {
        captureRef.current();
      }
    }, 4000); // Auto-scan every 4 seconds
    return () => clearInterval(interval);
  }, [cameraActive]);

  const handleOpenGate = async () => {
    if (result.booking) {
      try {
        await store.updateBooking(result.booking.id, { status: "active" });
        setGateOpen(true);
        // Link to 3D Digital Twin
        (store as any).setGateStatus("open");
        
        // Auto-close gate after 5 seconds
        setTimeout(() => {
          setGateOpen(false);
          (store as any).setGateStatus("closed");
        }, 5000);
      } catch (err) {
        console.error("Failed to open gate:", err);
        // Error toast could be added here
      }
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Live Gate Simulator</h1>
        <p className="text-muted-foreground mt-1">Live ANPR (Automatic Number Plate Recognition) using your laptop's camera.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Live Camera Feed
              </h2>
              {cameraActive ? (
                <Button size="sm" variant="outline" onClick={stopCamera} className="text-destructive hover:text-destructive">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Turn Off Camera
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Turn On Camera
                </Button>
              )}
            </div>
            
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-border/50 flex items-center justify-center">
              {/* Hidden Canvas for capturing frames */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Live Video Element */}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
              />

              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
              )}
              
              {/* Scanning Laser Animation */}
              {(scanning || ocrScanning) && (
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-primary/80 shadow-[0_0_15px_3px_var(--color-primary)] z-10"
                />
              )}

              {/* Overlay UI */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                {cameraError ? (
                  <div className="bg-destructive/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                    {cameraError}
                  </div>
                ) : ocrScanning ? (
                  <div className="flex flex-col items-center gap-3 bg-black/80 px-8 py-6 rounded-2xl backdrop-blur-md border border-primary/30 shadow-glow">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <span className="font-mono text-sm tracking-widest text-primary">SCANNING LIVE FEED... {ocrProgress}%</span>
                  </div>
                ) : scanning ? (
                  <div className="flex flex-col items-center gap-3 bg-black/60 px-6 py-4 rounded-xl backdrop-blur-md border border-white/10">
                    <Scan className="h-8 w-8 text-primary animate-pulse" />
                    <span className="font-mono text-sm tracking-widest text-primary">VERIFYING DB...</span>
                  </div>
                ) : !cameraActive ? (
                  <div className="flex flex-col items-center gap-2 opacity-50 bg-black/50 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/10 pointer-events-auto">
                    <CameraOff className="h-12 w-12 mb-2" />
                    <span className="font-mono text-xs tracking-widest">CAMERA OFFLINE</span>
                    <Button variant="hero" size="sm" onClick={startCamera} className="mt-2">Enable Camera</Button>
                  </div>
                ) : (
                  // Target box overlay when camera is active
                  <div className="w-3/4 h-1/2 border-2 border-primary/50 border-dashed rounded-lg flex items-center justify-center relative">
                    <div className="absolute -top-3 -left-3 border-t-4 border-l-4 border-primary w-8 h-8 rounded-tl" />
                    <div className="absolute -top-3 -right-3 border-t-4 border-r-4 border-primary w-8 h-8 rounded-tr" />
                    <div className="absolute -bottom-3 -left-3 border-b-4 border-l-4 border-primary w-8 h-8 rounded-bl" />
                    <div className="absolute -bottom-3 -right-3 border-b-4 border-r-4 border-primary w-8 h-8 rounded-br" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              {cameraActive && (
                 <div className="flex flex-col gap-2">
                   <Button onClick={captureAndScan} disabled={scanning || ocrScanning} className="w-full h-14 text-lg font-bold tracking-wider shadow-glow" variant="hero">
                    <Focus className="mr-2 h-5 w-5" /> CAPTURE & SCAN (MANUAL)
                   </Button>
                   <p className="text-center text-xs text-primary font-medium animate-pulse">Auto-scanning is active...</p>
                 </div>
              )}

              <div className="space-y-2 pt-4 border-t border-border/50">
                <label className="text-sm font-medium text-muted-foreground">Extracted / Manual Override / QR Scanner</label>
                <div className="flex gap-3">
                  <Input 
                    value={plate} 
                    onChange={(e) => setPlate(e.target.value)} 
                    className="font-mono uppercase tracking-widest bg-white/5 h-12 text-lg"
                    placeholder="ENTER PLATE OR PASTE QR"
                  />
                  <Button onClick={handleManualScan} disabled={scanning || ocrScanning} className="h-12 px-8" variant="glass">
                    Verify
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Hold your phone with a license plate up to the camera or use a USB QR scanner here.</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <AnimatePresence mode="wait">
            {result.type && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass rounded-2xl p-6 border-l-4 ${result.type === 'success' ? 'border-l-success' : 'border-l-destructive'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${result.type === 'success' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {result.type === 'success' ? <ShieldCheck className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{result.type === 'success' ? 'Match Found' : 'Access Denied'}</h3>
                    <p className="text-muted-foreground mt-1">{result.message}</p>
                    
                    {result.booking && (
                      <div className="mt-6 bg-white/5 rounded-xl border border-white/10 p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Booking ID</div>
                            <div className="font-mono font-medium">{result.booking.id.substring(0, 8)}...</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Slot</div>
                            <div className="font-bold text-primary text-lg">{result.booking.slotNumber}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Vehicle</div>
                            <div className="font-mono font-medium">{result.booking.vehicleNumber}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Time</div>
                            <div className="font-medium">{new Date(result.booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(result.booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.type === 'success' && (
                      <div className="mt-6 pt-6 border-t border-border/50">
                        {gateOpen ? (
                          <div className="flex items-center gap-2 text-success font-semibold">
                            <CheckCircle2 className="h-5 w-5" />
                            Gate Opened Successfully
                          </div>
                        ) : (
                          <Button onClick={handleOpenGate} variant="hero" className="w-full h-12 text-base">
                            Open Entry Gate
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
