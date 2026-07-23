import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Car, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — SmartPark AI" }] }),
  component: RegisterPage,
});

function Field({ icon: Icon, ...props }: { icon: any } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 h-14 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <Input {...props} className="border-0 bg-transparent focus-visible:ring-0 h-12 text-base p-0" />
    </div>
  );
}

function RegisterPage() {
  const [f, setF] = useState({ name: "", email: "", phone: "" });
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-6 py-10">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Car className="h-4 w-4" /></span>
          <span className="font-semibold">SmartPark<span className="text-primary">.AI</span></span>
        </div>
        <div className="mt-10">
          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-muted-foreground">Takes less than a minute. Free forever.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); toast.success("Verify your phone"); nav({ to: "/otp" }); }}
          className="mt-8 space-y-4"
        >
          <Field icon={User} placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Field icon={Mail} placeholder="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <Field icon={Phone} placeholder="Mobile number" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "") })} />
          <p className="text-xs text-muted-foreground">
            By continuing you agree to our <span className="text-primary">Terms</span> and <span className="text-primary">Privacy Policy</span>.
          </p>
          <Button type="submit" size="lg" className="w-full h-12 rounded-full text-base">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Have an account? <Link to="/login" className="text-primary font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
