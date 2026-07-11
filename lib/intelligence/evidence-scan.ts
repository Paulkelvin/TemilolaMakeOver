/**
 * Evidence / E-E-A-T Placeholder Scanner — deterministic, heuristic pattern
 * matching over a drafted article's real paragraphs. Detects claims that a
 * real photo, price, or client quote would substantiate, and flags them —
 * it never invents evidence, per the explicit instruction this system was
 * designed against. Merges what the original 10-phase proposal called the
 * "Evidence Engine" (Phase 5) and "E-E-A-T Engine" (Phase 8): they're the
 * same underlying signal — a claim with no attached proof — viewed two ways,
 * so this is one engine, not two.
 */

export type EvidenceTriggerType = "pricing" | "visual-result" | "client-experience" | "case-study";

export interface EvidenceGap {
  blockKey: string;
  triggerType: EvidenceTriggerType;
  placeholderText: string;
  matchedSentence: string;
  nearestHeading?: string;
}

interface Trigger {
  type: EvidenceTriggerType;
  pattern: RegExp;
  placeholderText: string;
}

const TRIGGERS: Trigger[] = [
  {
    type: "pricing",
    pattern: /₦\s?\d|naira|\bcost(s|ing)?\b|\bprice[sd]?\b|\bdeposit\b/i,
    placeholderText: "Add a real client pricing example here",
  },
  {
    type: "visual-result",
    pattern: /\bresult(s)?\b|\bfinish(ed)?\b|\bglow\b|\bbefore and after\b|\btransformation\b|\blooks? (flawless|polished|natural|dramatic|stunning)\b/i,
    placeholderText: "Add a before/after or client photo here",
  },
  {
    type: "client-experience",
    pattern: /\b(client|bride|customer)s?\b.{0,40}\b(felt|loved|said|told me|was so|cried|nervous)\b/i,
    placeholderText: "Add a real customer quote here",
  },
  {
    type: "case-study",
    pattern: /\bmany (clients|brides)\b|\bin my experience\b|\bi('ve| have) (done|worked with|seen)\b/i,
    placeholderText: "Add a real case study or portfolio example here",
  },
];

const HEADING_STYLES = new Set(["h2", "h3", "h4"]);

interface PortableTextSpanLite {
  text?: string;
}

export interface PortableTextBlockLite {
  _key: string;
  _type: string;
  style?: string;
  children?: PortableTextSpanLite[];
}

export function blockText(block: PortableTextBlockLite): string {
  if (block._type !== "block") return "";
  return (block.children ?? []).map((c) => c.text ?? "").join("");
}

/**
 * One flag per paragraph is enough signal — checking every trigger against
 * every paragraph and keeping only the first match avoids stacking multiple
 * near-identical placeholders on a single dense paragraph.
 */
export function scanBlogBodyForEvidenceGaps(body: PortableTextBlockLite[]): EvidenceGap[] {
  const gaps: EvidenceGap[] = [];
  let nearestHeading: string | undefined;

  for (const block of body) {
    if (block._type !== "block") continue;
    const text = blockText(block);
    if (!text) continue;

    if (block.style && HEADING_STYLES.has(block.style)) {
      nearestHeading = text;
      continue;
    }

    const trigger = TRIGGERS.find((t) => t.pattern.test(text));
    if (trigger) {
      gaps.push({
        blockKey: block._key,
        triggerType: trigger.type,
        placeholderText: trigger.placeholderText,
        matchedSentence: text,
        nearestHeading,
      });
    }
  }

  return gaps;
}

/**
 * Builds a real experiencePlaceholder Portable Text block (Studio-only —
 * excluded from the public PortableText renderer, see blog/[slug]/page.tsx)
 * ready to insert after the flagged paragraph. Insertion itself is left to
 * the caller (a Studio review pass or a future publish-flow script), since
 * where and whether to insert is an editorial decision, not this scanner's.
 */
export function buildPlaceholderBlock(gap: EvidenceGap, keySuffix: string) {
  return {
    _key: `evidence-${gap.blockKey}-${keySuffix}`,
    _type: "experiencePlaceholder",
    triggerType: gap.triggerType,
    placeholderText: gap.placeholderText,
    matchedSentence: gap.matchedSentence,
    resolved: false,
  };
}

export interface ParsedDraft {
  headings: string[];
  blocks: PortableTextBlockLite[];
  // Heading marker lines stripped out, paragraphs rejoined — the plain text
  // other checks (readability, stuffing, coverage, originality) expect.
  plainBodyText: string;
}

const HEADING_LINE = /^#{1,3}\s+(.+)$/;

/**
 * Parses a writer's pasted draft (plain paragraphs, with "## Heading" lines
 * marking section breaks) into an ordered block sequence. This is the only
 * way scanBlogBodyForEvidenceGaps's sequential nearestHeading tracking can
 * be correct — headings and paragraphs must be interleaved in the order the
 * writer actually wrote them, not collected into two separate lists.
 */
export function parseDraftBody(rawText: string): ParsedDraft {
  const headings: string[] = [];
  const blocks: PortableTextBlockLite[] = [];
  const plainParagraphs: string[] = [];
  let paragraphBuffer: string[] = [];
  let blockIndex = 0;

  function flushParagraph() {
    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];
    if (!text) return;
    blocks.push({ _key: `p${blockIndex++}`, _type: "block", style: "normal", children: [{ text }] });
    plainParagraphs.push(text);
  }

  for (const rawLine of rawText.split(/\r?\n/)) {
    const line = rawLine.trim();
    const headingMatch = line.match(HEADING_LINE);
    if (headingMatch) {
      flushParagraph();
      const headingText = headingMatch[1].trim();
      blocks.push({ _key: `h${blockIndex++}`, _type: "block", style: "h2", children: [{ text: headingText }] });
      headings.push(headingText);
      continue;
    }
    if (!line) {
      flushParagraph();
      continue;
    }
    paragraphBuffer.push(line);
  }
  flushParagraph();

  return { headings, blocks, plainBodyText: plainParagraphs.join("\n\n") };
}

export interface EvidenceSummary {
  totalGaps: number;
  byTrigger: Record<EvidenceTriggerType, number>;
  eeatSupportScore: number; // 0-100, used by the quality-score aggregator
}

// Each unresolved gap costs 15 points off a 100 base, floored at 0 — the
// same shape as the quality-score design in the architecture review.
const POINTS_PER_GAP = 15;

export function summarizeEvidenceGaps(gaps: EvidenceGap[]): EvidenceSummary {
  const byTrigger: Record<EvidenceTriggerType, number> = {
    pricing: 0,
    "visual-result": 0,
    "client-experience": 0,
    "case-study": 0,
  };
  for (const g of gaps) byTrigger[g.triggerType]++;

  return {
    totalGaps: gaps.length,
    byTrigger,
    eeatSupportScore: Math.max(0, 100 - gaps.length * POINTS_PER_GAP),
  };
}
