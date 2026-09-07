import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BarChart3, FileText, LayoutDashboard, Laptop, LogOut, MonitorSmartphone, Settings, Users } from "lucide-react";

import { AppShell, type NavItem } from "@/components/libra/app-shell";
import { useLibrarianData } from "@/hooks/use-librarian-data";
import { supabase } from "@/lib/supabase";

const nav: NavItem[] = [
  { label: "Home", to: "/librarian", icon: LayoutDashboard, exact: true },
  { label: "Students", to: "/librarian/students", icon: Users },
  { label: "Devices", to: "/librarian/devices", icon: Laptop },
  { label: "Kiosk Monitor", to: "/librarian/kiosks", icon: MonitorSmartphone },
  { label: "Reports", to: "/librarian/reports", icon: FileText },
  { label: "Analytics", to: "/librarian/analytics", icon: BarChart3 },
  { label: "Settings", to: "/librarian/settings", icon: Settings },
  { label: "Logout", to: "/librarian-login", icon: LogOut },
];

export const Route = createFileRoute("/librarian")({
  beforeLoad: async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      throw redirect({ to: "/librarian-login" });
    }
    const { data: librarianRow } = await supabase
      .from("librarians")
      .select("id")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle();
    if (!librarianRow) {
      throw redirect({ to: "/librarian-login" });
    }
  },
  component: LibrarianLayout,
});

function LibrarianLayout() {
  const { librarianName } = useLibrarianData();
  return (
    <AppShell nav={nav} role="Librarian" userName={librarianName || "Loading..."} userMeta="Athi River Main Library">
      <Outlet />
    </AppShell>
  );
}