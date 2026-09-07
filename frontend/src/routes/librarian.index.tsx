import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Clock, CreditCard, Laptop, Monitor, QrCode, Search, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { ChannelBadge } from "@/components/libra/channel-badge";
import { Badge, Card, CardHeader, Input, StatCard, Table, Td, Th } from "@/components/libra/ui";
import { useLibrarianData } from "@/hooks/use-librarian-data";

export const Route = createFileRoute("/librarian/")({
  head: () => ({ meta: [{ title: "Librarian Dashboard — LibraPass" }] }),
  component: LibrarianDashboard,
});

const CHART_COLORS = ["oklch(0.452 0.109 161.5)", "oklch(0.62 0.13 250)", "oklch(0.78 0.16 78)"];
const axis = { stroke: "oklch(0.554 0.046 257.417)", fontSize: 11 };
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function LibrarianDashboard() {
  const { librarianName, institution, users, devices, visits, loading } = useLibrarianData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const deviceMap = useMemo(() => new Map(devices.map((d) => [d.id, d])), [devices]);

  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = visits.filter((v) => v.visit_date === today);

  const stats = useMemo(() => {
    const visitorsToday = new Set(todayVisits.map((v) => v.student_id)).size;
    const currentlyInside = visits.filter((v) => v.check_out === null).length;

    const hourCounts: Record<string, number> = {};
    visits.forEach((v) => {
      const h = v.check_in.slice(0, 2);
      hourCounts[h] = (hourCounts[h] ?? 0) + 1;
    });
    const peakHourEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    const peakHour = peakHourEntry ? `${peakHourEntry[0]}:00` : "—";

    const completed = visits.filter((v) => v.duration_minutes);
    const avgMinutes = completed.length
      ? Math.round(completed.reduce((s, v) => s + (v.duration_minutes ?? 0), 0) / completed.length)
      : 0;

    const byChannel = { qr: 0, card: 0, web: 0 };
    todayVisits.forEach((v) => { byChannel[v.channel]++; });

    return { visitorsToday, currentlyInside, peakHour, avgMinutes, byChannel };
  }, [visits, todayVisits]);

  const hourlyCheckIns = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      const h = `${v.check_in.slice(0, 2)}:00`;
      counts[h] = (counts[h] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, checkIns]) => ({ hour, checkIns }));
  }, [visits]);

  const weeklyVisits = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      const day = DAY_NAMES[new Date(v.visit_date).getDay()];
      counts[day] = (counts[day] ?? 0) + 1;
    });
    return DAY_NAMES.map((day) => ({ day, visits: counts[day] ?? 0 }));
  }, [visits]);

  const facultyUsage = useMemo(() => {
    const counts: Record<string, number> = {};
    visits.forEach((v) => {
      const faculty = userMap.get(v.student_id)?.faculty ?? "Other";
      const short = faculty.replace("School of ", "").split(" ")[0];
      counts[short] = (counts[short] ?? 0) + 1;
    });
    return Object.entries(counts).map(([faculty, visits]) => ({ faculty, visits }));
  }, [visits, userMap]);

  const channelSplit = useMemo(() => {
    const counts = { qr: 0, card: 0, web: 0 };
    visits.forEach((v) => { counts[v.channel]++; });
    return [
      { channel: "qr", label: "QR", value: counts.qr },
      { channel: "card", label: "Card", value: counts.card },
      { channel: "web", label: "Web", value: counts.web },
    ];
  }, [visits]);

  const deviceRegistrations = useMemo(() => {
    const counts: Record<string, number> = {};
    devices.forEach((d) => {
      const date = new Date(d.registered_on);
      const label = MONTH_NAMES[date.getMonth()];
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return Object.entries(counts).map(([month, devices]) => ({ month, devices }));
  }, [devices]);

  const recentActivity = useMemo(() => {
    type Row = { id: string; studentId: string; action: "Check In" | "Check Out"; time: string; deviceId: string | null; channel: Visit["channel"] };
    const rows: Row[] = [];
    visits.forEach((v) => {
      rows.push({ id: `${v.id}-in`, studentId: v.student_id, action: "Check In", time: v.check_in, deviceId: v.device_id, channel: v.channel });
      if (v.check_out) {
        rows.push({ id: `${v.id}-out`, studentId: v.student_id, action: "Check Out", time: v.check_out, deviceId: v.device_id, channel: v.channel });
      }
    });
    return rows.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 8);
  }, [visits]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.full_name} ${u.admission_number} ${u.card_identifier} ${u.course ?? ""}`.toLowerCase().includes(q)
    );
  }, [query, users]);

  const selected = users.find((u) => u.id === selectedId) ?? results[0];
  const selectedDevices = selected ? devices.filter((d) => d.student_id === selected.id) : [];
  const selectedVisits = selected ? visits.filter((v) => v.student_id === selected.id) : [];

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading library overview...</p>;
  }

  return (
    <>
      <PageHeader
        title="Library Overview"
        description={`${institution?.name ?? ""} · ${librarianName ? `Signed in as ${librarianName}` : ""}`}
        action={
          <Link to="/librarian/kiosks" className="text-xs font-medium text-primary hover:underline">
            View kiosk monitor →
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Visitors Today" value={stats.visitorsToday} icon={<Users className="h-4 w-4" />} accent />
        <StatCard label="Students Currently Inside" value={stats.currentlyInside} sub="Live occupancy" icon={<TrendingUp className="h-4 w-4" />} delay={0.05} />
        <StatCard label="Registered Devices" value={devices.length} icon={<Laptop className="h-4 w-4" />} delay={0.1} />
        <StatCard label="Peak Hour" value={stats.peakHour} icon={<Clock className="h-4 w-4" />} delay={0.15} />
        <StatCard label="Average Visit Duration" value={stats.avgMinutes ? `${Math.floor(stats.avgMinutes / 60)}h ${stats.avgMinutes % 60}m` : "—"} delay={0.2} />
        <div className="card-surface p-5">
          <p className="text-xs font-medium text-muted-foreground">Today's Check-ins by channel</p>
          <div className="mt-3 space-y-2">
            {[
              { channel: "qr" as const, icon: QrCode, label: "QR (phone)", value: stats.byChannel.qr },
              { channel: "card" as const, icon: CreditCard, label: "ID card", value: stats.byChannel.card },
              { channel: "web" as const, icon: Monitor, label: "Web login", value: stats.byChannel.web },
            ].map((row) => (
              <div key={row.channel} className="flex items-center justify-between gap-2">
                <ChannelBadge channel={row.channel} />
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="ml-auto text-sm font-semibold text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Hourly Check-ins" description="All recorded visits, by hour" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyCheckIns}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" vertical={false} />
                <XAxis dataKey="hour" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="checkIns" stroke={CHART_COLORS[0]} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Weekly Visits" description="By day of week, all time" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" vertical={false} />
                <XAxis dataKey="day" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.968 0.007 247.896)" }} />
                <Bar dataKey="visits" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Faculty Usage" description="Visits by faculty" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" horizontal={false} />
                <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="faculty" width={80} tick={axis} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.968 0.007 247.896)" }} />
                <Bar dataKey="visits" fill={CHART_COLORS[1]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Check-in Channel Split" description="QR vs ID card vs Web" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelSplit} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {channelSplit.map((entry, i) => (
                    <Cell key={entry.channel} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Device Registration" description="New devices registered per month" />
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" vertical={false} />
                <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.968 0.007 247.896)" }} />
                <Bar dataKey="devices" fill={CHART_COLORS[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent Activity" description="Live entry and exit events across all channels" />
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Admission No.</Th>
              <Th>Action</Th>
              <Th>Time</Th>
              <Th>Device</Th>
              <Th>Channel</Th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{userMap.get(row.studentId)?.full_name ?? "Unknown"}</Td>
                <Td className="font-mono text-xs">{userMap.get(row.studentId)?.admission_number}</Td>
                <Td><Badge tone={row.action === "Check In" ? "success" : "neutral"}>{row.action}</Badge></Td>
                <Td>{row.time}</Td>
                <Td>{row.deviceId ? deviceMap.get(row.deviceId)?.name ?? "—" : "—"}</Td>
                <Td><ChannelBadge channel={row.channel} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Search Users" description="By name, admission number or card identifier" />
          <div className="p-5">
            <Input
              placeholder="e.g. Amina, 21-0455 or DSU2100455X"
              icon={<Search className="h-4 w-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-4 space-y-2">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedId(u.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected?.id === u.id ? "border-primary bg-primary-soft" : "border-border hover:bg-muted"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">{u.full_name}</span>
                    <span className="block text-xs text-muted-foreground">{u.course ?? u.department}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{u.admission_number}</span>
                </button>
              ))}
              {results.length === 0 && <p className="text-sm text-muted-foreground">No matching users.</p>}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="User Details" description="Selected record" />
          <div className="p-5">
            {selected ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-sm font-semibold text-primary-foreground">
                    {selected.full_name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{selected.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selected.email}</p>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["Admission No.", selected.admission_number],
                    ["Card ID", selected.card_identifier],
                    ["Course", selected.course ?? selected.department ?? "—"],
                    ["Faculty", selected.faculty ?? "—"],
                    ["Devices", String(selectedDevices.length)],
                    ["Visits logged", String(selectedVisits.length)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border p-3">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Recent visits</p>
                  <div className="space-y-1.5">
                    {selectedVisits.slice(0, 3).map((v) => (
                      <div key={v.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                        <span className="text-foreground">{v.visit_date} · {v.check_in}</span>
                        <ChannelBadge channel={v.channel} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select a user to view details.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}