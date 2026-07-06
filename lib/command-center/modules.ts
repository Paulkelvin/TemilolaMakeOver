export type ModuleStatus = "live" | "phase-3" | "phase-4" | "phase-5" | "phase-6";

export interface CommandCenterModule {
  key: string;
  label: string;
  href: string;
  status: ModuleStatus;
}

export const PHASE_LABEL: Record<ModuleStatus, string | null> = {
  live: null,
  "phase-3": "Phase 3",
  "phase-4": "Phase 4",
  "phase-5": "Phase 5",
  "phase-6": "Phase 6",
};

/**
 * Adding a future module (Products, Events, multiple Artists, etc.) is one
 * entry here plus its own route and data source — never a restructure of
 * the sections above it. See the locked architecture's Extensibility
 * contract.
 */
export const COMMAND_CENTER_MODULES: CommandCenterModule[] = [
  { key: "overview", label: "Overview", href: "/command-center", status: "live" },
  { key: "content", label: "Content", href: "/command-center/content", status: "live" },
  { key: "seo", label: "SEO", href: "/command-center/seo", status: "live" },
  { key: "bookings", label: "Bookings & Revenue", href: "/command-center/bookings", status: "live" },
  { key: "customers", label: "Customers", href: "/command-center/customers", status: "live" },
  { key: "website", label: "Website", href: "/command-center/website", status: "live" },
  { key: "ai-insights", label: "AI Insights", href: "/command-center/ai-insights", status: "live" },
  { key: "notifications", label: "Notifications", href: "/command-center/notifications", status: "live" },
  { key: "settings", label: "Settings", href: "/command-center/settings", status: "live" },
];
