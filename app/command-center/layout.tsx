import type { Metadata } from "next";
import "./command-center.css";
import { Sidebar } from "@/components/command-center/Sidebar";
import { CommandPalette } from "@/components/command-center/CommandPalette";
import { getCurrentRole } from "@/lib/command-center/auth";
import { getCCSettings } from "@/lib/command-center/settings";
import { getVisibleModuleKeys } from "@/lib/command-center/roles";
import { COMMAND_CENTER_MODULES } from "@/lib/command-center/modules";

export const metadata: Metadata = {
  title: "Business Command Center",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  const [role, settings] = await Promise.all([getCurrentRole(), getCCSettings()]);
  const allKeys = COMMAND_CENTER_MODULES.map((m) => m.key);
  const visibleKeys = getVisibleModuleKeys(role, allKeys, settings.disabledModules);
  const visibleModules = COMMAND_CENTER_MODULES.filter((m) => visibleKeys.includes(m.key));

  return (
    <html lang="en">
      <body className="cc-body" data-cc-role={role}>
        <div className="cc-shell">
          <Sidebar modules={visibleModules} role={role} />
          <main className="cc-main">
            <CommandPalette />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
