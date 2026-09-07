import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/libra/app-shell";
import { Badge, Button, Card, CardHeader, Input } from "@/components/libra/ui";
import { currentStudent, institution } from "@/lib/libra/mock-data";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — LibraPass" },
      { name: "description", content: "View your student record, card identifier and library account details." },
      { property: "og:title", content: "My Profile — LibraPass" },
      { property: "og:description", content: "Your LibraPass student account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const s = currentStudent;
  return (
    <>
      <PageHeader title="Profile" description="Your student record as held by the library system" />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full brand-gradient text-2xl font-semibold text-primary-foreground">
            {s.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <p className="mt-4 text-lg font-semibold text-foreground">{s.fullName}</p>
          <p className="text-sm text-muted-foreground">{s.course}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Badge tone="success">Active</Badge>
            <Badge tone="info">Year {s.year}</Badge>
          </div>
          <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-left">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Card identifier</p>
            <p className="mt-1 font-mono text-sm text-foreground">{s.cardIdentifier}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">{institution.idFormatNote}</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Account details" description="Contact the library desk to change locked fields" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="Full name" defaultValue={s.fullName} />
            <Input label="Admission number" defaultValue={s.admissionNumber} disabled />
            <Input label="Email" defaultValue={s.email} />
            <Input label="Course" defaultValue={s.course} disabled />
            <Input label="Faculty" defaultValue={s.faculty} disabled className="sm:col-span-2" />
            <Input label="Institution" defaultValue={institution.name} disabled className="sm:col-span-2" />
          </div>
          <div className="flex justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
            <Button variant="outline">Cancel</Button>
            <Button variant="brand">Save changes</Button>
          </div>
        </Card>
      </div>
    </>
  );
}