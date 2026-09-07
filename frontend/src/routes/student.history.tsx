import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { ChannelBadge } from "@/components/libra/channel-badge";
import { Badge, Card, CardHeader, Input, StatCard, Table, Td, Th } from "@/components/libra/ui";
import { currentStudent } from "@/lib/libra/mock-data";
import { useCompletedVisits } from "@/lib/libra/session-store";

export const Route = createFileRoute("/student/history")({
  head: () => ({
    meta: [
      { title: "Visit History — LibraPass" },
      { name: "description", content: "Review every library visit, duration, device used and check-in channel." },
      { property: "og:title", content: "Visit History — LibraPass" },
      { property: "og:description", content: "Your complete library visit log." },
    ],
  }),
  component: HistoryPage,
});

function fmt(minutes: number | null) {
  if (!minutes) return "—";
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function HistoryPage() {
  const [query, setQuery] = useState("");
  const logged = useCompletedVisits(currentStudent.id);
  const visits = useMemo(() => [...logged, ...currentStudent.visits], [logged]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter((v) => `${v.date} ${v.checkIn} ${v.channel} ${v.library}`.toLowerCase().includes(q));
  }, [query, visits]);

  const completed = visits.filter((v) => v.durationMinutes);
  const avg = Math.round(
    completed.reduce((sum, v) => sum + (v.durationMinutes ?? 0), 0) / Math.max(completed.length, 1),
  );

  const deviceName = (id: string | null) =>
    id ? currentStudent.devices.find((d) => d.id === id)?.name ?? "—" : "—";

  return (
    <>
      <PageHeader title="Visit History" description="Every recorded entry and exit across all check-in channels" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total visits" value={visits.length} />
        <StatCard label="Average visit duration" value={fmt(avg)} delay={0.05} />
        <StatCard label="This month" value={visits.filter((v) => v.date.startsWith("2026-08")).length} delay={0.1} />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="All visits"
          action={
            <div className="w-56">
              <Input
                placeholder="Search visits…"
                icon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          }
        />
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Check In</Th>
              <Th>Check Out</Th>
              <Th>Duration</Th>
              <Th>Device Used</Th>
              <Th>Channel</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-muted/40">
                <Td>{v.date}</Td>
                <Td>{v.checkIn}</Td>
                <Td>{v.checkOut ?? <Badge tone="success">Active</Badge>}</Td>
                <Td>{fmt(v.durationMinutes)}</Td>
                <Td>{deviceName(v.deviceId)}</Td>
                <Td>
                  <ChannelBadge channel={v.channel} />
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td className="py-8 text-center text-muted-foreground">No visits match your search.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
}