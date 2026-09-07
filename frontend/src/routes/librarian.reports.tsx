import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Filter } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { ChannelBadge } from "@/components/libra/channel-badge";
import { Button, Card, CardHeader, Input, Table, Td, Th } from "@/components/libra/ui";
import { institution, students } from "@/lib/libra/mock-data";
import type { CheckInChannel } from "@/lib/libra/types";

export const Route = createFileRoute("/librarian/reports")({
  head: () => ({
    meta: [
      { title: "Reports — LibraPass" },
      { name: "description", content: "Filter library visits by date, faculty, course, department and channel." },
      { property: "og:title", content: "Reports — LibraPass" },
      { property: "og:description", content: "Exportable library usage reports." },
    ],
  }),
  component: ReportsPage,
});

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function ReportsPage() {
  const [channel, setChannel] = useState<"all" | CheckInChannel>("all");

  const rows = students.flatMap((s) =>
    s.visits.map((v) => ({ ...v, student: s.fullName, faculty: s.faculty, course: s.course })),
  );
  const filtered = rows.filter((r) => channel === "all" || r.channel === channel).slice(0, 20);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Build and export library usage reports"
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
            <Button variant="brand">
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="Filters"
          description="Narrow results before exporting"
          action={<Filter className="h-4 w-4 text-muted-foreground" />}
        />
        <div className="grid gap-4 p-5 md:grid-cols-3 xl:grid-cols-5">
          <Input label="From" type="date" defaultValue="2026-07-01" />
          <Input label="To" type="date" defaultValue="2026-08-04" />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Faculty</label>
            <select className={selectClass}>
              <option>All faculties</option>
              {institution.faculties.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Course / Department</label>
            <select className={selectClass}>
              <option>All courses</option>
              {[...new Set(students.map((s) => s.course))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Channel</label>
            <select
              className={selectClass}
              value={channel}
              onChange={(e) => setChannel(e.target.value as "all" | CheckInChannel)}
            >
              <option value="all">All channels</option>
              <option value="qr">QR (phone)</option>
              <option value="card">ID card scan</option>
              <option value="web">Web login</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Analytics table" description={`${filtered.length} records`} />
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Student</Th>
              <Th>Faculty</Th>
              <Th>Course</Th>
              <Th>Check In</Th>
              <Th>Check Out</Th>
              <Th>Duration</Th>
              <Th>Channel</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-muted/40">
                <Td>{r.date}</Td>
                <Td className="font-medium">{r.student}</Td>
                <Td className="text-xs">{r.faculty}</Td>
                <Td className="text-xs">{r.course}</Td>
                <Td>{r.checkIn}</Td>
                <Td>{r.checkOut ?? "—"}</Td>
                <Td>
                  {r.durationMinutes ? `${Math.floor(r.durationMinutes / 60)}h ${r.durationMinutes % 60}m` : "—"}
                </Td>
                <Td>
                  <ChannelBadge channel={r.channel} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}