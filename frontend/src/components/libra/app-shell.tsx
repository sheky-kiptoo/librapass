import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Bell, Library, Menu, Search, X } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
}

export function AppShell({
  nav,
  role,
  userName,
  userMeta,
  children,
}: {
  nav: NavItem[];
  role: string;
  userName: string;
  userMeta: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient text-primary-foreground">
              <Library className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">LibraPass</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <p className="px-5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {role}
        </p>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary-soft font-medium text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`nav-${role}`}
                    className="absolute left-0 top-1.5 h-[calc(100%-0.75rem)] w-1 rounded-r-full bg-primary"
                  />
                )}
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-sidebar-border bg-background p-3">
          <p className="text-sm font-medium text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">{userMeta}</p>
          <Link to="/" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
            Log out
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search students, devices, visits…"
              className="h-9 w-full rounded-lg border border-input bg-surface pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full brand-gradient text-xs font-semibold text-primary-foreground">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}