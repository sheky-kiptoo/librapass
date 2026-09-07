import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { History, LayoutDashboard, Laptop, LogOut, QrCode, UserRound } from "lucide-react";

import { AppShell, type NavItem } from "@/components/libra/app-shell";
import { useLibraryUser } from "@/hooks/use-library-user";
import { supabase } from "@/lib/supabase";

const nav: NavItem[] = [
  { label: "Home", to: "/student", icon: LayoutDashboard, exact: true },
  { label: "Check In", to: "/student/check-in", icon: QrCode },
  { label: "My Devices", to: "/student/devices", icon: Laptop },
  { label: "Visit History", to: "/student/history", icon: History },
  { label: "Profile", to: "/student/profile", icon: UserRound },
  { label: "Logout", to: "/", icon: LogOut },
];

export const Route = createFileRoute("/student")({
  beforeLoad: async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      throw redirect({ to: "/" });
    }
    const { data: userRow } = await supabase
      .from("library_users")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();
    if (!userRow) {
      throw redirect({ to: "/" });
    }
  },
  component: StudentLayout,
});

function StudentLayout() {
  const { user } = useLibraryUser();
  return (
    <AppShell
      nav={nav}
      role="Student"
      userName={user?.full_name ?? "Loading..."}
      userMeta={user ? `${user.admission_number} · ${user.course ?? user.department ?? ""}` : ""}
    >
      <Outlet />
    </AppShell>
  );
}