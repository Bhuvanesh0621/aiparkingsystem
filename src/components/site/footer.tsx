import { Car } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/50 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))]">
              <Car className="h-5 w-5 text-white" />
            </span>
            <span className="font-bold">SmartPark<span className="gradient-text">.AI</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The intelligent parking OS trusted by modern operators. Live availability, instant booking, and predictive analytics.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Product</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Features</a></li>
            <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">About</a></li>
            <li><a href="#" className="hover:text-foreground">Careers</a></li>
            <li><a href="#" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © 2026 SmartPark AI. Built with obsession.
      </div>
    </footer>
  );
}