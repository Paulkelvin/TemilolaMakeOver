import type { Metadata } from "next";
import "./command-center.css";
import { Sidebar } from "@/components/command-center/Sidebar";
import { CommandPalette } from "@/components/command-center/CommandPalette";

export const metadata: Metadata = {
  title: "Business Command Center",
  robots: { index: false, follow: false },
};

// Always server-rendered per request — this is a low-traffic, auth-gated
// operator tool where seeing the current state matters more than the
// static-caching wins that make sense for the public marketing pages.
export const dynamic = "force-dynamic";

export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="cc-body">
        <div className="cc-shell">
          <Sidebar />
          <main className="cc-main">
            <CommandPalette />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
