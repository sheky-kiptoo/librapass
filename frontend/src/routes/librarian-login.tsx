import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { KeyRound, Library, Mail } from "lucide-react";
import { useState } from "react";

import { AuthHero } from "@/components/libra/auth-hero";
import { Button, Input } from "@/components/libra/ui";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/librarian-login")({
  head: () => ({
    meta: [{ title: "Librarian Sign In — LibraPass" }],
  }),
  component: LibrarianLogin,
});

function LibrarianLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    navigate({ to: "/librarian" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthHero
        eyebrow="Staff Console"
        headline="LibraPass for Librarians"
        subtitle="Monitor entry channels, kiosks and library usage in real time."
      />
      <div className="relative flex items-center justify-center bg-background px-5 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,oklch(0.93_0.04_250),transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-panel relative z-10 w-full max-w-md p-8"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-primary-foreground">
              <Library className="h-4 w-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">LibraPass Staff</span>
          </div>

          <h2 className="mt-7 text-2xl font-semibold tracking-tight text-foreground">Librarian sign in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Daystar University · Athi River Main Library</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Staff Email"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              icon={<KeyRound className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In to Console"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Student?{" "}
            <Link to="/" className="font-medium text-primary hover:underline">
              Student sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}