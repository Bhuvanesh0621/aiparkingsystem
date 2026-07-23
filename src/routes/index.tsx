import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Zap, ShieldCheck, MapPin, QrCode, Sparkles,
  BarChart3, Clock, Car, Star, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingNav } from "@/components/site/floating-nav";
import { SiteFooter } from "@/components/site/footer";
import { Section, SectionHeader } from "@/components/site/section";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const features = [
  { icon: Zap, title: "Real-time availability", desc: "Live IoT sensors surface open slots the instant they free up." },
  { icon: QrCode, title: "One-tap QR access", desc: "Scan-to-enter passes replace tickets, cards and clumsy apps." },
  { icon: BarChart3, title: "Predictive analytics", desc: "AI forecasts peak hours so operators price and staff smarter." },
  { icon: MapPin, title: "Turn-by-turn to slot", desc: "In-garage navigation takes drivers directly to their bay." },
  { icon: ShieldCheck, title: "License-plate secure", desc: "ANPR verification and encrypted access at every gate." },
  { icon: Clock, title: "Auto-extend & billing", desc: "Sessions extend seamlessly and receipts land instantly." },
];

const stats = [
  { k: "12,400+", v: "Active drivers" },
  { k: "98.6%", v: "Slot accuracy" },
  { k: "3.4s", v: "Avg. booking time" },
  { k: "42", v: "Cities live" },
];

const testimonials = [
  { name: "Ananya Rao", role: "Ops Lead, Prestige Malls", quote: "SmartPark cut our peak-hour queues by 63%. The analytics alone paid for the rollout." },
  { name: "Marcus Wei", role: "GM, City Center Garages", quote: "Rolled out to 14 sites in a month. Drivers love the QR pass, our team loves the dashboards." },
  { name: "Priya Iyer", role: "Product, MetroRail", quote: "It feels like the Stripe of parking. Everything just works — and looks the part." },
];

const faqs = [
  { q: "How does SmartPark keep availability live?", a: "Sensors at each bay plus ANPR at gates feed a low-latency stream into your dashboard and driver app." },
  { q: "Can I integrate my payment gateway?", a: "Yes — Stripe, Razorpay, Adyen, and custom PSPs via a first-class API and webhooks." },
  { q: "Do drivers need a separate app?", a: "No. A single PWA covers booking, QR pass, receipts and support. Native SDKs are available for enterprise." },
  { q: "Is my data secure?", a: "SOC 2 Type II, end-to-end encryption in transit and at rest, granular RBAC for every operator." },
];

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[900px] bg-hero pointer-events-none" />
      <FloatingNav />

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            New: AI slot prediction is live in 42 cities
            <ChevronRight className="h-3 w-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
          >
            Smart parking, <br className="hidden sm:block" />
            <span className="gradient-text">reimagined for cities.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground"
          >
            SmartPark AI turns every garage into a live, bookable network.
            Reserve a bay, arrive with a QR, and skip the queue — while operators run their fleet from one beautiful dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            <Button asChild variant="hero" size="xl">
              <Link to="/register">Book Parking <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/dashboard">Live demo</Link>
            </Button>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.v} className="glass rounded-2xl px-4 py-5">
                <div className="text-2xl font-bold tracking-tight gradient-text">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Animated garage visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-20 mx-auto max-w-6xl"
        >
          <div className="glass-strong rounded-3xl p-3 shadow-elegant">
            <div className="rounded-2xl border border-white/10 bg-background/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-muted-foreground">Live · Central Garage</div>
                  <div className="text-lg font-semibold">Floor B · 48 bays</div>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success shadow-glow"/>Available</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning"/>Reserved</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive"/>Occupied</span>
                </div>
              </div>
              <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
                {Array.from({ length: 48 }).map((_, i) => {
                  const s = i % 5 === 0 ? "occupied" : i % 7 === 0 ? "reserved" : "available";
                  const color = s === "available" ? "bg-success/20 border-success/40" : s === "occupied" ? "bg-destructive/20 border-destructive/40" : "bg-warning/20 border-warning/40";
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.012, duration: 0.3 }}
                      className={`aspect-[3/4] rounded-md border ${color}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <Section id="features">
        <SectionHeader
          eyebrow="Features"
          title="Everything a modern garage needs."
          description="From live sensors to predictive pricing — SmartPark ships the full stack, in one product."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-6 shadow-elegant"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold text-lg">{f.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" className="pt-0">
        <SectionHeader eyebrow="How it works" title="From driveway to dashboard in three steps." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "01", t: "Reserve a bay", d: "Pick a garage, floor, vehicle type and duration. Confirm in under 4 seconds." },
            { n: "02", t: "Arrive & scan", d: "Your QR pass opens the gate and lights your bay in-garage." },
            { n: "03", t: "Leave, we bill", d: "Sessions close automatically. Receipts and invoices land in your inbox." },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative glass rounded-2xl p-6"
            >
              <div className="text-5xl font-bold gradient-text opacity-70">{s.n}</div>
              <div className="mt-2 text-lg font-semibold">{s.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section id="pricing">
        <SectionHeader eyebrow="Loved by operators" title="Trusted by teams shaping how cities park." />
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-warning" />)}
              </div>
              <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] grid place-items-center text-xs font-semibold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Answers, upfront." />
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f-${i}`} className="glass mb-3 rounded-2xl border-white/10 px-5">
              <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* CTA */}
      <Section className="pt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden glass-strong rounded-3xl p-10 sm:p-16 text-center shadow-elegant"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-[600px] rounded-full bg-primary/40 blur-3xl opacity-60 pointer-events-none" />
          <div className="relative">
            <Car className="h-10 w-10 mx-auto text-secondary" />
            <h3 className="mt-4 font-display text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to park <span className="gradient-text">smarter?</span>
            </h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of drivers and dozens of operators reinventing urban parking.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/register">Get started free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/admin">See admin dashboard</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </Section>

      <SiteFooter />
    </div>
  );
}
