import { createFileRoute } from "@tanstack/react-router";
import { Building2, Palette, ScanLine, Users } from "lucide-react";

import { PageHeader } from "@/components/libra/app-shell";
import { Badge, Button, Card, CardHeader, Input } from "@/components/libra/ui";
import { institution } from "@/lib/libra/mock-data";

export const Route = createFileRoute("/librarian/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LibraPass" },
      { name: "description", content: "Institution settings: branding, ID card format and faculty list." },
      { property: "og:title", content: "Settings — LibraPass" },
      { property: "og:description", content: "Per-institution configuration for the LibraPass platform." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Configuration scoped to your institution tenant"
        action={<Badge tone="info">Tenant: {institution.id}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Institution Settings"
            description="LibraPass is multi-tenant — each university configures its own branding and card format"
            action={<Building2 className="h-4 w-4 text-muted-foreground" />}
          />
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <Input label="Institution name" defaultValue={institution.name} />
            <Input label="Short name" defaultValue={institution.shortName} />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Institution logo</label>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                  DU
                </div>
                <Button variant="outline" size="sm">
                  Upload logo
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Palette className="h-3.5 w-3.5" /> Primary color
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                <span className="h-6 w-6 rounded-md bg-primary" />
                <span className="font-mono text-sm text-foreground">{institution.primaryColor}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="ID Card Format"
            description="Card identifiers are opaque — no symbology is assumed"
            action={<ScanLine className="h-4 w-4 text-muted-foreground" />}
          />
          <div className="p-5">
            <p className="rounded-xl bg-muted/60 p-4 text-sm text-foreground">{institution.idFormatNote}</p>
            <div className="mt-4">
              <Input label="Example card identifier" defaultValue="DSU2100455X" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Any scanner that behaves like a keyboard will work — the raw string is matched to a student record.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Faculties & Departments"
            description="Used for reporting filters"
            action={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <div className="space-y-2 p-5">
            {institution.faculties.map((f) => (
              <div key={f} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-foreground">{f}</span>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
            <Button variant="soft" size="sm" className="w-full">
              Add faculty
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Libraries" description="Physical locations recording visits under this tenant" />
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {institution.libraries.map((l) => (
              <div key={l} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{l}</p>
                  <p className="text-xs text-muted-foreground">Kiosks enabled · QR enabled</p>
                </div>
                <Badge tone="success">Active</Badge>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-border bg-muted/40 px-5 py-3">
            <Button variant="outline">Discard</Button>
            <Button variant="brand">Save settings</Button>
          </div>
        </Card>
      </div>
    </>
  );
}