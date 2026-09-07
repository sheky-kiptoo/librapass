import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChannelBadge } from "@/components/libra/channel-badge";
import { supabase } from "@/lib/supabase";

type Channel = "qr" | "card" | "web";
type Search = { channel: Channel; student?: string | undefined; mode: "in" | "out"; deviceId?: string | undefined };

export const Route = createFileRoute("/check-in-success")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const channel = search["channel"];
    return {
      channel: channel === "card" || channel === "web" ? channel : "qr",
      student: typeof search["student"] === "string" ? search["student"] : undefined,
      mode: search["mode"] === "out" ? "out" : "in",
      deviceId: typeof search["deviceId"] === "string" ? search["deviceId"] : undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Visit Recorded — LibraPass" }],
  }),
  component: SuccessPage,
});

function fmt(minutes: number | null | undefined) {
  if (!minutes) return "—";
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

type Record_ = {
  name: string;
  admissionNumber: string;
  time: string;
  checkInTime?: string;
  durationMinutes?: number | null;
  deviceName: string;
  library: string;
};

function SuccessPage() {
  const navigate = useNavigate();
  const { channel, student: studentIdParam, mode, deviceId } = Route.useSearch();
  const isOut = mode === "out";
  const isKiosk = channel === "card" || channel === "web";

  const [status, setStatus] = useState<"working" | "done" | "error">("working");
  const [record, setRecord] = useState<Record_ | null>(null);
  const [countdown, setCountdown] = useState(4);
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    async function run() {
      let userRow: { id: string; full_name: string; admission_number: string; institution_id: string } | null = null;

      if (channel === "qr") {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          setStatus("error");
          return;
        }
        const { data } = await supabase
          .from("library_users")
          .select("id, full_name, admission_number, institution_id")
          .eq("auth_user_id", authData.user.id)
          .single();
        userRow = data;
      } else if (studentIdParam) {
        const { data } = await supabase
          .from("library_users")
          .select("id, full_name, admission_number, institution_id")
          .eq("id", studentIdParam)
          .single();
        userRow = data;
      }

      if (!userRow) {
        setStatus("error");
        return;
      }

      const { data: institutionRow } = await supabase
        .from("institutions")
        .select("libraries")
        .eq("id", userRow.institution_id)
        .single();
      const libraryList = (institutionRow?.libraries as string[] | null) ?? [];
      const libraryName = libraryList[0] ?? "Library";

      if (isOut) {
        const { data: openVisit } = await supabase
          .from("visits")
          .select("*")
          .eq("student_id", userRow.id)
          .is("check_out", null)
          .order("visit_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!openVisit) {
          setStatus("error");
          return;
        }

        const now = new Date();
        const checkOutTime = now.toTimeString().slice(0, 5);
        const inParts = openVisit.check_in.split(":");
        const inHours = Number(inParts[0] ?? 0);
        const inMinutes = Number(inParts[1] ?? 0);
        const duration = Math.max(0, now.getHours() * 60 + now.getMinutes() - (inHours * 60 + inMinutes));

        await supabase.from("visits").update({ check_out: checkOutTime, duration_minutes: duration }).eq("id", openVisit.id);

        let deviceName = "N/A";
        if (openVisit.device_id) {
          const { data: d } = await supabase.from("devices").select("name").eq("id", openVisit.device_id).single();
          deviceName = d?.name ?? "N/A";
        }

        setRecord({
          name: userRow.full_name,
          admissionNumber: userRow.admission_number,
          time: checkOutTime,
          checkInTime: openVisit.check_in,
          durationMinutes: duration,
          deviceName,
          library: openVisit.library ?? libraryName,
        });
      } else {
        const now = new Date();
        const checkInTime = now.toTimeString().slice(0, 5);
        const visitId = `${userRow.id}_v${Date.now()}`;

        await supabase.from("visits").insert({
          id: visitId,
          student_id: userRow.id,
          device_id: deviceId ?? null,
          visit_date: now.toISOString().slice(0, 10),
          check_in: checkInTime,
          channel,
          library: libraryName,
        });

        let deviceName = "N/A";
        if (deviceId) {
          const { data: d } = await supabase.from("devices").select("name").eq("id", deviceId).single();
          deviceName = d?.name ?? "N/A";
        }

        setRecord({
          name: userRow.full_name,
          admissionNumber: userRow.admission_number,
          time: checkInTime,
          deviceName,
          library: libraryName,
        });
      }

      setStatus("done");
    }

    run();
  }, [channel, studentIdParam, isOut, deviceId]);

  // Kiosk channels reset themselves automatically so the next person can walk up.
  useEffect(() => {
    if (status !== "done" || !isKiosk) return;
    if (countdown <= 0) {
      navigate({ to: "/kiosk" });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, isKiosk, countdown, navigate]);

  if (status === "working") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Recording your visit...</p>
      </div>
    );
  }

  if (status === "error" || !record) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="text-sm text-muted-foreground">Something went wrong recording this visit.</p>
        <Link to={isKiosk ? "/kiosk" : "/student"} className="text-sm font-medium text-primary hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const rows: Array<[string, React.ReactNode]> = [
    ["Name", record.name],
    ["Admission Number", record.admissionNumber],
    [isOut ? "Check Out Time" : "Check In Time", record.time],
    ...(isOut
      ? ([
          ["Checked In At", record.checkInTime ?? "—"],
          ["Time Spent", fmt(record.durationMinutes)],
        ] as Array<[string, React.ReactNode]>)
      : []),
    ["Registered Device", record.deviceName],
    ["Library", record.library],
    ["Channel Used", <ChannelBadge key="c" channel={channel} />],
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.92_0.06_162),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-surface relative z-10 w-full max-w-md p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft"
        >
          {isOut ? <LogOut className="h-10 w-10 text-primary" /> : <CheckCircle2 className="h-11 w-11 text-primary" />}
        </motion.div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          {isOut ? "Successfully Checked Out" : "Successfully Checked In"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOut ? "Your visit has been closed and logged." : "Your visit is now being recorded."}
        </p>

        <dl className="mt-6 divide-y divide-border rounded-xl border border-border text-left">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 px-4 py-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {isKiosk ? (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">Returning to kiosk in {countdown}s...</p>
            <button
              onClick={() => navigate({ to: "/kiosk" })}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg brand-gradient text-base font-medium text-primary-foreground shadow-md transition-all hover:brightness-110"
            >
              Done
            </button>
          </div>
        ) : (
          <Link
            to="/student"
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-lg brand-gradient text-base font-medium text-primary-foreground shadow-md transition-all hover:brightness-110"
          >
            Return to Home
          </Link>
        )}
      </motion.div>
    </div>
  );
}