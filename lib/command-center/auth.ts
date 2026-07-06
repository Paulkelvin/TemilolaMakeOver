import { headers } from "next/headers";
import type { CCRole } from "./roles";

export async function getCurrentRole(): Promise<CCRole> {
  const h = await headers();
  const role = h.get("x-cc-role");
  return role === "staff" ? "staff" : "owner";
}
