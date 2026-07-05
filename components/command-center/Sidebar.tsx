"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMAND_CENTER_MODULES, PHASE_LABEL } from "@/lib/command-center/modules";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="cc-sidebar" aria-label="Command Center navigation">
      <div className="cc-brand">
        Gleam <span>Command Center</span>
      </div>
      {COMMAND_CENTER_MODULES.map((mod) => {
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
    </nav>
  );
}
