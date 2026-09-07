import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Laptop, ScanLine } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/libra/app-shell";
import { QRScannerPlaceholder } from "@/components/libra/scanner-placeholders";
import { Badge, Button, Card } from "@/components/libra/ui";
import { useLibraryUser } from "@/hooks/use-library-user";

export const Route = createFileRoute("/student/check-in")({
  head: () => ({
    meta: [
      { title: "Scan Library QR — LibraPass" },
      { name: "description", content: "Scan the library QR code with your phone camera to check in." },
    ],
  }),
  component: CheckInPage,
});

const statusTone = { approved: "success", pending: "warning", flagged: "danger" } as const;

function CheckInPage() {
  const navigate = useNavigate();
  const { devices, loading } = useLibraryUser();
  const [scanned, setScanned] = useState(false);

  function goToSuccess(deviceId: string | null) {
    navigate({
      to: "/check-in-success",
      search: { channel: "qr", mode: "in", deviceId: deviceId ?? undefined },
    });
  }

  if (!scanned) {
    return (
      <>
        <PageHeader title="Check In" description="QR channel · scan the code posted at the library entrance" />
        <Card className="mx-auto max-w-xl p-6">
          <QRScannerPlaceholder />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="brand" size="lg" className="flex-1" onClick={() => setScanned(true)}>
              <ScanLine className="h-4 w-4" /> Simulate successful scan
            </Button>
            <Link to="/student" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            No phone? Use the{" "}
            <Link to="/kiosk" className="font-medium text-primary hover:underline">
              entrance kiosk
            </Link>{" "}
            to scan your ID card instead.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="One more thing" description="Confirm your device before we finish checking you in" />
      <Card className="mx-auto max-w-xl p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Do you have a laptop today?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Only approved devices can be taken into the library.</p>

        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading your devices...</p>
        ) : (
          <div className="mt-5 space-y-2">
            {devices.map((d) => (
              <button
                key={d.id}
                disabled={d.status !== "approved"}
                onClick={() => goToSuccess(d.id)}
                className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-3">
                  <Laptop className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{d.name}</span>
                </span>
                <Badge tone={statusTone[d.status]}>{d.status}</Badge>
              </button>
            ))}
            {devices.length === 0 && <p className="text-sm text-muted-foreground">No registered devices yet.</p>}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => goToSuccess(null)}>
            No laptop
          </Button>
          {devices.some((d) => d.status === "approved") && (
            <Button
              variant="brand"
              className="flex-1"
              onClick={() => goToSuccess(devices.find((d) => d.status === "approved")?.id ?? null)}
            >
              <Check className="h-4 w-4" /> I have it with me
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}