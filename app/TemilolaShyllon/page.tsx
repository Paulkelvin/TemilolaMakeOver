import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { getShopLinks, getShopPageSettings } from "@/sanity/fetch";
import type { ShopLink } from "@/sanity/fetch";
import { ShopLinksClient } from "@/components/sections/ShopLinksClient";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getShopPageSettings();
  return createPageMetadata({
    title: settings.pageTitle ?? "Shop & Recommendations",
    description:
      settings.pageSubtitle ??
      "Curated beauty picks and product recommendations by Temilola Shyllon.",
    path: "/TemilolaShyllon",
  });
}

export interface ShopSection {
  name: string;
  links: ShopLink[];
}

function groupBySection(links: ShopLink[]): ShopSection[] {
  const map = new Map<string, ShopLink[]>();
  for (const link of links) {
    const section = link.section || "Other";
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(link);
  }
  return Array.from(map.entries()).map(([name, links]) => ({ name, links }));
}

export default async function ShopPage() {
  const [links, settings] = await Promise.all([
    getShopLinks(),
    getShopPageSettings(),
  ]);

  const sections = groupBySection(links);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-text-primary">
          {settings.pageTitle || "Shop & Recommendations"}
        </h1>
        {settings.pageSubtitle && (
          <p className="mt-2 text-sm text-text-muted max-w-md mx-auto">
            {settings.pageSubtitle}
          </p>
        )}
      </div>

      <ShopLinksClient
        sections={sections}
        showSectionHeaders={settings.showSectionHeaders ?? true}
      />
    </div>
  );
}
