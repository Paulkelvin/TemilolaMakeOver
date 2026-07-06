"use client";

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

  return (
    <nav className="cc-sidebar" aria-label="Command Center navigation">
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
    </nav>
  );
}
