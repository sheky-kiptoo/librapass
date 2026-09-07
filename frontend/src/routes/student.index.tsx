import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, Laptop, LogOut, MapPin, Plus, QrCode, Timer } from "lucide-react";

import { PageHeader } from "@/components/libra/app-shell";
import { ChannelBadge } from "@/components/libra/channel-badge";
import { Badge, Button, Card, CardHeader, StatCard, Table, Td, Th } from "@/components/libra/ui";
import { useLibraryUser } from "@/hooks/use-library-user";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [{ title: "Student Dashboard — LibraPass" }],
  }),
  component: StudentDashboard,
});

const statusTone = { approved: "success", pending: "warning", flagged: "danger" } as const;

function StudentDashboard() {
  const { user, devices, visits, loading, refetch } = useLibraryUser();

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading your dashboard...</p>;
  }

  if (!user) {
    return <p className="p-6 text-sm text-muted-foreground">Could not find your account. Please log in again.</p>;
  }

  const openVisit = visits.find((v) => v.check_out === null);
  const device = devices.find((d) => d.id === openVisit?.device_id);
  const recentVisits = visits.slice(0, 5);

  async function handleCheckOut() {
    if (!openVisit) return;
    const now = new Date();
    const checkOutTime = now.toTimeString().slice(0, 5); // e.g. "14:32"

    // Work out how long the visit lasted, in minutes
        const checkInParts = openVisit.check_in.split(":");
    const inHours = Number(checkInParts[0] ?? 0);
    const inMinutes = Number(checkInParts[1] ?? 0);
    const checkInTotalMinutes = inHours * 60 + inMinutes;
    const checkOutTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const duration = Math.max(0, checkOutTotalMinutes - checkInTotalMinutes);

    await supabase
      .from("visits")
      .update({ check_out: checkOutTime, duration_minutes: duration })
      .eq("id", openVisit.id);

    refetch(); // pull fresh data so the dashboard updates immediately
  }

  const avgDuration =
    visits.filter((v) => v.duration_minutes).length > 0
      ? Math.round(
          visits.filter((v) => v.duration_minutes).reduce((sum, v) => sum + (v.duration_minutes ?? 0), 0) /
            visits.filter((v) => v.duration_minutes).length
        )
      : 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.full_name.split(" ")[0]} 👋`}
        description={`${user.course ?? user.department ?? ""} ${user.year ? `· Year ${user.year}` : ""} · ${user.faculty ?? ""}`}
        action={
          openVisit ? (
            <Button variant="outline" onClick={handleCheckOut}>
              <LogOut className="h-4 w-4" /> Check Out
            </Button>
          ) : (
            <Link to="/student/check-in">
              <Button variant="brand">
                <QrCode className="h-4 w-4" /> Scan Library QR
              </Button>
            </Link>
          )
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="card-surface overflow-hidden"
      >
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current session</p>
            {openVisit ? (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">Currently Inside Library</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Checked in at {openVisit.check_in}. Remember to check out when you leave so your visit is logged accurately.
                </p>
                <Button variant="outline" size="lg" className="mt-4" onClick={handleCheckOut}>
                  <LogOut className="h-4 w-4" /> Check Out of Library
                </Button>
              </>
            ) : (
              <>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  Not Currently Inside Library
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your last visit was closed. Scan the entrance QR to start a new session.
                </p>
                <Link to="/student/check-in">
                  <Button variant="brand" size="lg" className="mt-4">
                    <QrCode className="h-4 w-4" /> Scan Library QR
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 self-center">
            <SessionFact icon={<Clock className="h-4 w-4" />} label="Checked in" value={openVisit?.check_in ?? "—"} />
            <SessionFact icon={<Laptop className="h-4 w-4" />} label="Device" value={device?.name ?? "N/A"} />
            <SessionFact icon={<MapPin className="h-4 w-4" />} label="Library" value={openVisit?.library ?? "—"} />
            <div className="rounded-xl border border-border p-3">
              <p className="text-[11px] text-muted-foreground">Channel used</p>
              <div className="mt-1.5">
                {openVisit ? <ChannelBadge channel={openVisit.channel} /> : <span className="text-sm text-muted-foreground">—</span>}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total visits" value={visits.length} icon={<Timer className="h-4 w-4" />} />
        <StatCard
          label="Avg. duration"
          value={avgDuration ? `${Math.floor(avgDuration / 60)}h ${avgDuration % 60}m` : "—"}
          sub="All time"
          delay={0.05}
        />
        <StatCard label="Registered devices" value={devices.length} delay={0.1} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader
            title="Registered Devices"
            description="Laptops and tablets linked to your account"
            action={
              <Link to="/student/devices">
                <Button variant="ghost" size="sm">
                  <Plus className="h-3.5 w-3.5" /> Manage
                </Button>
              </Link>
            }
          />
          <div className="space-y-3 p-5">
            {devices.length === 0 && <p className="text-sm text-muted-foreground">No devices registered yet.</p>}
            {devices.map((d) => (
              <div key={d.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.manufacturer}</p>
                  </div>
                  <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                </div>
                <p className="mt-3 font-mono text-[11px] text-muted-foreground">SN · {d.serial_number}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Recent Visit History"
            action={
              <Link to="/student/history" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Check In</Th>
                <Th>Check Out</Th>
                <Th>Duration</Th>
                <Th>Channel</Th>
              </tr>
            </thead>
            <tbody>
              {recentVisits.map((v) => (
                <tr key={v.id} className="transition-colors hover:bg-muted/40">
                  <Td>{v.visit_date}</Td>
                  <Td>{v.check_in}</Td>
                  <Td>{v.check_out ?? <Badge tone="success">Active</Badge>}</Td>
                  <Td>{v.duration_minutes ? `${Math.floor(v.duration_minutes / 60)}h ${v.duration_minutes % 60}m` : "—"}</Td>
                  <Td>
                    <ChannelBadge channel={v.channel} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}

function SessionFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}