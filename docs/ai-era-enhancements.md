# AI-Era Enhancement Brief — rohithilluri.github.io

**Audit target:** `site/index.html` (single-file static portfolio, ~1250 lines, Elden-Ring-esque manuscript aesthetic, no frameworks, strict CSP, Tone.js is the only external script).

## What's already right for 2026

- `llms.txt` present and honest — canonical LLM-facing summary.
- Strict CSP with `connect-src 'none'`, SRI on Tone.js CDN, `strict-origin-when-cross-origin` referrer.
- Progressive enhancement: reveal, tilt, embers, and BGM are gated behind `html.js` and `prefers-reduced-motion`.
- Semantic sections, skip-link, focus-visible ring, keyboard-friendly nav.
- Fallback chain on paintings — never a blank scene.

The site is elegant. The gaps are all about **AI-readability**, **on-page intelligence**, and **modern platform features** that have landed since the last redesign.

---

## Brief

Three levers, in priority order:

1. **Make the site legible to LLMs and agents.** Content that isn't structured for machine consumption gets paraphrased poorly in AI answers. A single JSON-LD block plus an enriched `llms.txt` / `agent.json` fixes ~90% of that.
2. **Add one AI-native interaction the visitor can actually feel.** A ⌘K "Ask the page" palette that runs entirely client-side over the site's own text is the cleanest fit — no API keys, no CSP relaxation, no framework, no cost.
3. **Adopt the CSS/HTML features that shipped since this page was last touched.** View Transitions, scroll-driven animations, `text-wrap: balance`, `:has()`, `@container` — each removes JS and looks better than what's currently there.

Every recommendation below fits the "no frameworks, no build step" ethos.

---

## Bullet list of things to add / integrate / create

### 1. AI discoverability & Generative Engine Optimization (GEO)

- Add a single `<script type="application/ld+json">` in `<head>` with a `Person` + `WebSite` graph. Nest a `hasPart: [CreativeWork]` for each opus in Part I. This is what Perplexity/ChatGPT/Google AI Overviews actually parse.
- Extend `llms.txt` into a paired `llms-full.txt` that inlines the full prose of each section (title, intro, works, muses) as clean Markdown — the emerging convention for LLM crawlers.
- Publish `/.well-known/agent.json` (A2A / MCP-style agent card) advertising the portfolio as a queryable resource: capabilities = `describe_projects`, `get_bio`, `list_muses`.
- Add per-opus microdata (`itemtype="https://schema.org/SoftwareSourceCode"`) so "what has Rohith built" returns structured hits.
- Write real OG/Twitter card images (1200×630 PNG) baked from the hero — right now `og:image` is missing, so AI-summary previews fall back to nothing.
- Add `<meta name="citation_author">` and `<meta name="dc.creator">` — Bing Chat and Kagi Assistant still read these.

### 2. AI-native interaction on the page itself

- **⌘K "Ask this page" palette** — small (≈2KB) client-side fuzzy-search over the DOM's own text; results scroll-and-highlight the matching section. Zero external calls, no CSP change. This is the highest-signal AI-era feature you can add.
- **Voice tour** — Web Speech API `speechSynthesis` reads the current section aloud on a button press. Fits the manuscript metaphor ("hear the letter").
- **Semantic section deep-links** — `?ask=` query param that jumps + highlights the best-matching passage; makes the site linkable from any chatbot's answer.
- **Optional in-browser LLM** (progressive enhancement only): a *tiny* transformers.js / WebLLM model (Q4 quantized, ~30MB, loaded on click, cached in IndexedDB) that answers "what was Crave?" from the on-page corpus. Feature-flag by connection type — skip on slow networks. This is the fanciest option and worth doing only after (1) and (2) land.
- **Copy-as-prompt buttons** on each work — "Copy this project as a resume bullet / interview story / cover-letter paragraph." The text is pre-baked, not generated; the AI-era framing is the point.

### 3. Modern web platform (things that shipped since this page was written)

- **View Transitions API** — animate section jumps and the nav's active-state pip with `document.startViewTransition`. Two lines of JS, replaces ~30 lines of easing.
- **CSS scroll-driven animations** (`animation-timeline: view()`) — the `.reveal` fade can drop the IntersectionObserver entirely on supporting browsers; keep the JS as fallback.
- **`text-wrap: balance` / `text-wrap: pretty`** on every heading and the epigraph — one line, dramatic typographic upgrade.
- **`:has()` selectors** — highlight the nav pip whose section contains `:target`, replace the JS active-nav observer for compliant browsers.
- **`@container` queries** on `.posters` and `.opus` — currently every breakpoint is `@media (max-width: 720px)`; container queries make the grid resilient wherever it's embedded.
- **Anchor Positioning (`anchor-name` / `position-anchor`)** — attach the "provenance" caption to its scene without absolute-position math.
- **Speculation Rules** — `<script type="speculationrules">` prerender the section targets so `#works → #letter` is instant.
- **`content-visibility: auto`** on each `<section>` — free INP win, keeps the ember canvas cheap.
- **Priority Hints already partially set** (`fetchpriority="high"` on hero image) ✓ — extend `fetchpriority="low"` to poster images so INP holds under slow 4G.

### 4. Performance, PWA, offline

- Add a `manifest.webmanifest` + minimal service worker (~40 lines) → installable on iOS/Android, offline-safe. Fits the "single-file, artifact-like" ethos.
- Cache the Wikimedia paintings on first successful load — the fallback chain is great, but a hit-cache means the second visit never depends on the network.
- Move the Tone.js CDN load behind `import()` triggered by the sound toggle click — currently blocks nothing but wastes ~90KB on every visit that never touches sound.
- Add a Real User Monitoring one-liner for **INP** (the Web Vital that replaced FID in 2024) using `web-vitals` beacon → any privacy-first endpoint (Plausible, Umami self-host, or a Cloudflare Worker you own).

### 5. Live signals (opt-in, careful with CSP)

- **Live GitHub pinned-repo strip** under Part I — fetch `api.github.com/users/rohithIlluri/repos` on click ("show live"), then cache in `localStorage` for a week. Requires relaxing `connect-src` to `https://api.github.com` **only**.
- **Contribution heatmap** rendered inline as SVG from the same source; fits the gold-thread aesthetic.
- **Now-playing / now-reading** micro-feed pulled from a self-hosted JSON on the same origin (no CSP change).

### 6. Security & content authenticity (2026 posture)

- Move the inline `<style>` to a hashed external file and adopt **CSP nonces + Trusted Types**; current `'unsafe-inline'` is the one soft spot on the CSP.
- Add `Permissions-Policy` (interest-cohort, browsing-topics, unload, etc.) at the CDN layer.
- Attach **C2PA-style provenance metadata** to any personal-authored image; note "public-domain Wikimedia" on the painting captions (already implicitly done via the provenance label — make it explicit).
- Add a `humans.txt` and a short `security.txt` at `/.well-known/` — cheap trust signals.

### 7. Accessibility polish (AI-era assistants read this too)

- Landmark all four sections with `aria-labelledby` pointing at each `h2`.
- Add `aria-live="polite"` to the active-nav change so screen readers announce section progression.
- Provide `alt` text on painting `<img>` tags — currently empty (`alt=""`) which is *correct* for decoration, but the `provenance` line should carry the same info as `aria-label` on its parent scene.
- Keyboard shortcut key-map (`?` opens an overlay listing `⌘K`, `V` = voice tour, `M` = toggle music).

---

## Suggested implementation order

1. **Ship in one PR** (all zero-risk, no CSP change): JSON-LD graph, `llms-full.txt`, OG image, `text-wrap: balance`, `:has()` active-nav, `content-visibility: auto`, Speculation Rules, `content-visibility`, defer Tone.js.
2. **Second PR:** ⌘K "Ask this page" palette + `?ask=` deep links + voice tour.
3. **Third PR:** View Transitions + scroll-driven CSS animations + container queries.
4. **Fourth PR:** PWA manifest + service worker + INP RUM.
5. **Optional / experimental:** live GitHub strip (needs CSP tweak), in-browser LLM (needs perf gating), CSP-nonce hardening.

Each PR is small, reviewable, and independently mergeable. None of them betray the "no frameworks, single file" character — every line stays hand-written HTML/CSS/JS.
