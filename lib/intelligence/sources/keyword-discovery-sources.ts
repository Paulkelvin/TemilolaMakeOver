/**
 * Free, no-auth external keyword sources — confirmed reachable, no API key,
 * no config gate (unlike the Search Console-backed engine, this works with
 * zero setup). Deliberately limited to sources that returned real, parseable
 * data when tested directly: Reddit's public search API now 403s without an
 * OAuth app, Pinterest has no stable public endpoint, and Google's "People
 * Also Ask"/"Related Searches" are JS-rendered on the results page (would
 * need a scraping headless browser — fragile, ToS-risky, and exactly the
 * unreliable-guess category this engine is designed to avoid).
 */

const SUGGEST_BASE = "https://suggestqueries.google.com/complete/search";

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GleamKeywordDiscovery/1.0)" },
  });
  if (!res.ok) throw new Error(`Autocomplete fetch failed (${res.status}): ${url}`);
  return res.text();
}

/** Google web-search autocomplete — real, Google-observed query demand. */
export async function getGoogleAutocomplete(query: string): Promise<string[]> {
  const url = `${SUGGEST_BASE}?client=firefox&q=${encodeURIComponent(query)}`;
  const text = await fetchText(url);
  try {
    const parsed = JSON.parse(text) as [string, string[], ...unknown[]];
    return parsed[1] ?? [];
  } catch {
    return [];
  }
}

/** YouTube autocomplete — video-search phrasing, complements web-search demand. */
export async function getYouTubeAutocomplete(query: string): Promise<string[]> {
  const url = `${SUGGEST_BASE}?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
  const text = await fetchText(url);
  try {
    const jsonStart = text.indexOf("(");
    const jsonEnd = text.lastIndexOf(")");
    if (jsonStart === -1 || jsonEnd === -1) return [];
    const parsed = JSON.parse(text.slice(jsonStart + 1, jsonEnd)) as [string, [string, ...unknown[]][]];
    return (parsed[1] ?? []).map((entry) => entry[0]);
  } catch {
    return [];
  }
}

/** Bing autocomplete — same OpenSearch JSON format as Google, different demand signal. Graceful degradation on failure. */
export async function getBingAutocomplete(query: string): Promise<string[]> {
  try {
    const url = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
    const text = await fetchText(url);
    const parsed = JSON.parse(text) as [string, string[]];
    return parsed[1] ?? [];
  } catch {
    return [];
  }
}

/** Generate "query a", "query b", ... "query z" for deeper long-tail expansion. */
export function generateAlphabetVariants(query: string): string[] {
  return Array.from("abcdefghijklmnopqrstuvwxyz").map((c) => `${query} ${c}`);
}
