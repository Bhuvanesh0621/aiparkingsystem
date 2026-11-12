import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { auth, Role } from "@/lib/auth";
import { AuthLayout } from "@/components/site/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if ((await auth.isAuthenticated())) {
      throw redirect({
        to: (await auth.isAdmin()) ? '/admin' : '/dashboard',
      })
    }
  },
  head: () => ({
    meta: [
      { title: "Sign in — SmartPark AI" },
      { name: "description", content: "Sign in to your SmartPark AI account." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  
  // Load saved credentials if any
  const savedCredsRaw = typeof window !== 'undefined' ? localStorage.getItem("smartpark_saved_credentials") : null;
  const savedCreds = savedCredsRaw ? JSON.parse(savedCredsRaw) : null;
  
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      email: savedCreds?.email || "", 
      password: savedCreds?.password || "", 
      remember: savedCreds ? true : true 
    },
  });

  const onSubmit = async (data: FormData, role: Role = "user") => {
    try {
      const result = await auth.login(data.email, data.password, role);
      if (result && result.success) {
        
        // Save or clear credentials based on 'remember' checkbox
        if (data.remember) {
          localStorage.setItem("smartpark_saved_credentials", JSON.stringify({ email: data.email, password: data.password }));
        } else {
          localStorage.removeItem("smartpark_saved_credentials");
        }

        const activeRole = result.realRole || "user";
        toast.success(`Welcome back to SmartPark (${activeRole === 'admin' ? 'Admin' : 'User'})`);
        navigate({ to: activeRole === "admin" ? "/admin" : "/dashboard" });
      } else {
        toast.error(result?.error || "Invalid email or password.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your bookings and slots."
      footer={<>Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link></>}
    >
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@company.com" className="pl-9 h-11 bg-white/5" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type={show ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10 h-11 bg-white/5" {...register("password")} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" {...register("remember")} onCheckedChange={(checked) => {
             // react-hook-form doesn't naturally handle shadcn Checkbox without Controller, 
             // but since we only need it on submit, we can just let it be or use a hidden input
          }} />
          <input type="hidden" {...register("remember")} />
          <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal">Remember me for 30 days</Label>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={handleSubmit((d) => onSubmit(d))} variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </div>

        <div className="pt-2 border-t border-white/10 mt-2">
          <div className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Demo 1-Click Access
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs bg-white/5 hover:bg-white/10 border-white/10 text-foreground h-9"
              onClick={() => {
                setValue("email", "bhuvaneshkumar299@gmail.com");
                setValue("password", "0621@2005");
                onSubmit({ email: "bhuvaneshkumar299@gmail.com", password: "0621@2005", remember: true });
              }}
            >
              <User className="mr-1.5 h-3.5 w-3.5 text-primary" /> User Demo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs bg-white/5 hover:bg-white/10 border-white/10 text-foreground h-9"
              onClick={() => {
                setValue("email", "admin@smartpark.ai");
                setValue("password", "password123");
                onSubmit({ email: "admin@smartpark.ai", password: "password123", remember: true });
              }}
            >
              <Shield className="mr-1.5 h-3.5 w-3.5 text-amber-400" /> Admin Demo
            </Button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}