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

// ─── Per-page signal (title/h1/description only — headline-level, not full content) ─

export interface PageSignal {
  url: string;
  title: string;
  h1: string;
  metaDescription: string;
}

function extractTagText(html: string, pattern: RegExp): string {
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

export async function fetchPageSignal(url: string): Promise<PageSignal> {
  const html = await fetchText(url);
  const title = extractTagText(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = extractTagText(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const metaMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ??
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  return { url, title, h1, metaDescription: metaMatch?.[1]?.trim() ?? "" };
}
