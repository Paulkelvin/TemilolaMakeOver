export type CCRole = "owner" | "staff";

export interface ModuleAccess {
  view: boolean;
}

const STAFF_BLOCKED: ReadonlySet<string> = new Set([
  "settings",
  "ai-insights",
]);

export function canAccessModule(role: CCRole, moduleKey: string): boolean {
  if (role === "owner") return true;
  return !STAFF_BLOCKED.has(moduleKey);
}

export function getVisibleModuleKeys(role: CCRole, allKeys: string[], disabledKeys: string[]): string[] {
  const disabled = new Set(disabledKeys);
  return allKeys.filter((k) => canAccessModule(role, k) && !disabled.has(k));
}
