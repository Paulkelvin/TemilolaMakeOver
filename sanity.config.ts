import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { deskStructure } from "./sanity/desk-structure";
import { travelZoneTemplates } from "./sanity/templates";
import { contentIntelligenceTool } from "./sanity/content-intelligence/tool";

export default defineConfig({
  name: "temilola-makeup",
  title: "Temilola Makeup CMS",
  basePath: "/studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [...prev, ...travelZoneTemplates],
  },
  tools: (prev) => [...prev, contentIntelligenceTool],
});
