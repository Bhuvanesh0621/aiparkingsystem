import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — SmartPark AI" },
      { name: "description", content: "Create your SmartPark AI account and book your first bay." },
    ],
  }),
  component: RegisterPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(80),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  password: z.string().min(8, "Min 8 characters").max(72),
  confirm: z.string(),
  vehicleNumber: z.string().trim().min(4).max(20),
  vehicleType: z.enum(["car", "suv", "bike", "ev"]),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });
type FormData = z.infer<typeof schema>;

function RegisterPage() {
  const navigate = useNavigate();
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirm: "", vehicleNumber: "", vehicleType: "car" },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success("Account created — welcome to SmartPark");
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Book bays, generate QR passes, and track your parking history."
      footer={<>Already registered? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Aarav Sharma" className="h-11 bg-white/5" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+91 98…" className="h-11 bg-white/5" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" className="h-11 bg-white/5" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" className="h-11 bg-white/5" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" placeholder="••••••••" className="h-11 bg-white/5" {...register("confirm")} />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vehicleNumber">Vehicle number</Label>
            <Input id="vehicleNumber" placeholder="MH 12 AB 4521" className="h-11 bg-white/5" {...register("vehicleNumber")} />
            {errors.vehicleNumber && <p className="text-xs text-destructive">{errors.vehicleNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Vehicle type</Label>
            <Controller
              control={control}
              name="vehicleType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 bg-white/5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="ev">EV</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create account"}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
      </form>
    </AuthLayout>
  );
}