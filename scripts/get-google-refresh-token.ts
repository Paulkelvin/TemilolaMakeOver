/**
 * One-time helper to obtain a Google OAuth 2.0 refresh token for the
 * Search Console + GA4 integrations, in place of a service-account key
 * (this project's Google Cloud org enforces
 * iam.disableServiceAccountKeyCreation, so no service-account JSON key can
 * be issued — this sidesteps that entirely by using a different credential
 * type that policy doesn't govern).
 *
 * Setup (one-time, in Google Cloud Console):
 *   1. APIs & Services → Credentials → Create Credentials → OAuth client ID
 *   2. Application type: "Desktop app"
 *   3. Under "Authorized redirect URIs" add: http://127.0.0.1:8912
 *      (must match exactly — this script listens on that fixed port)
 *   4. Copy the generated Client ID and Client Secret
 *   5. Make sure the Search Console API and Analytics Data API are enabled
 *      for this project (APIs & Services → Library)
 *
 * Usage:
 *   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... \
 *     npx tsx scripts/get-google-refresh-token.ts
 *
 * Or place GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET in
 * .env.local first, then just:
 *   npx tsx scripts/get-google-refresh-token.ts
 *
 * Run this logged into the Google account that already has access to your
 * Search Console property and GA4 property — the refresh token inherits
 * whichever account approves the consent screen.
 */

import * as http from "http";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const PORT = 8912;
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
];

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET.");
  console.error("Set them as env vars or in .env.local, then re-run this script.");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPES.join(" "));
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent"); // forces a refresh_token even on repeat consent

console.log("\nOpen this URL in a browser, logged in as the account with GSC + GA4 access:\n");
console.log(authUrl.toString());
console.log(`\nWaiting for the redirect on ${REDIRECT_URI} ...\n`);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", REDIRECT_URI);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end(`<h1>Authorization failed</h1><p>${error}</p>`);
    console.error(`Authorization failed: ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>No code received</h1>");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Success</h1><p>You can close this tab and return to the terminal.</p>");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = (await tokenRes.json()) as {
      refresh_token?: string;
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenRes.ok || !data.refresh_token) {
      console.error("\nToken exchange failed:", data.error, data.error_description ?? "");
      console.error(
        "If you've authorized this app before, Google may withhold a new refresh_token. " +
        "Revoke prior access at https://myaccount.google.com/permissions and try again."
      );
      process.exit(1);
    }

    console.log("\nSuccess. Add this to your environment (Vercel + .env.local):\n");
    console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${data.refresh_token}\n`);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT);
