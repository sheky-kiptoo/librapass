import { motion } from "motion/react";
import { CreditCard, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/libra/ui";

/** Simulated phone camera QR viewfinder (channel 1). */
export function QRScannerPlaceholder() {
  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-[oklch(0.22_0.02_260)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,oklch(0.4_0.06_162/0.6),transparent_65%)]" />
      <div className="absolute inset-8 rounded-xl border-2 border-dashed border-primary-foreground/30" />
      {[
        "left-6 top-6 border-l-2 border-t-2",
        "right-6 top-6 border-r-2 border-t-2",
        "left-6 bottom-6 border-b-2 border-l-2",
        "right-6 bottom-6 border-b-2 border-r-2",
      ].map((pos) => (
        <span key={pos} className={`absolute h-10 w-10 rounded-md border-primary ${pos}`} />
      ))}
      <motion.div
        className="absolute inset-x-8 h-0.5 bg-primary shadow-[0_0_18px_2px_oklch(0.62_0.13_160)]"
        initial={{ top: "12%" }}
        animate={{ top: ["12%", "86%", "12%"] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5 text-center">
        <p className="text-sm font-medium text-primary-foreground">Point your camera at the Library QR Code.</p>
        <p className="mt-1 text-xs text-primary-foreground/60">Camera preview (mock)</p>
      </div>
    </div>
  );
}

/**
 * Kiosk barcode capture (channel 2). A USB/Bluetooth scanner behaves like a
 * keyboard: it "types" the raw card identifier and presses Enter.
 */
export function BarcodeKioskInput({
  onScan,
  disabled,
}: {
  onScan: (cardIdentifier: string) => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [buffer, setBuffer] = useState("");

  useEffect(() => {
    if (!disabled) ref.current?.focus();
  }, [disabled]);

  return (
    <>
    <div
      className="relative cursor-text select-none rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/50 px-6 py-10 text-center"
      onClick={() => ref.current?.focus()}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl brand-gradient text-primary-foreground"
      >
        <CreditCard className="h-7 w-7" />
      </motion.div>
      <p className="mt-4 text-lg font-semibold text-foreground">Tap or scan your student ID card</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Hold your card under the scanner. Check-in is automatic.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!buffer.trim()) return;
          onScan(buffer);
          setBuffer("");
        }}
      >
        <input
          ref={ref}
          value={buffer}
          disabled={disabled}
          onChange={(e) => setBuffer(e.target.value)}
          onBlur={() => !disabled && setTimeout(() => ref.current?.focus(), 80)}
          aria-label="Barcode scanner input"
          autoComplete="off"
          className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent outline-none"
        />
      </form>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs text-muted-foreground">
        <ScanLine className="h-3.5 w-3.5 text-primary" />
        {buffer ? `Reading… ${buffer}` : "Scanner ready — listening for input"}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Demo: type a card ID (e.g. <span className="font-mono text-foreground">DSU2100455X</span>) and press Enter.
      </p>
    </div>
    <Button
      variant="brand"
      size="lg"
      className="mt-4 w-full"
      disabled={disabled}
      onClick={() => onScan("DSU2100455X")}
    >
      <ScanLine className="h-4 w-4" /> Simulate successful scan
    </Button>
    </>
  );
}