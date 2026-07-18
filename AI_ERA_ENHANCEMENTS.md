# AI-Era Enhancements — Brief

A short read on what the current site is, what "AI-era web" actually
means in 2026, and a prioritized list of things we can add without
breaking the parchment aesthetic or the no-framework, no-network stance.

## What the site is today

- Single static HTML page (`site/index.html`, ~1,250 lines) deployed to
  GitHub Pages from `master`.
- Antiquarian / Elden Ring aesthetic: Cinzel + EB Garamond, parchment
  palette, gilt-thread scroll progress, canvas ember particles.
- Four sections — Works, Craft, Muses, Letter — narrated as "Parts".
- Living paintings pulled from Wikimedia Commons with graceful CSS
  underpaint fallbacks; motion posters with a hover tilt.
- Orchestral BGM via Tone.js (generative, gesture-gated).
- Strict CSP: `default-src 'none'; connect-src 'none'`. That's the
  constraint any new feature has to respect.
- Already ships an `llms.txt`. Good baseline.

## What "AI-era web" means in 2026 — worth doing

1. **LLM-first discoverability.** People arrive via ChatGPT / Claude
   / Perplexity / Google AI Overviews as much as via search. The site
   needs machine-readable identity so those systems cite you correctly.
2. **On-device AI, not chatbots-behind-APIs.** Chrome's built-in
   `LanguageModel` (Prompt API), WebLLM, and `transformers.js` mean
   small models run in the browser — no server, no key, no CSP break
   for `connect-src`.
3. **Instant navigation.** Speculation Rules API + View Transitions
   are the 2025-baseline UX polish; both are progressive-enhancement.
4. **Content provenance.** `ai.txt` / C2PA-style signals let you state
   how the site may be used for training vs. citation.
5. **Museum-audio-guide affordances.** Web Speech API narration is
   free, on-device, and matches the "walk through the gallery" framing
   this site already leans into.

Anything that needs a server, an API key, or a new outbound origin
(third-party chat widgets, hosted RAG, analytics-flavored "AI") is
off-brand for this site — it breaks the CSP and the artisanal feel.

## Bullet list — prioritized

### Just shipped in this branch (safe, invisible, additive)

- `schema.org/Person` + `WebSite` **JSON-LD** in `<head>` — lets
  LLMs and search AI answer "who is Rohith Illuri?" with structured
  facts (name, URL, sameAs GitHub, jobTitle, knowsAbout skills).
- **`ai.txt`** at the site root — Spawning-style policy file signalling
  citation OK / training requires attribution.
- **Enriched `llms.txt`** — project names now have canonical URLs and
  one-line summaries; a crawler can build a correct answer from this
  file alone.
- **`<link rel="alternate" type="text/plain" title="llms.txt">`** —
  makes the LLM manifest formally discoverable from the HTML head.

### Next tier — recommended, aesthetic-safe

- **View Transitions API** — cross-fade between sections on anchor
  navigation. Two CSS rules, zero JS if we use the modern MPA form.
- **Speculation Rules `<script type="speculationrules">`** — prerender
  outbound project links (GitHub) on hover. Feels instant.
- **Web Speech API "Curator" toggle** — a second button next to the
  sound toggle: "NARRATE". Reads each Part's epigraph and gloss in the
  visitor's voice of choice. Perfect fit for the museum framing, no
  network, no CSP change.
- **`sitemap.xml`** — `robots.txt` already advertises it; the file
  itself is missing. One-page site so it's four lines.
- **Open Graph image** — a rendered "book cover" PNG (title +
  flourish) so LinkedIn / X previews match the vibe.
- **`prefers-contrast: more`** styles — parchment-on-gold has low
  contrast; a high-contrast variant lifts a11y score.

### Bigger swings — needs your call

- **On-device curator chat (WebLLM / `window.LanguageModel`).** A
  slide-in scroll asking "ask the curator" — answers scoped to
  `llms.txt` contents. Uses the browser's own model when available
  (Chrome 128+ desktop), gracefully hidden otherwise. No server, no
  key. Costs: ~1–3MB JS bundle (WebLLM shim) or 0 bytes if we only
  target Chrome's built-in API.
- **Semantic search over the projects.** Precompute embeddings for
  each project blurb at build, ship a small JSON, search in-browser
  with cosine similarity. ~5KB payload. Enables "show me the ML one"
  → highlights NNETS. Purely local.
- **RAG-friendly section anchors + microdata.** Every Part gets
  `itemscope itemtype="CreativeWork"`; adds ~30 lines, no visual
  change, dramatically better crawl fidelity.
- **Content Credentials / C2PA badge** on the paintings. Signals
  provenance for the Wikimedia sources; nice-to-have, not urgent.
- **Live "now" line** — one sentence updated by editing the file
  ("Reading: X. Building: Y."). Not AI, but the shape LLMs are
  trained to pick up as freshness signal.

### Don't do (would break the site)

- Third-party chatbot widget (Intercom / Drift / any hosted).
  Breaks CSP `connect-src 'none'`, breaks the tone.
- Framework rewrite to Next/Astro. The whole point is that this is
  hand-wrought HTML. Any AI-era feature above works without one.
- Analytics-flavored "AI insights". Off-brand, requires an outbound
  origin, adds nothing for the visitor.

## How we'd add any of these

Every item in the "Next tier" and "Bigger swings" lists is a
same-file edit to `site/index.html` (plus at most one new asset
under `site/`). The pattern is:

1. Feature-detect. If `('LanguageModel' in window)` etc.,
   progressively enhance; otherwise hide the affordance entirely.
2. Gate behind a gesture, same as the sound toggle already does.
3. Respect `prefers-reduced-motion` / `prefers-reduced-transparency`.
4. Update the CSP only if strictly necessary, and only for a specific
   host (never `*`). WebLLM would need `wasm-unsafe-eval` in
   `script-src` and a `connect-src` entry for the model CDN — worth
   flagging before we add it.
5. Add a test in `tests/poc/` mirroring the existing jsdom pattern.

## Recommended next step

Ship the four "just shipped" items on this branch (already staged in
the accompanying commit) and pick one from the "Next tier" list. My
vote: **Web Speech API "Curator" toggle** — it's the single item that
adds a distinctly AI-era affordance while sounding exactly like this
site's existing voice.
