# Portfolio Redesign Research Report
### rohithilluri.github.io — June 2026

---

## Brief Recap

**Owner's priorities:**
- Personal expression first (music, movies, personality > career optimization)
- Cut ruthlessly: at most ONE signature element survives
- Deliver 2–3 distinct concepts to choose between
- Rebuild fresh — CRA is deprecated

---

## Part A — Principles: What Makes Expressive Personal Sites Work

These are derived from studying the reference tier: rauno.me, paco.me, leerob.com,
brianlovin.com, joshwcomeau.com, kepano.com (Steph Ango), Tom MacWright's site,
charm.sh, Maggie Appleton's site, Bruno Simon's site.

---

### Principle 1: The site has a point of view, not a feature list

The sites that hold up have a legible thesis — "I make things at the intersection of
design and engineering" (rauno.me) or "I write to think" (Tom MacWright) or "the site
itself is the demo" (Bruno Simon). That thesis filters every decision about what to
include. The current site has no thesis — it has a feature list.

### Principle 2: The personality IS the editorial judgment, not the widgets

The best personal sites express personality through *what is chosen and how it's
written*, not through interactive novelty. brianlovin.com's personality comes through
in what he links to and how he annotates it. joshwcomeau.com's personality comes
through in how his blog posts teach through play. kepano.com's personality comes
through in his thinking on tools for thought. None of them have boot screens.

The current site has it backwards: lots of personality-signaling infrastructure
(mascot, music player, boot screen) with very little actual personal signal in the
content.

### Principle 3: One signature element, executed at 100%

Bruno Simon: the 3D driving game IS the whole site. joshwcomeau.com: interactive
widgets built into his posts ARE his work. charm.sh: the terminal aesthetic is
authentic because they BUILD terminal tools. The pattern: one idea, taken all the way.

The current site has eight personality features competing with each other, each at
~60% execution. A creature mascot AND a command palette AND a YouTube player AND a
boot screen. They cancel each other out.

### Principle 4: Restraint is the most legible signal of seniority

Multiple hiring managers, engineers, and designers have noted in public (HN, blog
posts) that the same tropes — skill bars, boot screens, terminal themes, particle
backgrounds — appear on every junior portfolio because junior developers learned to
build them from the same tutorials. Removing all of them, and letting your actual work
speak, reads as confident and senior.

The counterintuitive move: a site with no gimmicks and real project depth reads as
more experienced than a site with many gimmicks and shallow projects.

### Principle 5: Terminal as design language vs. terminal as costume

charm.sh and warp.dev use terminal aesthetics authentically because they build
terminal software — the aesthetic is proof of the thing, not decoration. Sacred
Computer (internet.dev's design system) uses terminal grid rigorously as a design
system with real constraints.

Terminal-themed portfolios that don't make terminal tools tend to read as a costume.
The tell: fake `whoami` commands, ASCII art "boot" sequences, skill percentages
rendered as progress bars styled to look like CLI output. These mimic the form without
the function.

**When terminal CAN still work:** Only if (a) you actually build terminal/CLI/dev
tooling so the aesthetic is authentic, or (b) you treat it as a strict design system
with real constraints (fixed-width grid, true monochrome, no decorative elements that
couldn't exist in a real terminal) rather than a theme applied loosely.

### Principle 6: Music and media live best as curation, not live widgets

The most cited "now playing" implementation is Lee Robinson's (leerob.com) — a small
footer widget using the Spotify Web API. But even he has moved away from it in recent
redesigns. The reason: it's a lot of infrastructure for a detail that visitors glance
at once. 

What works better for personal expression: *editorial curation*. A short list of
"albums I keep returning to" with two sentences on each, updated a few times a year,
says far more about you than a real-time API call. The same applies to films. The
/now page movement (Derek Sivers) captured this: a manual, thoughtful page that says
where you are and what you're into right now.

### Principle 7: Performance and accessibility are non-negotiable in 2025–26

Autoplaying audio is an accessibility violation and universally disliked. Excessive
motion fails `prefers-reduced-motion`. A 3-second boot animation means 30% of
visitors have already hit Back. The current site has all three.

---

## Part B — The Reference Sites

| Site | Signature element | What to steal |
|------|------------------|---------------|
| **rauno.me** | Hover micro-interactions revealing details — precise spring physics, nothing else | Interaction as craft signal; extreme restraint everywhere else |
| **paco.me** | Near-monochrome dark; minimal typography with exquisite spacing | The dark palette done at the right level of detail |
| **leerob.com** | Just text. Link list. No images, no widgets. The removal is the statement | Confidence through omission |
| **brianlovin.com** | Dense writing/notes/links section; personal taste expressed through annotation | Personality through what you link and write, not how the site looks |
| **joshwcomeau.com** | Blog posts that ARE interactive demos — the writing proves the skill | If you do interactivity, make it the content, not decoration |
| **kepano.com** | Writing + /now page + media diet — personal publishing done quietly | /now page as a pattern; media curation as writing |
| **Bruno Simon** | The whole site is a 3D driving game | One idea, 100% |
| **charm.sh** | Terminal aesthetic earned because they MAKE terminal tools | Authenticity — only use an aesthetic if it reflects actual work |
| **Maggie Appleton** | Illustrated digital garden — her illustrations ARE her work | Site as portfolio when the medium is the craft |
| **Tom MacWright** | Ultra minimal writing site; monthly media diet posts | Media as writing, not widgets |

---

## Part C — Stack Landscape 2025–26

### Framework

**Create React App**: Officially deprecated by the React team (removed from official
docs in 2023, no longer maintained). Not a viable starting point.

**Astro 5.x**: Best fit for a personal/portfolio site in 2025.
- HTML-first, zero JS by default, Islands architecture for interactive pieces
- Content Collections for blog posts, media logs, notes — typed, auto-queried
- `output: 'static'` works perfectly for GitHub Pages
- Built-in image optimization (`<Image />` component)
- MDX support for rich writing
- Tiny bundles — a typical Astro blog page ships 0 KB of JS
- GitHub Pages deployment: official `@astrojs/vercel` or simply `astro build` →
  upload `dist/` via GitHub Actions

**Next.js 15**: Overkill for a personal site with no dynamic server routes. The App
Router adds complexity; `output: 'export'` static mode works on GitHub Pages but
loses most reasons to use Next.js. Better for apps.

**Vite + React**: Good middle ground if you want React's component model and ecosystem
without CRA's baggage. SPA on GitHub Pages requires copying `index.html` → `404.html`
for client-side routing. No built-in content layer (need to roll your own or use
remark/gray-matter). Viable for Concept 2 (micro-craft interactions).

**SvelteKit**: Excellent static adapter. Much smaller bundles than React. Good DX.
Worth considering if you're open to Svelte.

**Recommendation by concept:**
- Concept 1 (Editorial): Astro 5, plain CSS
- Concept 2 (Micro-craft): Vite + React + Motion, or Astro with React islands
- Concept 3 (Living Document): Astro 5, MDX content collections

### Animation

**GSAP**: Acquired by / partnered with Webflow in 2024. As of late 2024, all
previously premium GSAP plugins (ScrollTrigger, SplitText, Flip, MorphSVG, etc.) are
now free for non-Webflow use. Full GSAP suite is zero-cost. Still the most capable
animation library; heavyweight for a personal site unless you're doing something
complex.

**Motion** (formerly Framer Motion): Rebranded to "Motion" in 2024 (motion.dev).
New `motion` npm package replaces `framer-motion`. Now has a vanilla JS version
separate from the React package. Best-in-class spring physics. Use for Concept 2.

**CSS Scroll-Driven Animations**: Native browser spec, no JS, good support in Chrome/
Edge 2024+, Firefox behind flag. Worth using for simple entrance/parallax effects.

**View Transitions API**: Baseline 2024. Smooth page transitions in Astro with a
single config line. Effectively free tasteful transitions.

**Recommendation**: For Concepts 1 and 3, use only CSS + View Transitions. For
Concept 2, use Motion for the one signature interaction.

### CSS

**Tailwind CSS v4**: Released early 2025. CSS-first config (no `tailwind.config.js` —
configure in CSS with `@theme`). Built-in Lightning CSS for processing. Faster build
times. CSS cascade layers. Slightly rough adoption edges in early 2025. v3 is still
widely used and stable.

**Plain modern CSS**: For a personal site, increasingly the right call. CSS nesting
is native in all browsers (2024 Baseline). Container queries widely supported. Custom
properties for theming. No build step required. Recommended for Concepts 1 and 3.

**Tailwind v3** (or v4): Fine for Concept 2 where utility classes speed up the
micro-craft work. Don't fight Tailwind on typography — use it for layout/spacing and
custom CSS for type.

### Deployment (GitHub Pages)

Constraints: static files only. No serverless functions. HTTPS on `*.github.io`
and custom domains. No per-request server logic.

Implications:
- Spotify "now playing" real-time widget **cannot run** purely on GitHub Pages — needs
  a server to hold the OAuth refresh token. Options:
  a. Free Vercel/Netlify edge function (separate deploy, free tier)
  b. Last.fm scrobbler (simpler auth, public API with API key only)
  c. Build-time fetch of "recently played" (stale but no server needed)
  d. Skip real-time; use editorial curation instead (recommended)
- Letterboxd: No official public API. RSS feed at `letterboxd.com/username/rss/`
  is public — parse at build time in Astro's content layer.
- GitHub Pages Actions workflow: standard `actions/deploy-pages@v2`, takes `dist/`
  from `astro build`.

---

## Part D — The Three Concepts

---

### CONCEPT 1: "The Column"
**Radical editorial simplicity**

**Point of view:** The most confident move is the smallest surface area. One column,
everything in reading order, no tabs or navigation required — just scrolling through a
life in text. Personality lives entirely in writing voice and curation, not interactive
features. The site does one thing: it reads like a person.

**The ONE signature element:** A hand-curated `/now` page — updated a few times a
year — that says exactly where you are: what you're building, what you're listening
to, what you watched last month. Manual, opinionated, human. No live API. The
intentionality of *choosing* what to surface is more personal than any widget.

**Layout:**
- Single column, ~660px max-width, auto margins
- No tabs, no sidebar, no navigation beyond a minimal sticky header
- Sections flow as a document: intro → selected work → writing/notes → currently into
- Horizontal rules as section dividers, nothing more

**Typography:**
- Body: 17px/1.7 line-height — prioritize readability
- Font: Geist (Vercel, free) or Newsreader (Google, free serif) — neither is Inter
- Headings: same typeface, tight tracking, no decorative display font
- Code excerpts: Geist Mono, inline

**Color:**
- Dark neutral: `#0c0c0c` background (not pitch black)
- Text: three levels — `#e5e5e5` primary, `#888` secondary, `#555` tertiary
- Zero accent color — or one: muted amber `#c9a227`, used only on links hover
- No gradients, no glows, no shadows

**Music/movies integration:**
- One section titled "Into lately" — a 2×2 or 3-column grid of album art thumbnails
  with artist + album name, no descriptions, no ratings. Pure curation.
- Four films as a clean text list: "Title (year) — one sentence why it matters"
- Both sections are static. Updated when you feel like it.

**What gets cut from the current site:**
- Boot screen animation
- Creature mascot
- Interactive terminal tab and CLI
- Command palette
- YouTube background music player
- Stats tab
- Music tab → replaced by static "Into lately" module

**Stack:** Astro 5 + plain CSS (no Tailwind). View Transitions for page changes.
Zero animation libraries. GitHub Pages static output.

**Reference sites:** leerob.com, kepano.com, Tom MacWright's site

**Build effort:** 1.5–2 weeks. The complexity is editorial (deciding what to keep
and how to write it), not technical.

**Best if:** You want a site that ages well, takes 10 minutes to update, and reads
as someone who has taste. Lowest maintenance.

---

### CONCEPT 2: "The Signal"
**Dark minimal with micro-craft interactions**

**Point of view:** The site is a showcase of craft through restraint. Dark,
near-monochrome. But every hover state, every spring animation, every spacing
decision is considered — visitors feel the quality before they consciously register
why. The one interactive element demonstrates engineering skill in the way a
well-written function does: precise, efficient, surprising.

**The ONE signature element:** Project cards that expand on click/hover into a
full-bleed case study panel — a smooth, spring-physics reveal that slides in from
the right, with screenshots, stack, and a two-paragraph writeup. The interaction
feels physical and earned. It's a technical flex that's also the right UX.

**Layout:**
- Two-zone layout: left column (~240px) holds name, status, nav; right column (~580px)
  holds content. Collapses to single column on mobile.
- Projects section: ~4 cards in a list, expand in place
- Small "Signal" module in footer: 3-column strip — listening / watching / building

**Typography:**
- Headings: Geist Sans (or Söhne) — clean, not Inter
- Body: same family, 16px/1.65
- A single serif moment: project titles in Instrument Serif, italic, to create
  contrast and warmth against the cold UI type

**Color:**
- Background: zinc-950 `#09090b`
- Text: zinc-300 / zinc-500 / zinc-700 hierarchy
- Accent: amber `#f59e0b` — or dusty rose `#e8927c` — used ONLY on the active
  project expand indicator and external link arrows
- No neon green. None.

**Music/movies integration:**
- "Signal" footer strip: "Listening" (Last.fm recently-scrobbled, fetched at build
  time — simpler auth than Spotify), "Watching" (Letterboxd RSS at build time),
  "Building" (manual). Gracefully degrades to static if APIs are down.
- This is a three-cell strip, ~72px tall. Not a tab. Not a section. A footnote.

**What gets cut:**
- Boot screen, creature mascot, full Music tab, Movies tab, Stats tab,
  terminal CLI, YouTube background player
- Command palette: kept as a hidden Easter egg (Cmd+K still works, but not
  advertised in the UI — it rewards exploration)

**Stack:** Vite + React 18 (fast HMR, React ecosystem for the expand interaction) +
Motion for the project expand spring animation + Tailwind v3 for layout/spacing +
custom CSS for type. Spotify/Last.fm API: tiny Vercel edge function (or build-time
fetch). Deploy to GitHub Pages via Actions.

**Reference sites:** rauno.me, paco.me, Linear's marketing site aesthetic

**Build effort:** 3–4 weeks. The project expand interaction alone takes a week to
get right. The API integration takes another few days.

**Best if:** You want the site to demonstrate engineering precision AND design taste,
and you enjoy the craft of getting one interaction perfect.

---

### CONCEPT 3: "The Garden"
**Living document / personal publishing**

**Point of view:** This is a personal website that happens to include work — not a
work website that includes personal stuff. Inspired by the digital garden movement.
Projects, film notes, music writing, short essays, and links all live at the same
level. The site is meant to grow over time and rewards returning visitors. It says:
this person has inner life that spills beyond their commit history.

**The ONE signature element:** The homepage as a visual index — a slightly irregular
tile grid of content across types. A recent project tile next to an album note next to
a three-sentence essay next to a film recommendation. Different tile sizes signal
recency or personal importance. It looks like a curated cork board; it's structured
HTML and pure CSS grid. This is the signature because it's genuinely rare: almost no
developer portfolio is organized this way.

**Layout:**
- Homepage: CSS grid, ~4-column, masonry-ish, tiles of two sizes (1×1 and 2×1)
  — pure CSS, no JS. Auto-flow with column spanning.
- Individual pages: clean single-column reading layout, ~680px, generous margins
- Section pages (`/listening`, `/watching`, `/building`): simple list of entries with
  dates, each entry has a short paragraph

**Typography:**
- Body: Newsreader (Google Fonts, free serif) — reads like a real publication, warm,
  editorial. 18px/1.75.
- UI chrome (nav, labels, metadata): Inter or system-ui in small caps or tracked
  uppercase at 11–12px. The contrast between reading type and UI type creates depth.
- This is the only concept that earns a serif — the writing density justifies it.

**Color:**
- Light mode as default (rare for dev sites — that's the point)
- Background: warm cream `#faf8f4`
- Text: near-black `#1a1a1a`
- Accent: muted forest green `#3d6b4f` (nothing like the neon terminal green)
- Dark mode toggle available, but light is the hero

**Music/movies integration:**
- Dedicated `/listening` and `/watching` pages — each entry is a short piece of
  writing. "I've listened to this album 40 times and here's why." That's more
  personality than any widget.
- The homepage grid includes tiles that link to recent entries on these pages.
- No live APIs needed. Updated by writing a new MDX file.

**What gets cut:**
- Boot screen, creature mascot, terminal CLI, command palette, YouTube player,
  stats tab. All of it. The "music" personality survives — but as writing, not
  as a feature.

**Stack:** Astro 5 + MDX content collections (perfect for this — typed entries, auto-
queried, static at build time) + plain CSS + View Transitions API. Zero JS in the
browser except optional dark-mode toggle. Fontsource for Newsreader. GitHub Pages.

**Reference sites:** Maggie Appleton's site (illustrated digital garden), kepano.com
(Obsidian CEO — media diet + writing), Tom MacWright (monthly media diet), personalsit.es
community

**Build effort:** 2–3 weeks to build the structure. Then ongoing content investment —
this concept is only as good as what you write in it. If you don't want to write,
don't pick this one.

**Best if:** You enjoy writing even short things, you want the site to feel alive,
and you think of music/movies as things worth saying something about — not just listing.

---

## Part E — Comparison

| | Concept 1: The Column | Concept 2: The Signal | Concept 3: The Garden |
|---|---|---|---|
| **Vibe** | Quiet confidence | Precision craft | Human range |
| **Signature** | /now page — manual, honest | Expand interaction — spring physics | Visual tile index — rare layout |
| **JS shipped** | ~0 KB | ~40 KB (Motion) | ~0 KB |
| **Music/movies** | Static "Into lately" grid | Small API-powered footer strip | Dedicated writing pages |
| **Writing required** | Minimal | Minimal | Yes — ongoing |
| **Stack** | Astro + plain CSS | Vite + React + Motion | Astro + MDX |
| **Build effort** | 1.5–2 wks | 3–4 wks | 2–3 wks |
| **Maintenance** | Very low | Low | Medium (content) |
| **Stands out because** | Most devs fill space; this removes it | The one interaction is technically precise | Almost no dev portfolio is organized as a garden |
| **Risks** | Could read as too sparse if projects aren't strong | Expand interaction must be near-perfect or it reads gimmicky | Requires content investment to not feel empty |
| **Best if you are** | Confident in your project work, want low-maintenance | Into animation/interaction craft, enjoy getting details right | A person with things to say; treat music/movies as subjects |

---

## Recommendation

**Concept 1** if you want something that's done in two weeks, ages well, and lets
your projects speak without ceremony.

**Concept 2** if you want the rebuild to be a flex in itself — the site demonstrates
your ability to design and engineer a precise interaction, and you'll enjoy polishing
the one spring animation until it's exactly right.

**Concept 3** if you're willing to write — even short things — and want a site that
keeps growing. The tile grid homepage is genuinely unusual in the dev-portfolio space
and will be memorable.

All three share: no boot screen, no mascot, no terminal CLI, no autoplaying audio,
no skill bars, no stats tab, and a complete rebuild on a modern stack.

---

*Report compiled June 2026. Reference site claims are based on training data through
August 2025; verify specific sites by visiting them as designs change.*
