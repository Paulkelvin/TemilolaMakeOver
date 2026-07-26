export type ModuleStatus = "live" | "phase-3" | "phase-4" | "phase-5" | "phase-6";

/**
 * Sidebar groups, in render order.
 *
 * "loop" is the only group that is meant to be walked top to bottom: it is the
 * actual sequence of work for building topical authority — decide what to own,
 * see where you're weak, pick the next thing to write, write it. Everything
 * else is either a different concern (money) or a thing you only open when
 * something is flagged, so it stays out of the main path.
 */
export type ModuleGroup = "loop" | "business" | "diagnostics" | "system";

export interface CommandCenterModule {
  key: string;
  label: string;
  href: string;
  status: ModuleStatus;
  group: ModuleGroup;
  /** Shown under the label in the sidebar for the main loop, so each step says what it's for. */
  hint?: string;
}

export const PHASE_LABEL: Record<ModuleStatus, string | null> = {
  live: null,
  "phase-3": "Phase 3",
  "phase-4": "Phase 4",
  "phase-5": "Phase 5",
  "phase-6": "Phase 6",
};

export const GROUP_LABEL: Record<ModuleGroup, string | null> = {
  loop: null, // the default path needs no heading
  business: "Business",
  diagnostics: "Diagnostics",
  system: null,
};

/** Groups rendered collapsed by default — open only when you're chasing something. */
export const COLLAPSED_GROUPS: ModuleGroup[] = ["diagnostics"];

/**
 * Adding a future module (Products, Events, multiple Artists, etc.) is one
 * entry here plus its own route and data source — never a restructure of
 * the sections above it. See the locked architecture's Extensibility
 * contract.
 *
 * Deliberately NOT in this list, though the routes still exist and are linked
 * from the pages that own them:
 *  - /command-center/topic-map/wizard and /topic-map/suggestions — the Wizard
 *    bootstraps the Topic Map once and Suggestions is an inbox that edits it;
 *    both belong inside the map they modify, not beside it.
 *  - /command-center/keyword-discovery, /competitor-gaps, and /seo/opportunities
 *    — three separate answers to "what should I write next", which is the one
 *    question Roadmap now answers in a single ranked queue. Their detail pages
 *    are still reachable from that queue.
 */
export const COMMAND_CENTER_MODULES: CommandCenterModule[] = [
  { key: "overview", label: "Overview", href: "/command-center", status: "live", group: "loop", hint: "Start here — what to do next" },
  { key: "topic-map", label: "1. Topic Map", href: "/command-center/topic-map", status: "live", group: "loop", hint: "What you're choosing to own" },
  { key: "topical-authority", label: "2. Authority", href: "/command-center/topical-authority", status: "live", group: "loop", hint: "How strong each topic is" },
  { key: "roadmap", label: "3. Roadmap", href: "/command-center/roadmap", status: "live", group: "loop", hint: "What to write next" },
  { key: "editorial", label: "4. Editorial", href: "/command-center/editorial", status: "live", group: "loop", hint: "Brief, write, verify, publish" },

  { key: "bookings", label: "Bookings & Revenue", href: "/command-center/bookings", status: "live", group: "business" },
  { key: "customers", label: "Customers", href: "/command-center/customers", status: "live", group: "business" },

  { key: "content", label: "Content", href: "/command-center/content", status: "live", group: "diagnostics" },
  { key: "seo", label: "Search Console", href: "/command-center/seo", status: "live", group: "diagnostics" },
  { key: "internal-links", label: "Internal Links", href: "/command-center/internal-links", status: "live", group: "diagnostics" },
  { key: "cannibalization", label: "Cannibalization", href: "/command-center/cannibalization", status: "live", group: "diagnostics" },
  { key: "knowledge-graph", label: "Knowledge Graph", href: "/command-center/knowledge-graph", status: "live", group: "diagnostics" },
  { key: "website", label: "Website", href: "/command-center/website", status: "live", group: "diagnostics" },
  { key: "sanity-usage", label: "Sanity Usage", href: "/command-center/sanity-usage", status: "live", group: "diagnostics" },

  { key: "notifications", label: "Notifications", href: "/command-center/notifications", status: "live", group: "system" },
  { key: "settings", label: "Settings", href: "/command-center/settings", status: "live", group: "system" },
];
