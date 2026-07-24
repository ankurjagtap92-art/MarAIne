"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { IconCompass, IconRoute, IconShip, IconChart, IconLogout, IconAnchor } from "@/components/ui/icons";

const menuItems = [
  { href: "/dashboard", label: "Command Center", icon: IconCompass },
  { href: "/routes/new", label: "Route Analysis", icon: IconRoute },
  { href: "/vessels", label: "Fleet Management", icon: IconShip },
  { href: "/analytics", label: "Analytics", icon: IconChart },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  if (!user) return null;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex min-h-screen w-64 flex-col border-r border-ocean-line bg-ocean-navy/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="border-b border-ocean-line px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-glow-blue to-glow-cyan text-[#04101f] shadow-[var(--shadow-glow-cyan)]">
            <IconAnchor className="animate-float" width={20} height={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold leading-tight text-ink-primary">MarAIne</h1>
            <p className="text-[11px] text-ink-muted">Maritime Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[11px] uppercase tracking-wider text-ink-muted">Navigation</p>
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-glow-cyan/10 text-glow-cyan"
                  : "text-ink-secondary hover:bg-white/[0.04] hover:text-ink-primary"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-glow-cyan sidebar-active-indicator" />
              )}
              <Icon className={active ? "text-glow-cyan" : "text-ink-muted group-hover:text-ink-primary"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User & Sign out */}
      <div className="border-t border-ocean-line px-4 py-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-glow-violet to-glow-blue text-xs font-bold text-white">
            {user.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-primary">{user.full_name}</p>
            <p className="text-[10px] uppercase text-ink-muted">{user.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-status-danger/10 hover:text-status-danger"
        >
          <IconLogout width={16} height={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}