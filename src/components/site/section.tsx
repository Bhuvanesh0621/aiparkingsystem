import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn("mx-auto max-w-7xl px-6 py-20 sm:py-28", className)}>
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto text-center mb-14"
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mt-4 text-muted-foreground text-lg">{description}</p>}
    </motion.div>
  );
}