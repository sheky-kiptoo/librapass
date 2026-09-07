import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { KeyRound, Library, ScanLine, User } from "lucide-react";
import { useState } from "react";

import { AuthHero } from "@/components/libra/auth-hero";
import { Button, Input } from "@/components/libra/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Sign In — LibraPass" },
      {
        name: "description",
        content: "Sign in to LibraPass with your admission number to check into the Daystar University library.",
      },
      { property: "og:title", content: "Student Sign In — LibraPass" },
      { property: "og:description", content: "Smart library access for Daystar University students." },
    ],
  }),
  component: StudentLogin,
});

function StudentLogin() {
  const navigate = useNavigate();
  const [admission, setAdmission] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Step 1: turn the admission number into the real email behind it,
    // using the lookup function we created in Supabase.
    const { data: email, error: lookupError } = await supabase.rpc(
      "get_email_for_login",
      { identifier: admission }
    );

    if (lookupError || !email) {
      setError("We couldn't find an account with that admission number.");
      setLoading(false);
      return;
    }

    // Step 2: now that we have the real email, actually sign in.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    // Success — go to the dashboard.
    navigate({ to: "/student" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero />

      <div className="relative flex items-center justify-center bg-background px-5 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,oklch(0.93_0.05_162),transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-panel relative z-10 w-full max-w-md p-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-xs font-bold text-primary">
              DU
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-primary-foreground">
                <Library className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">LibraPass</span>
            </div>
          </div>

          <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">Student sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your Daystar admission number to access your library account.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Admission Number"
              placeholder="21-0455"
              icon={<User className="h-4 w-4" />}
              value={admission}
              onChange={(e) => setAdmission(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<KeyRound className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </button>
            </div>
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Link
            to="/kiosk"
            className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary-soft/50"
          >
            <span className="flex items-center gap-3">
              <ScanLine className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Checking in at a library kiosk instead?
              </span>
            </span>
            <span className="text-xs text-muted-foreground">Card / Web →</span>
          </Link>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Library staff?{" "}
            <Link to="/librarian-login" className="font-medium text-primary hover:underline">
              Librarian sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}