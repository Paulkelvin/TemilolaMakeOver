const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Standard OAuth 2.0 refresh-token exchange — not a service account. This
 * project's Google Cloud org enforces iam.disableServiceAccountKeyCreation,
 * so no service-account private key can be issued; a downloadable JSON key
 * was never required here in the first place, only the earlier
 * implementation's choice of auth flow. The refresh token is produced once
 * via scripts/get-google-refresh-token.ts (a loopback OAuth consent flow)
 * and the scopes it's valid for are fixed at that consent time — they
 * aren't, and can't be, passed per-call.
 */
export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN
  );
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN ?? "",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}
