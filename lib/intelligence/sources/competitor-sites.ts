/**
 * Fetchers for the Competitor Content Gap engine — modeled on
 * keyword-discovery-sources.ts's plain-fetch/custom-User-Agent pattern, no
 * auth, no library dependency (confirmed no HTML/XML parser exists in this
 * repo — regex extraction is sufficient since we only need headline-level
 * text, not full-content parsing). Robots.txt rules are always fetched and
 * respected by the caller (lib/intelligence/competitor-gap.ts) before any
 * page is crawled.
 */

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GleamCompetitorGap/1.0; respects-robots-txt)" },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.text();
}

// ─── robots.txt ─────────────────────────────────────────────────────────────

export interface RobotsRules {
  crawlDelayMs: number;
  disallowedPaths: string[];
  /** From a `Sitemap:` directive, if the site declares one — many WordPress sites (e.g. House of Tara) use /wp-sitemap.xml instead of the /sitemap.xml default. */
  sitemapUrl?: string;
}

/** Only the wildcard User-agent: * block is honored for Disallow/Crawl-delay — we aren't any of the named crawlers a site might special-case. `Sitemap:` is a global directive, not scoped to a User-agent block. */
export async function fetchRobotsRules(domain: string, defaultDelayMs: number): Promise<RobotsRules> {
  try {
    const text = await fetchText(`https://${domain}/robots.txt`);
    const lines = text.split(/\r?\n/);
    let applicable = false;
    let crawlDelayMs = defaultDelayMs;
    const disallowedPaths: string[] = [];
    let sitemapUrl: string | undefined;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) continue;
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const value = line.slice(colonIndex + 1).trim();

      if (key === "sitemap" && value) {
        sitemapUrl = value; // global, applies regardless of User-agent block
        continue;
      }
      if (key === "user-agent") {
        applicable = value === "*";
        continue;
      }
      if (!applicable) continue;

      if (key === "crawl-delay") {
        const seconds = Number(value);
        if (Number.isFinite(seconds) && seconds > 0) crawlDelayMs = Math.max(crawlDelayMs, seconds * 1000);
      } else if (key === "disallow" && value) {
        disallowedPaths.push(value);
      }
    }

    return { crawlDelayMs, disallowedPaths, sitemapUrl };
  } catch {
    return { crawlDelayMs: defaultDelayMs, disallowedPaths: [] };
  }
}

export function isDisallowed(url: string, disallowedPaths: string[]): boolean {
  try {
    const path = new URL(url).pathname;
    return disallowedPaths.some((prefix) => prefix && path.startsWith(prefix));
  } catch {
    return false;
  }
}

// ─── sitemap.xml (handles one level of sitemap index, no library needed) ──

async function extractSitemapUrls(sitemapUrl: string, depth: number): Promise<string[]> {
  const xml = await fetchText(sitemapUrl);
  if (/<sitemapindex/i.test(xml)) {
    if (depth >= 1) return []; // one level of index is what real sites use — bounded recursion
    const childSitemaps = [...xml.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
    const nested = await Promise.all(childSitemaps.map((url) => extractSitemapUrls(url, depth + 1)));
    return nested.flat();
  }
  return [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
}

export async function fetchSitemapUrls(domain: string, sitemapUrl?: string): Promise<string[]> {
  try {
    return await extractSitemapUrls(sitemapUrl ?? `https://${domain}/sitemap.xml`, 0);
  } catch {
    return [];
  }
}

/**
 * Supplementary discovery: a site's own sitemap can be incomplete (e.g. a
 * WordPress "pages" sitemap that only lists WooCommerce boilerplate —
 * confirmed live for flakkydeemakeova.com.ng, whose real content pages like
 * /bridal-makeup-artist-lagos/ aren't in its sitemap.xml at all but ARE
 * linked from its homepage nav). Same-domain links only.
 */
export async function fetchHomepageLinks(domain: string): Promise<string[]> {
  try {
    const html = await fetchText(`https://${domain}/`);
    const hrefs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
    const seen = new Set<string>();
    const urls: string[] = [];
    for (const href of hrefs) {
      try {
        const resolved = new URL(href, `https://${domain}/`);
        if (resolved.hostname !== domain && resolved.hostname !== `www.${domain}`) continue;
        resolved.hash = "";
        const normalized = resolved.toString();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        urls.push(normalized);
      } catch {
        continue;
      }
    }
    return urls;
  } catch {
    return [];
  }
}

// ─── Per-page signal (enriched deep extraction via regex — no external parser) ─

export interface PageHeading {
  level: number;
  text: string;
}

export interface PageSignal {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
  headings: PageHeading[];
  approximateWordCount: number;
  imageCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  hasSchemaJsonLd: boolean;
  schemaTypes: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
}

function extractTagText(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

function extractMetaContent(html: string, property: string): string {
  const p1 = new RegExp(`<meta\\s+(?:property|name)=["']${property}["']\\s+content=["']([^"']*)["']`, "i");
  const p2 = new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+(?:property|name)=["']${property}["']`, "i");
  return (html.match(p1)?.[1] ?? html.match(p2)?.[1] ?? "").trim();
}

function countWords(html: string): number {
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/&\w+;/g, " ");
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function extractHeadings(html: string): PageHeading[] {
  const results: PageHeading[] = [];
  const re = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, "").trim();
    if (text) results.push({ level: Number(m[1]), text });
  }
  return results;
}

function classifyLinks(html: string, pageUrl: string): { internal: number; external: number } {
  let pageDomain: string;
  try {
    pageDomain = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return { internal: 0, external: 0 };
  }
  const hrefs = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  let internal = 0;
  let external = 0;
  for (const href of hrefs) {
    try {
      const resolved = new URL(href, pageUrl);
      if (resolved.protocol !== "http:" && resolved.protocol !== "https:") continue;
      const hDomain = resolved.hostname.replace(/^www\./, "");
      if (hDomain === pageDomain) internal++;
      else external++;
    } catch {
      if (href.startsWith("/") || href.startsWith("#")) internal++;
    }
  }
  return { internal, external };
}

function extractSchemaTypes(html: string): string[] {
  const types: string[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item["@type"]) {
          const t = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
          types.push(...t.map(String));
        }
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }
  return [...new Set(types)];
}

export async function fetchPageSignal(url: string): Promise<PageSignal> {
  const html = await fetchText(url);
  const title = extractTagText(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = extractTagText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const metaMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ??
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);

  const headings = extractHeadings(html);
  const approximateWordCount = countWords(html);
  const imageCount = (html.match(/<img\s/gi) ?? []).length;
  const links = classifyLinks(html, url);
  const schemaTypes = extractSchemaTypes(html);

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);

  return {
    url,
    title,
    h1,
    metaDescription: metaMatch?.[1]?.trim() ?? "",
    headings,
    approximateWordCount,
    imageCount,
    internalLinkCount: links.internal,
    externalLinkCount: links.external,
    hasSchemaJsonLd: schemaTypes.length > 0,
    schemaTypes,
    canonicalUrl: canonicalMatch?.[1]?.trim() ?? "",
    ogTitle: extractMetaContent(html, "og:title"),
    ogDescription: extractMetaContent(html, "og:description"),
  };
}
