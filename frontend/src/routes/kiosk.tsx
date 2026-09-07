import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, ArrowLeft, Check, KeyRound, Laptop, Library, Monitor, User } from "lucide-react";
import { useEffect, useState } from "react";

import { BarcodeKioskInput } from "@/components/libra/scanner-placeholders";
import { Badge, Button, Input, Modal } from "@/components/libra/ui";
import { supabase } from "@/lib/supabase";
import type { Device, LibraryUser } from "@/hooks/use-library-user";

export const Route = createFileRoute("/kiosk")({
  head: () => ({
    meta: [
      { title: "Library Kiosk Check-In — LibraPass" },
      { name: "description", content: "Scan your student ID card or log in at the library entrance kiosk." },
    ],
  }),
  component: KioskPage,
});

const statusTone = { approved: "success", pending: "warning", flagged: "danger" } as const;

function KioskPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"card" | "web">("card");
  const [unknownCard, setUnknownCard] = useState<string | null>(null);
  const [admission, setAdmission] = useState("");
  const [password, setPassword] = useState("");
  const [webError, setWebError] = useState(false);
  const [kioskReady, setKioskReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Step for check-ins only: confirm whether they have a laptop with them today.
  const [pendingUser, setPendingUser] = useState<LibraryUser | null>(null);
  const [pendingDevices, setPendingDevices] = useState<Device[]>([]);

  // The kiosk signs itself in once, using its own dedicated account, the first
  // time this page loads. This never involves a real person's credentials.
  useEffect(() => {
    async function signInKiosk() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setKioskReady(true);
        return;
      }
      await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_KIOSK_EMAIL,
        password: import.meta.env.VITE_KIOSK_PASSWORD,
      });
      setKioskReady(true);
    }
    signInKiosk();
  }, []);

  async function identify(user: LibraryUser, channel: "card" | "web") {
    const { data: openVisit } = await supabase
      .from("visits")
      .select("*")
      .eq("student_id", user.id)
      .is("check_out", null)
      .order("visit_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (openVisit) {
      // Already inside — this scan/login means they're leaving. No device step needed.
      navigate({ to: "/check-in-success", search: { channel, student: user.id, mode: "out" } });
      return;
    }

    // Not inside — this is a check-in. Ask about a laptop first.
    const { data: devices } = await supabase.from("devices").select("*").eq("student_id", user.id);
    setPendingDevices(devices ?? []);
    setPendingUser(user);
  }

  const handleScan = async (raw: string) => {
    if (!kioskReady || busy) return;
    setBusy(true);
    const { data: user } = await supabase
      .from("library_users")
      .select("*")
      .eq("card_identifier", raw.trim())
      .maybeSingle();

    if (!user) {
      setUnknownCard(raw.trim());
      setBusy(false);
      return;
    }
    await identify(user, "card");
    setBusy(false);
  };

  async function handleWebLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!kioskReady || busy) return;
    setBusy(true);
    setWebError(false);

    const { data: email } = await supabase.rpc("get_email_for_login", { identifier: admission });
    if (!email) {
      setWebError(true);
      setBusy(false);
      return;
    }

    // Verify the real password by briefly signing in as the student, then
    // immediately restoring the kiosk's own session for its next scan.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setWebError(true);
      setBusy(false);
      return;
    }

    const { data: user } = await supabase
      .from("library_users")
      .select("*")
      .eq("admission_number", admission)
      .maybeSingle();

    await supabase.auth.signInWithPassword({
      email: import.meta.env.VITE_KIOSK_EMAIL,
      password: import.meta.env.VITE_KIOSK_PASSWORD,
    });

    if (!user) {
      setWebError(true);
      setBusy(false);
      return;
    }

    await identify(user, "web");
    setBusy(false);
  }

  function confirmDevice(deviceId: string | null) {
    if (!pendingUser) return;
    navigate({
      to: "/check-in-success",
      search: { channel: mode, student: pendingUser.id, mode: "in", deviceId: deviceId ?? undefined },
    });
  }

  return (
    <div className="relative min-h-screen bg-background px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,oklch(0.92_0.05_162),transparent_60%)]" />
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-primary-foreground">
              <Library className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">LibraPass Kiosk</p>
              <p className="text-xs text-muted-foreground">Athi River Main Library</p>
            </div>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Exit kiosk
          </Link>
        </div>

        <div className="card-surface p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {pendingUser ? (
              <motion.div key="device-step" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Do you have a laptop today, {pendingUser.full_name.split(" ")[0]}?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Only approved devices can be taken into the library.</p>

                <div className="mt-5 space-y-2">
                  {pendingDevices.map((d) => (
                    <button
                      key={d.id}
                      disabled={d.status !== "approved"}
                      onClick={() => confirmDevice(d.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex items-center gap-3">
                        <Laptop className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{d.name}</span>
                      </span>
                      <Badge tone={statusTone[d.status]}>{d.status}</Badge>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => confirmDevice(null)}>
                    No laptop
                  </Button>
                  {pendingDevices.some((d) => d.status === "approved") && (
                    <Button
                      variant="brand"
                      className="flex-1"
                      onClick={() => confirmDevice(pendingDevices.find((d) => d.status === "approved")?.id ?? null)}
                    >
                      <Check className="h-4 w-4" /> I have it with me
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : mode === "card" ? (
              <motion.div key="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <BarcodeKioskInput onScan={handleScan} disabled={unknownCard !== null || busy} />
                <button
                  onClick={() => setMode("web")}
                  className="mt-6 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-soft/50"
                >
                  <span className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Don't have your ID? Log in instead</span>
                  </span>
                  <span className="text-xs text-muted-foreground">Web check-in →</span>
                </button>
              </motion.div>
            ) : (
              <motion.div key="web" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Log in to check in</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your admission number and password on this shared terminal.
                </p>
                <form className="mt-6 space-y-4" onSubmit={handleWebLogin}>
                  <Input
                    label="Admission Number"
                    placeholder="21-0455"
                    icon={<User className="h-4 w-4" />}
                    value={admission}
                    onChange={(e) => {
                      setAdmission(e.target.value);
                      setWebError(false);
                    }}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<KeyRound className="h-4 w-4" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {webError && (
                    <p className="flex items-center gap-2 text-xs text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Incorrect admission number or password.
                    </p>
                  )}
                  <Button type="submit" variant="brand" size="lg" className="w-full" disabled={busy}>
                    {busy ? "Checking..." : "Check In"}
                  </Button>
                </form>
                <button
                  onClick={() => setMode("card")}
                  className="mt-5 w-full text-center text-xs font-medium text-primary hover:underline"
                >
                  ← Back to card scan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Card identifiers are opaque strings — any institution's symbology works.
        </p>
      </div>

      <Modal
        open={unknownCard !== null}
        onClose={() => setUnknownCard(null)}
        title="Card not recognized"
        description="Please see the librarian — this card is not linked to a student record."
        footer={
          <Button variant="outline" onClick={() => setUnknownCard(null)}>
            Try again
          </Button>
        }
      >
        <div className="flex items-start gap-3 rounded-xl bg-warning/20 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-foreground" />
          <div className="text-sm text-foreground">
            <p className="font-medium">Unregistered card scanned</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{unknownCard}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}