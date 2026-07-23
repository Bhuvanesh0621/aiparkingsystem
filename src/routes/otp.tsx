import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/mobile/shell";

export const Route = createFileRoute("/otp")({
  head: () => ({ meta: [{ title: "Verify OTP — SmartPark AI" }] }),
  component: OtpPage,
});

function OtpPage() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [t, setT] = useState(30);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const nav = useNavigate();

  useEffect(() => { const id = setInterval(() => setT((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const set = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = clean; setDigits(next);
    if (clean && i < 5) inputs.current[i + 1]?.focus();
    if (next.every((d) => d)) { setTimeout(() => { toast.success("Verified"); nav({ to: "/home" }); }, 300); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        <TopBar />
        <div className="px-6 pt-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Enter verification code</h1>
          <p className="mt-2 text-muted-foreground">We sent a 6-digit code to <span className="text-foreground font-medium">+91 98200 12345</span>.</p>

          <div className="mt-10 grid grid-cols-6 gap-2.5">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => set(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
                }}
                className="h-14 w-full rounded-2xl border border-border bg-card text-center text-2xl font-semibold focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t > 0 ? <>Resend code in <span className="font-medium text-foreground">0:{String(t).padStart(2, "0")}</span></> : (
              <button className="text-primary font-semibold" onClick={() => { setT(30); toast.success("New code sent"); }}>Resend code</button>
            )}
          </div>

          <Button
            size="lg"
            className="mt-10 h-12 w-full rounded-full text-base"
            onClick={() => { toast.success("Verified"); nav({ to: "/home" }); }}
            disabled={digits.some((d) => !d)}
          >
            Verify & continue
          </Button>
        </div>
      </div>
    </div>
  );
}
