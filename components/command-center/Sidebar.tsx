"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CommandCenterModule } from "@/lib/command-center/modules";
import { PHASE_LABEL } from "@/lib/command-center/modules";
import type { CCRole } from "@/lib/command-center/roles";

interface SidebarProps {
  modules: CommandCenterModule[];
  role: CCRole;
}

export function Sidebar({ modules, role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/cc-logout", { method: "POST" });
    window.location.href = "/cc-login";
  }

  return (
    <>
      <div className="cc-mobile-bar">
        <button
          type="button"
          className="cc-mobile-menu-btn"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="cc-brand cc-brand--mobile">
          Gleam <span>Command Center</span>
        </div>
      </div>

      {open && <div className="cc-sidebar-backdrop" onClick={() => setOpen(false)} />}

      <nav
        className={`cc-sidebar${open ? " cc-sidebar--open" : ""}`}
        aria-label="Command Center navigation"
      >
        <div className="cc-brand">
          Gleam <span>Command Center</span>
        </div>
        {modules.map((mod) => {
          const isActive = mod.href === "/command-center" ? pathname === mod.href : pathname?.startsWith(mod.href);
          const phaseLabel = PHASE_LABEL[mod.status];
          return (
            <Link
              key={mod.key}
              href={mod.href}
              className="cc-nav-item"
              aria-current={isActive ? "page" : undefined}
            >
              <span>{mod.label}</span>
              {phaseLabel && <span className="cc-nav-item__phase">{phaseLabel}</span>}
            </Link>
          );
        })}
        {role === "staff" && (
          <div className="cc-nav-role-badge">Staff access</div>
        )}
        <button type="button" className="cc-nav-item cc-nav-item--logout" onClick={handleLogout}>
          <span>Log out</span>
        </button>
      </nav>
    </>
  );
}
