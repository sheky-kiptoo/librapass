import { CreditCard, QrCode, Monitor } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CheckInChannel } from "@/lib/libra/types";

const map = {
  qr: { label: "QR", icon: QrCode, tone: "bg-primary-soft text-primary" },
  card: { label: "Card", icon: CreditCard, tone: "bg-info/12 text-info" },
  web: { label: "Web", icon: Monitor, tone: "bg-warning/25 text-warning-foreground" },
} as const;

export function ChannelBadge({
  channel,
  className,
  showLabel = true,
}: {
  channel: CheckInChannel;
  className?: string;
  showLabel?: boolean;
}) {
  const entry = map[channel];
  const Icon = entry.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        entry.tone,
        className,
      )}
      title={`Checked in via ${entry.label}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {showLabel && entry.label}
    </span>
  );
}