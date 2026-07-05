# Migrations

This folder is a historical record of one-off scripts that changed the **live** Sanity dataset — schema backfills, content re-tagging, deletions, anything beyond what the bootstrap script (`sanity/seed.ts`) handles.

## Why this exists

`sanity/seed.ts` is a bootstrap script, not a migration runner (see the design discussion referenced in its header comment). Every real change to live data on this project has actually been made through a small, purpose-written script — reviewed, run once, and previously deleted afterward. This folder changes only the "deleted afterward" part: instead of throwing the script away, park it here so there's a real audit trail of what changed the dataset and when.

There is **no runner** for this folder. Nothing here executes automatically, on a deploy, in CI, or via any npm script. Each file is a standalone record — run manually with `npx tsx sanity/migrations/<file>.ts` only if you're intentionally re-applying it (most are not idempotent in the way `seed.ts` is, since they were written for a specific one-time change).

## Conventions for new migrations

1. **Name it by date and intent**: `YYYY-MM-DD-short-description.ts` (e.g. `2026-07-05-add-taxonomy-graph.ts`).
2. **Review before running.** These touch live data directly — get explicit go-ahead the same way every prior migration on this project has, before executing against production.
3. **Prefer additive operations** (`createIfNotExists`, `patch().setIfMissing()`) over `createOrReplace` or deletes, for the same reasons `seed.ts` does — unless the migration's entire purpose is a deliberate, reviewed deletion or overwrite, in which case say so plainly in the script's header comment.
4. **Leave it here once it's run.** Don't delete it — that's the whole point of this folder existing.
5. If a migration turns out to represent a piece of the **bootstrap** content model going forward (e.g. a new taxonomy type that should exist on any fresh project), mirror the relevant documents into `seed.ts` as well, the same way this project's taxonomy migration was folded back in.
