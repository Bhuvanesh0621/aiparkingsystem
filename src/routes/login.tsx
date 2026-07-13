import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Welcome back to SmartPark");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your bookings and slots."
      footer={<>Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Create one</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-sm text-muted-foreground font-normal">Remember me for 30 days</Label>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-muted-foreground">or continue with</span></div>
        </div>

        <Button type="button" variant="glass" size="lg" className="w-full">
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.44-1.68 4.2-5.4 4.2-3.24 0-5.88-2.7-5.88-6s2.64-6 5.88-6c1.86 0 3.12.78 3.84 1.44l2.64-2.52C16.86 3.66 14.7 2.7 12 2.7 6.9 2.7 2.82 6.78 2.82 11.88s4.08 9.18 9.18 9.18c5.28 0 8.82-3.72 8.82-8.94 0-.6-.06-1.08-.12-1.5H12z"/></svg>
          Continue with Google
        </Button>
      </form>
    </AuthLayout>
  );
}