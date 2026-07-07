/**
 * Curated, hand-maintained list of real, live-verified competitor sites for
 * the Competitor Content Gap engine — same convention as PRIORITY_KEYWORDS
 * in registry.ts. Only add a domain here after confirming (live, not
 * assumed) that it's a real, reachable business site in the same market —
 * fabricated or unreachable entries would silently produce no data, which
 * is worse than an honest short list.
 *
 * Verified live:
 * - flakkydeemakeova.com.ng — real, live, Lagos-based (Abule Egba) WordPress
 *   makeup-artist business site, working sitemap, robots.txt crawl-delay: 10.
 * - houseoftara.com — real, live, established Lagos/Nigeria beauty brand
 *   (24 makeup studios, makeup school), working wp-sitemap.xml declared via
 *   robots.txt's Sitemap: directive, no crawl-delay declared (uses the
 *   politeness floor below).
 *
 * Considered and rejected (checked live, not assumed):
 * - "Edith Williams Artistry" — real but London-based (wrong market).
 * - "Jojo's Touch" (jojostouch.com) — parked/for-sale GoDaddy domain, not a
 *   live business.
 * - Ronke Raji (ronkeraji.com) — real, live business, but her robots.txt
 *   declares `Disallow: /` for all agents (crawling everything refused) —
 *   honored, not worked around. Excluded on principle, not technical failure.
 * - Most other well-known individual Lagos MUAs (Glam by Omoye, Layefa
 *   Beauty, Bibyonce, Kim Beauty Studio) operate Instagram-only, with no
 *   crawlable website at all.
 */
export interface CompetitorSite {
  name: string;
  domain: string;
  market: string;
}

export const COMPETITOR_SITES: CompetitorSite[] = [
  { name: "FlakkyDee MakeOva", domain: "flakkydeemakeova.com.ng", market: "Lagos, Nigeria" },
  { name: "House of Tara", domain: "houseoftara.com", market: "Lagos, Nigeria" },
];

// Floor for politeness when a competitor's robots.txt declares no crawl-delay at all.
export const DEFAULT_CRAWL_DELAY_MS = 3000;
// Hard cap on pages fetched per competitor per run, regardless of sitemap size.
export const MAX_PAGES_PER_COMPETITOR = 40;
