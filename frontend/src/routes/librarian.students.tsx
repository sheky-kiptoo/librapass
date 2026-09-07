import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { ChannelBadge } from "@/components/libra/channel-badge";
import { Badge, Button, Card, CardHeader, Input, Modal, Table, Td, Th } from "@/components/libra/ui";
import { useLibrarianData } from "@/hooks/use-librarian-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/librarian/students")({
  head: () => ({
    meta: [
      { title: "Students — LibraPass" },
      { name: "description", content: "Search the student register, card identifiers and library visit activity." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const { users, devices, visits, loading, refetch } = useLibrarianData();
  const [query, setQuery] = useState("");
  const [register, setRegister] = useState(false);
  const [linkAdmission, setLinkAdmission] = useState("");
  const [linkCard, setLinkCard] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linking, setLinking] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((s) =>
      `${s.full_name} ${s.admission_number} ${s.card_identifier} ${s.course ?? ""} ${s.faculty ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, users]);

  const deviceCount = (studentId: string) => devices.filter((d) => d.student_id === studentId).length;
  const lastVisit = (studentId: string) =>
    visits.filter((v) => v.student_id === studentId).sort((a, b) => b.visit_date.localeCompare(a.visit_date))[0];
  const isInside = (studentId: string) => visits.some((v) => v.student_id === studentId && v.check_out === null);

  async function handleLinkCard() {
    setLinkError("");
    if (!linkAdmission || !linkCard) return;
    setLinking(true);

    const { data: existing } = await supabase
      .from("library_users")
      .select("id")
      .eq("admission_number", linkAdmission)
      .maybeSingle();

    if (!existing) {
      setLinkError("No student found with that admission number.");
      setLinking(false);
      return;
    }

    await supabase.from("library_users").update({ card_identifier: linkCard }).eq("id", existing.id);
    setLinking(false);
    setRegister(false);
    setLinkAdmission("");
    setLinkCard("");
    refetch();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading students...</p>;
  }

  return (
    <>
      <PageHeader
        title="Students"
        description="All students and staff registered under your institution"
        action={
          <Button variant="brand" onClick={() => setRegister(true)}>
            <UserPlus className="h-4 w-4" /> Link a card
          </Button>
        }
      />

      <Card>
        <CardHeader
          title={`${rows.length} users`}
          action={
            <div className="w-64">
              <Input
                placeholder="Search name, admission no. or card ID"
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
              <Th>User</Th>
              <Th>Admission No.</Th>
              <Th>Card Identifier</Th>
              <Th>Faculty</Th>
              <Th>Devices</Th>
              <Th>Last channel</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const lv = lastVisit(s.id);
              return (
                <tr key={s.id} className="transition-colors hover:bg-muted/40">
                  <Td>
                    <span className="block font-medium">{s.full_name}</span>
                    <span className="block text-xs text-muted-foreground">{s.course ?? s.department}</span>
                  </Td>
                  <Td className="font-mono text-xs">{s.admission_number}</Td>
                  <Td className="font-mono text-xs">{s.card_identifier}</Td>
                  <Td className="text-xs">{s.faculty ?? "—"}</Td>
                  <Td>{deviceCount(s.id)}</Td>
                  <Td>{lv && <ChannelBadge channel={lv.channel} />}</Td>
                  <Td>
                    <Badge tone={isInside(s.id) ? "success" : "neutral"}>
                      {isInside(s.id) ? "Inside" : "Outside"}
                    </Badge>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={register}
        onClose={() => setRegister(false)}
        title="Link a card to a student"
        description="Used after an unregistered card is scanned at a kiosk."
        footer={
          <>
            <Button variant="outline" onClick={() => setRegister(false)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleLinkCard} disabled={linking}>
              {linking ? "Linking..." : "Link card"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Admission number"
            placeholder="21-0455"
            value={linkAdmission}
            onChange={(e) => setLinkAdmission(e.target.value)}
          />
          <Input
            label="Card identifier (raw scan)"
            placeholder="Scan the card now…"
            value={linkCard}
            onChange={(e) => setLinkCard(e.target.value)}
          />
          {linkError && <p className="text-sm text-red-600">{linkError}</p>}
          <p className="text-xs text-muted-foreground">
            Card identifiers are stored as opaque strings — no symbology assumptions.
          </p>
        </div>
      </Modal>
    </>
  );
}