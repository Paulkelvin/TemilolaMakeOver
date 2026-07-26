import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./env";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export type WriteAccess = { ok: true } | { ok: false; reason: string };

// Sanity only rejects a write when the write is attempted, and this dataset
// allows anonymous *reads* — so a missing or revoked SANITY_API_WRITE_TOKEN
// looks like a perfectly healthy run right up until every persist step fails
// with its own near-identical "Insufficient permissions" error. Ten copies of
// the same message, one per engine, buries the single real cause. This checks
// once, upfront, so callers can fail fast with one clear explanation.
//
// dryRun asks Sanity to authorize the mutation and then throw the result
// away, so the probe document is never actually created (verified: the id
// below stays absent from the dataset afterwards).
const WRITE_PROBE_ID = "write-permission-probe";

export async function checkWriteAccess(): Promise<WriteAccess> {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    return {
      ok: false,
      reason:
        "SANITY_API_WRITE_TOKEN is not set, so nothing can be saved to Sanity. Add it to the deployment's environment variables (Sanity token with Editor permission), then redeploy — env changes don't reach already-deployed functions.",
    };
  }

  try {
    await writeClient.createOrReplace(
      { _id: WRITE_PROBE_ID, _type: "metricSnapshot" },
      { dryRun: true }
    );
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Two distinct rejections, verified against a live dataset:
    //  - a revoked/deleted/garbled token -> "Unauthorized - Session not found"
    //  - a real token with Viewer access -> "Insufficient permissions"
    if (/session not found|unauthoriz/i.test(message)) {
      return {
        ok: false,
        reason:
          "SANITY_API_WRITE_TOKEN is set but Sanity does not recognise it — the token has been revoked or deleted, or the value was truncated when it was pasted in. Create a fresh token with Editor permission at sanity.io/manage, replace the env var, then redeploy.",
      };
    }
    if (/insufficient permissions/i.test(message)) {
      return {
        ok: false,
        reason:
          "SANITY_API_WRITE_TOKEN is a valid token but lacks write permission — it most likely only has Viewer access. Give it Editor permission (or create a new Editor token) at sanity.io/manage, update the env var, then redeploy.",
      };
    }
    return { ok: false, reason: `Could not verify Sanity write access: ${message}` };
  }
}
