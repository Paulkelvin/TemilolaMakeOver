<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Seeding or updating Sanity content

Never use `createOrReplace()` (or `create_documents`/`patch_documents` with a
full-document payload via the Sanity MCP) to update a document that already
exists in production. `createOrReplace` overwrites the *entire* document —
any field you don't include in the payload is deleted, not left alone. This
is exactly how the `shopLink` documents lost their `image` field on
2026-07-01: a replace payload that only carried the fields being seeded
silently wiped the image reference nobody meant to touch.

- Adding/changing a few fields on an existing document → use
  `writeClient.patch(id).set({...}).commit()` (see `sanity/patch-document.ts`
  for a wrapper), or the Sanity MCP `patch_documents` tool with a partial
  payload. Never re-send the whole document.
- Creating a brand-new document → `createOrReplace`/`create_documents` is
  fine, since there's no existing state to clobber.
- Deliberately rebuilding a document from scratch → `createOrReplace` is
  fine, but state explicitly in the script/commit message that this is an
  intentional full replace, not a field update.
