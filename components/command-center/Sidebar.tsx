"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CommandCenterModule, ModuleGroup } from "@/lib/command-center/modules";
import { PHASE_LABEL, GROUP_LABEL, COLLAPSED_GROUPS } from "@/lib/command-center/modules";
import type { CCRole } from "@/lib/command-center/roles";

const GROUP_ORDER: ModuleGroup[] = ["loop", "business", "diagnostics", "system"];

interface SidebarProps {
  modules: CommandCenterModule[];
  role: CCRole;
}

export function Sidebar({ modules, role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // A collapsed group opens automatically when you're already inside it, so
  // navigating to a diagnostics page never leaves the sidebar showing no
  // active item.
  const activeGroup = modules.find((m) =>
    m.href === "/command-center" ? pathname === m.href : pathname?.startsWith(m.href)
  )?.group;
  const [expanded, setExpanded] = useState<ModuleGroup[]>([]);

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
        {GROUP_ORDER.map((group) => {
          const groupModules = modules.filter((m) => m.group === group);
          if (groupModules.length === 0) return null;

          const heading = GROUP_LABEL[group];
          const collapsible = COLLAPSED_GROUPS.includes(group);
          const isOpen = !collapsible || expanded.includes(group) || activeGroup === group;

          return (
            <div key={group} className="cc-nav-group">
              {heading && collapsible && (
                <button
                  type="button"
                  className="cc-nav-group__toggle"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setExpanded((prev) =>
                      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
                    )
                  }
                >
                  <span>{heading}</span>
                  <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
              )}
              {heading && !collapsible && <div className="cc-nav-group__heading">{heading}</div>}

              {isOpen &&
                groupModules.map((mod) => {
                  const isActive =
                    mod.href === "/command-center" ? pathname === mod.href : pathname?.startsWith(mod.href);
                  const phaseLabel = PHASE_LABEL[mod.status];
                  return (
                    <Link
                      key={mod.key}
                      href={mod.href}
                      className="cc-nav-item"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span>
                        {mod.label}
                        {mod.hint && <span className="cc-nav-item__hint">{mod.hint}</span>}
                      </span>
                      {phaseLabel && <span className="cc-nav-item__phase">{phaseLabel}</span>}
                    </Link>
                  );
                })}
            </div>
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
