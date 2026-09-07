import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { MonitorSmartphone, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/libra/app-shell";
import { Badge, Button, Card, CardHeader, StatCard, Table, Td, Th } from "@/components/libra/ui";
import { ChannelBadge } from "@/components/libra/channel-badge";
import { kiosks, recentActivity } from "@/lib/libra/mock-data";

export const Route = createFileRoute("/librarian/kiosks")({
  head: () => ({
    meta: [
      { title: "Kiosk Monitor — LibraPass" },
      { name: "description", content: "Check the online status and last scan of every library entrance kiosk." },
      { property: "og:title", content: "Kiosk Monitor — LibraPass" },
      { property: "og:description", content: "Live status of library check-in kiosks." },
    ],
  }),
  component: KioskMonitor,
});

const tone = { online: "success", idle: "warning", offline: "danger" } as const;

function KioskMonitor() {
  return (
    <>
      <PageHeader
        title="Kiosk Monitor"
        description="Physical card-scan terminals across campus libraries"
        action={
          <Button variant="outline">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Kiosks online" value={`${kiosks.filter((k) => k.status !== "offline").length}/${kiosks.length}`} icon={<MonitorSmartphone className="h-4 w-4" />} />
        <StatCard label="Card scans today" value={kiosks.reduce((n, k) => n + k.scansToday, 0)} delay={0.05} />
        <StatCard label="Offline terminals" value={kiosks.filter((k) => k.status === "offline").length} delay={0.1} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {kiosks.map((k, i) => (
          <motion.div
            key={k.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <MonitorSmartphone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{k.label}</p>
                    <p className="text-xs text-muted-foreground">{k.location}</p>
                  </div>
                </div>
                <Badge tone={tone[k.status]}>
                  <span
                    className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${
                      k.status === "online" ? "animate-pulse bg-primary" : "bg-current"
                    }`}
                  />
                  {k.status}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Last scan</p>
                  <p className="mt-0.5 font-medium text-foreground">{k.lastScan}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-muted-foreground">Scans today</p>
                  <p className="mt-0.5 font-medium text-foreground">{k.scansToday}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader title="Latest kiosk scans" description="Card and web check-ins captured at terminals" />
        <Table>
          <thead>
            <tr>
              <Th>Student</Th>
              <Th>Time</Th>
              <Th>Channel</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {recentActivity
              .filter((r) => r.channel !== "qr")
              .map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-muted/40">
                  <Td className="font-medium">{r.student}</Td>
                  <Td>{r.time}</Td>
                  <Td>
                    <ChannelBadge channel={r.channel} />
                  </Td>
                  <Td>{r.action}</Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}