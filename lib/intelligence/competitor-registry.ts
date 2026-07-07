/**
 * Curated, hand-maintained list of real, live-verified competitor sites for
 * the Competitor Content Gap engine — same convention as PRIORITY_KEYWORDS
 * in registry.ts. Only add a domain here after confirming (live, not
 * assumed) that it's a real, reachable business site in the same market —
 * fabricated or unreachable entries would silently produce no data, which
 * is worse than an honest short list.
 *
 * Verified live this session: flakkydeemakeova.com.ng is a real, live,
 * Lagos-based (Abule Egba) WordPress makeup-artist business site with a
 * working sitemap and a robots.txt declaring crawl-delay: 10. Two other
 * candidates considered were rejected — "Edith Williams Artistry" is real
 * but London-based (wrong market), and "Jojo's Touch" (jojostouch.com) is a
 * parked/for-sale GoDaddy domain, not a live business.
 */
export interface CompetitorSite {
  name: string;
  domain: string;
  market: string;
}

export const COMPETITOR_SITES: CompetitorSite[] = [
  { name: "FlakkyDee MakeOva", domain: "flakkydeemakeova.com.ng", market: "Lagos, Nigeria" },
];

// Floor for politeness when a competitor's robots.txt declares no crawl-delay at all.
export const DEFAULT_CRAWL_DELAY_MS = 3000;
// Hard cap on pages fetched per competitor per run, regardless of sitemap size.
export const MAX_PAGES_PER_COMPETITOR = 40;
