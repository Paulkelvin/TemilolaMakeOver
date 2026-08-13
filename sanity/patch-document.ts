import { writeClient } from "./write-client";

// Use this for seeding/updating fields on an EXISTING document instead of
// writeClient.createOrReplace() — createOrReplace overwrites the whole
// document, so any field missing from the payload gets deleted. patch().set()
// only touches the fields named here and leaves everything else as-is.
//
// This is not for creating new documents — use writeClient.createOrReplace()
// or writeClient.create() for that, since there's no existing state to lose.
export async function patchDocument(
  id: string,
  fields: Record<string, unknown>
) {
  return writeClient.patch(id).set(fields).commit();
}
