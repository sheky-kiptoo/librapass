import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Laptop, Plus } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { Badge, Button, Card, Input, Modal } from "@/components/libra/ui";
import { useLibraryUser } from "@/hooks/use-library-user";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/student/devices")({
  validateSearch: (search: Record<string, unknown>): { select?: boolean | undefined } => ({
    select: search["select"] === true || search["select"] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [{ title: "My Devices — LibraPass" }],
  }),
  component: DevicesPage,
});

const statusTone = { approved: "success", pending: "warning", flagged: "danger" } as const;

function DevicesPage() {
  const { user, devices, loading, refetch } = useLibraryUser();
  const [modal, setModal] = useState<null | "new" | "edit">(null);
  const [deviceName, setDeviceName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const { select } = Route.useSearch();
  const navigate = useNavigate();

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading your devices...</p>;
  }
  if (!user) {
    return <p className="p-6 text-sm text-muted-foreground">Could not find your account. Please log in again.</p>;
  }

  const pick = (deviceId: string) => {
    navigate({ to: "/student/check-in", search: { deviceId } });
  };

  async function handleRegisterDevice() {
    if (!user || !deviceName) return;
    setSaving(true);

    await supabase.from("devices").insert({
      id: `${user.id}_d${Date.now()}`, // simple unique id
      student_id: user.id,
      name: deviceName,
      manufacturer,
      serial_number: serialNumber,
      status: "pending",
      registered_on: new Date().toISOString().slice(0, 10),
    });

    setSaving(false);
    setModal(null);
    setDeviceName("");
    setManufacturer("");
    setSerialNumber("");
    refetch();
  }

  return (
    <>
      <PageHeader
        title={select ? "Which laptop did you bring?" : "My Devices"}
        description={
          select
            ? "Choose the device you have with you today, then continue to check in."
            : "Devices verified at the library entrance during check-in"
        }
        action={
          <Button variant="brand" onClick={() => setModal("new")}>
            <Plus className="h-4 w-4" /> Register New Device
          </Button>
        }
      />

      {select && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-primary-soft/50 p-4">
          <p className="text-sm text-foreground">Only approved devices can be taken into the library.</p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => navigate({ to: "/student/check-in" })}
          >
            I did not bring a laptop
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devices.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            whileHover={{ y: -3 }}
          >
            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Laptop className="h-5 w-5" />
                </span>
                <Badge tone={statusTone[d.status]}>{d.status}</Badge>
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.manufacturer}</p>
              <dl className="mt-4 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Serial number</dt>
                  <dd className="font-mono text-foreground">{d.serial_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Registered</dt>
                  <dd className="text-foreground">{d.registered_on}</dd>
                </div>
              </dl>
              {select ? (
                <Button
                  variant="brand"
                  size="sm"
                  className="mt-4 w-full"
                  disabled={d.status !== "approved"}
                  onClick={() => pick(d.id)}
                >
                  <Check className="h-4 w-4" />
                  {d.status === "approved" ? "I have this one today" : "Not approved yet"}
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setModal("edit")}>
                  Edit Device
                </Button>
              )}
            </Card>
          </motion.div>
        ))}

        <button
          onClick={() => setModal("new")}
          className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Register New Device</span>
        </button>
      </div>

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Edit device" : "Register new device"}
        description="Device details are verified by library staff before approval."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="brand" onClick={handleRegisterDevice} disabled={saving || !deviceName}>
              {saving ? "Saving..." : modal === "edit" ? "Save changes" : "Submit for approval"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Device name"
            placeholder="Amina's MacBook Air"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
          <Input
            label="Manufacturer"
            placeholder="Apple"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />
          <Input
            label="Serial number"
            placeholder="C02XK1QWJGH5"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}