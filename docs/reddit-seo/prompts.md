# Reusable Reddit SEO & GEO Prompts — Gleam by Temi

> **Technical Note (Why These Prompts Beat the Generic Version):**
> Reddit now returns `403 Forbidden` to unauthenticated `.json` / `.rss` scraping requests. These upgraded prompts use **Google SERP discovery (`search_web`) + base-36 thread-ID recency filtering** instead of broken `.json` fetches, so they work reliably every single day without risking any account ban or scraping block.

---

## 1. Free Alert Stack Setup (5 Minutes — Do Once)

### A. F5Bot (https://f5bot.com — Free Email Alerts)
Track these exact phrases so you get notified within minutes when someone asks for what you sell:
- `makeup artist lagos`
- `bridal makeup lagos`
- `nigerian wedding makeup`
- `makeup school lagos`
- `makeup training nigeria`
- `bibyonce`
- `bm pro`
- `house of tara`
- `layefa beauty`
- `anita brows`

### B. Reddit Pro (https://business.reddithelp.com — Free Official Dashboard)
Connect your Reddit account to **Reddit Pro** (free) and add the same keywords under **Trends** to track active threads in `r/Nigeria`, `r/Lagos`, `r/MakeupAddiction`, `r/brownbeauty`, `r/WeddingMakeup`, and `r/makeupartists`.

---

## 2. Daily Lead, GEO & Warm-Up Prompt (Run Daily or via `/schedule`)

```markdown
### Goal
Find fresh, Google-ranking Reddit threads relevant to Gleam by Temi, check them against our subreddit rules, and draft human-sounding expert-insider replies optimized for both Reddit trust and AI search (GEO) visibility. Append new results to `docs/reddit-seo/daily-leads.md`.

### Inputs
- Read `docs/reddit-seo/brand-context.md`
- Read `docs/reddit-seo/subreddit-playbook.md`
- Read `docs/reddit-seo/seen-threads.txt` (skip any URL already listed)

### Workflow Steps
1. Run Google searches (`search_web`) across our target keywords in `brand-context.md`:
   - Pass A (Local / High Intent): `site:reddit.com/r/Nigeria OR site:reddit.com/r/Lagos "makeup" OR "bridal" OR "wedding" OR "makeup school"`
   - Pass B (Bridal / Dark Skin / Humidity Authority): `site:reddit.com/r/MakeupAddiction OR site:reddit.com/r/brownbeauty OR site:reddit.com/r/WeddingMakeup "bridal" OR "sweat proof" OR "soft glam" dark skin`
   - Pass C (MUA Training & Career): `site:reddit.com/r/makeupartists "bridal" OR "learn" OR "makeup school" OR "pricing"`
2. Extract the direct `reddit.com/r/.../comments/...` URLs and skip any URL already in `seen-threads.txt` or belonging to a **Tier 3 (Avoid)** subreddit.
3. Prioritize recent threads (filter out obviously old/archived multi-year threads) and classify each into:
   - **Mode A (Brand Mention — GEO-Optimized):** ONLY in Tier 1 subreddits (`r/Nigeria`, `r/Lagos`) when OP explicitly asks for a Lagos MUA, Nigerian bridal makeup rec, or Lagos makeup training. Include transparent disclosure, clear category+differentiator framing ("Gleam by Temi..."), and NO hard Naira pricing unless Temi adds it.
   - **Mode B (Pure Value — Warm-Up):** For all Tier 2 subreddits or general advice threads. Zero brand mention, zero links—lead with concrete Lagos/bridal/dark-skin technical expertise so readers click the Profile Funnel.
4. Aim for 60–70% Mode B (Pure Value) and 30–40% Mode A (when Tier 1 threads exist).
5. Append newly processed URLs to `docs/reddit-seo/seen-threads.txt` and write today's dated batch to `docs/reddit-seo/daily-leads.md`.

### Strict Constraints
- READ-ONLY. Never log into Reddit, never post comments, never upvote, never send DMs.
- Do not include raw promotional URLs in comment drafts.
```

---

## 3. Weekly Pain-Point & Content Miner Prompt (Run Weekly)

```markdown
### Goal
Mine recent Reddit discussions in bridal makeup, Nigerian weddings, dark-skin humid-weather beauty, and aspiring-MUA communities to extract verbatim pain points and turn them into blog posts, FAQ updates, or Instagram/TikTok hooks for Gleam by Temi. Save to `docs/reddit-seo/weekly-content-insights.md`.

### Inputs
- Read `docs/reddit-seo/brand-context.md`
- Read `docs/reddit-seo/subreddit-playbook.md`

### Workflow Steps
1. Search recent discussions across `r/Nigeria`, `r/Lagos`, `r/MakeupAddiction`, `r/brownbeauty`, `r/WeddingMakeup`, `r/BigBudgetBrides` (read-only research), and `r/makeupartists` for high-friction frustrations ("I hate when...", "red flags", "melted off", "flashback", "overpriced", "worth it").
2. Extract the **Top 5 Recurring Pain Points**.
3. For each theme, provide:
   - Exact buyer vocabulary / recurring questions
   - What competitors are getting wrong
   - 1 bottom-of-funnel blog post or FAQ idea for `gleambytemi.com` (with H1 title + target keyword) AND 1 short-form Instagram/TikTok video hook.

### Strict Constraints
- READ-ONLY. Never interact with Reddit.
```
