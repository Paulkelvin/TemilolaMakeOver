"use client";

// Shared client-side POST-JSON helper for the small Command Center action
// components (Wizard, Roadmap, ...) — each used to hand-roll its own
// identical fetch/error-handling copy, which would silently drift if error
// handling ever needed to change.
export async function postCommandCenterAction(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}
