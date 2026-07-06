import { client } from "@/sanity/client";
import type { NotificationKind } from "@/lib/intelligence/notifications";

export interface NotificationPref {
  kind: NotificationKind;
  feedEnabled: boolean;
  emailEnabled: boolean;
}

export interface CCSettings {
  disabledModules: string[];
  notificationPreferences: NotificationPref[];
}

const SETTINGS_QUERY = `*[_type == "ccSettings" && _id == "ccSettings"][0]{
  "disabledModules": coalesce(disabledModules, []),
  "notificationPreferences": coalesce(notificationPreferences[]{kind, feedEnabled, emailEnabled}, [])
}`;

const DEFAULT_SETTINGS: CCSettings = {
  disabledModules: [],
  notificationPreferences: [],
};

export async function getCCSettings(): Promise<CCSettings> {
  const raw = await client.fetch<CCSettings | null>(SETTINGS_QUERY);
  return raw ?? DEFAULT_SETTINGS;
}

export function isNotificationEnabled(prefs: NotificationPref[], kind: NotificationKind): boolean {
  const pref = prefs.find((p) => p.kind === kind);
  return pref ? pref.feedEnabled : true;
}

export function isEmailEnabled(prefs: NotificationPref[], kind: NotificationKind): boolean {
  const pref = prefs.find((p) => p.kind === kind);
  return pref ? pref.emailEnabled : false;
}
