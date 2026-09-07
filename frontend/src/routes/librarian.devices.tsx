import { createFileRoute } from "@tanstack/react-router";
import { Check, Flag, Laptop, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { Badge, Button, Card, CardHeader, Input, StatCard, Table, Td, Th } from "@/components/libra/ui";
import { useLibrarianData } from "@/hooks/use-librarian-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/librarian/devices")({
  head: () => ({
    meta: [
      { title: "Devices — LibraPass" },
      { name: "description", content: "Review every laptop and tablet registered for library entry." },
    ],
  }),
  component: DevicesPage,
});

const statusTone = { approved: "success", pending: "warning", flagged: "danger" } as const;

function DevicesPage() {
  const { devices, users, loading, refetch } = useLibrarianData();
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withOwner = devices.map((d) => ({ ...d, owner: userMap.get(d.student_id) }));
    if (!q) return withOwner;
    return withOwner.filter((d) =>
      `${d.name} ${d.manufacturer} ${d.serial_number} ${d.owner?.full_name ?? ""}`.toLowerCase().includes(q)
    );
  }, [devices, userMap, query]);

  async function setStatus(deviceId: string, status: "approved" | "pending" | "flagged") {
    setUpdating(deviceId);
    await supabase.from("devices").update({ status }).eq("id", deviceId);
    setUpdating(null);
    refetch();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading devices...</p>;
  }

  return (
    <>
      <PageHeader title="Devices" description="Devices verified during check-in across the institution" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total registered" value={devices.length} icon={<Laptop className="h-4 w-4" />} />
        <StatCard label="Pending approval" value={devices.filter((d) => d.status === "pending").length} delay={0.05} />
        <StatCard label="Flagged" value={devices.filter((d) => d.status === "flagged").length} delay={0.1} />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Device register"
          action={
            <div className="w-64">
              <Input
                placeholder="Search device or owner"
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
              <Th>Device</Th>
              <Th>Manufacturer</Th>
              <Th>Serial Number</Th>
              <Th>Owner</Th>
              <Th>Registered</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="transition-colors hover:bg-muted/40">
                <Td className="font-medium">{d.name}</Td>
                <Td>{d.manufacturer}</Td>
                <Td className="font-mono text-xs">{d.serial_number}</Td>
                <Td>
                  <span className="block">{d.owner?.full_name ?? "Unknown"}</span>
                  <span className="block font-mono text-xs text-muted-foreground">{d.owner?.admission_number}</span>
                </Td>
                <Td>{d.registered_on}</Td>
                <Td>
                  <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-1.5">
                    {d.status !== "approved" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updating === d.id}
                        onClick={() => setStatus(d.id, "approved")}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                    )}
                    {d.status !== "flagged" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={updating === d.id}
                        onClick={() => setStatus(d.id, "flagged")}
                      >
                        <Flag className="h-3.5 w-3.5" /> Flag
                      </Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}