import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, ArrowRight, Car } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — SmartPark AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [phone, setPhone] = useState("");
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Car className="h-4 w-4" /></span>
          <span className="font-semibold">SmartPark<span className="text-primary">.AI</span></span>
        </div>
        <div className="mt-14">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">Sign in with your mobile number. We'll send you a one-time code.</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("OTP sent"); nav({ to: "/otp" }); }}
          className="mt-10 space-y-5"
        >
          <div>
            <label className="text-sm font-medium">Mobile number</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition">
              <span className="flex items-center gap-2 text-sm font-medium border-r border-border pr-3">
                <Phone className="h-4 w-4 text-muted-foreground" />+91
              </span>
              <Input
                inputMode="numeric"
                maxLength={10}
                placeholder="98200 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="border-0 bg-transparent focus-visible:ring-0 h-12 text-base p-0"
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full h-12 rounded-full text-base" disabled={phone.length < 10}>
            Send OTP <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {["Google", "Apple"].map((p) => (
            <Button key={p} variant="outline" className="h-12 rounded-full" onClick={() => nav({ to: "/home" })}>{p}</Button>
          ))}
        </div>

        <p className="mt-auto pt-10 text-center text-sm text-muted-foreground">
          New here? <Link to="/register" className="text-primary font-semibold">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
