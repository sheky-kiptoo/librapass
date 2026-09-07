import { motion } from "motion/react";
import { lazy, Suspense } from "react";

import { Library } from "lucide-react";

const Hero3D = lazy(() => import("./hero-3d"));

export function AuthHero({
  eyebrow = "Daystar University",
  headline = "Welcome to LibraPass",
  subtitle = "Smart Library Access & Analytics",
}: {
  eyebrow?: string;
  headline?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative hidden overflow-hidden bg-[oklch(0.22_0.05_162)] lg:block">
      <div className="absolute inset-0 opacity-90 brand-gradient" />
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <Hero3D />
        </Suspense>
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between p-12">
        <div className="flex items-center gap-2 text-primary-foreground">
          <Library className="h-6 w-6" />
          <span className="text-lg font-semibold tracking-tight">LibraPass</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/70">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-primary-foreground">
            {headline}
          </h1>
          <p className="mt-3 text-base text-primary-foreground/80">{subtitle}</p>
        </motion.div>
        <p className="text-xs text-primary-foreground/60">
          Multi-tenant library access platform · QR · ID card · Web
        </p>
      </div>
    </div>
  );
}