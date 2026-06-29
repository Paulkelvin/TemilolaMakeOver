import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./env";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
