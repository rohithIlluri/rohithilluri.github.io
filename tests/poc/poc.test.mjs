/**
 * Test suite for the portfolio site (site/index.html).
 *
 * Run:  npm run test:poc
 *
 * Static checks parse the raw HTML/CSS; behavioral checks execute the
 * page's inline script inside jsdom. Network checks verify the painting
 * URLs resolve, and skip automatically when the environment's proxy
 * blocks external hosts.
 */
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(__dirname, '..', '..', 'site', 'index.html');
const html = readFileSync(HTML_PATH, 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = styleMatch ? styleMatch[1] : '';

/** Static DOM (scripts NOT executed) — what a JS-disabled preview sees. */
const staticDom = new JSDOM(html);
const sdoc = staticDom.window.document;

describe('document basics', () => {
  test('has a title and description', () => {
    assert.equal(sdoc.title, 'Rohith Illuri — Portfolio');
    const desc = sdoc.querySelector('meta[name="description"]');
    assert.ok(desc?.getAttribute('content')?.length > 0);
  });

  test('declares lang and viewport', () => {
    assert.equal(sdoc.documentElement.getAttribute('lang'), 'en');
    assert.ok(sdoc.querySelector('meta[name="viewport"]'));
  });

  test('name appears exactly once as a heading, with no studio-style branding', () => {
    assert.equal(sdoc.querySelectorAll('h1').length, 1);
    const body = sdoc.body.textContent;
    assert.ok(!/presents/i.test(body), 'found "presents" branding');
    assert.ok(!/pictures/i.test(body), 'found "Pictures" branding');
  });

  test('all section naming is English (no Latin section titles)', () => {
    const heads = [...sdoc.querySelectorAll('h2')].map((h) => h.textContent.trim());
    assert.deepEqual(heads, ['THE WORKS', 'THE CRAFT', 'THE MUSES', 'THE LETTER']);
    for (const h of heads) assert.match(h, /^[A-Z .&]+$/);
  });
});

describe('no-JS resilience (the bug that bit us once)', () => {
  /**
   * Every CSS rule that sets opacity: 0 must have .js in its selector,
   * except hover affordances that a CSS-only :hover rule restores.
   */
  const CSS_ONLY_HOVER_AFFORDANCES = ['.opus h3 .go'];
  function hidingRulesWithoutJsGate(cssText) {
    const rules = cssText.match(/[^{}]+\{[^}]*\}/g) ?? [];
    return rules.filter((rule) => {
      const [selector, body] = rule.split('{');
      const sel = selector.trim();
      if (CSS_ONLY_HOVER_AFFORDANCES.includes(sel)) {
        // must actually have a :hover rule that reveals it
        const hoverReveals = rules.some(
          (r) => r.includes(':hover') && r.includes(sel.split(' ').pop()) && /opacity:\s*1/.test(r)
        );
        return !hoverReveals;
      }
      return /opacity:\s*0(?![.\d])/.test(body) && !sel.includes('.js');
    });
  }

  test('reveal hiding is gated behind html.js — never bare', () => {
    assert.ok(css.includes('.js .reveal'), 'expected .js-gated reveal rule');
    const offenders = hidingRulesWithoutJsGate(css).filter((r) => r.includes('.reveal'));
    assert.deepEqual(offenders, [], 'found a .reveal rule that hides content without .js gating');
  });

  test('without scripts, no element is opacity-hidden via class state', () => {
    assert.ok(!sdoc.documentElement.className.includes('js'));
    // Every .reveal element renders: the hiding selector requires .js on <html>.
    assert.ok(sdoc.querySelectorAll('.reveal').length > 10);
  });

  test('no rule anywhere hides content without .js gating', () => {
    assert.deepEqual(
      hidingRulesWithoutJsGate(css).map((r) => r.split('{')[0].trim()),
      [],
      'rules hide content even when JS never runs'
    );
  });
});

describe('script behavior (jsdom, scripts executed)', () => {
  let dom, doc, win;

  before(async () => {
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      resources: undefined, // do not fetch external resources
      url: 'https://rohithilluri.github.io/poc/',
    });
    win = dom.window;
    doc = win.document;
    // jsdom fires DOMContentLoaded/load asynchronously; the inline script
    // is at end of body and runs synchronously during parse.
    await new Promise((r) => setTimeout(r, 50));
  });

  test('html gains the js class from the head script', () => {
    assert.ok(doc.documentElement.className.includes('js'));
  });

  test('jsdom has no IntersectionObserver, so the fallback reveals everything', () => {
    const hidden = [...doc.querySelectorAll('.reveal, .loc-reveal')].filter(
      (el) => !el.classList.contains('visible')
    );
    assert.equal(hidden.length, 0, `${hidden.length} reveal elements never became visible`);
  });

  test('script tolerates missing matchMedia/IntersectionObserver without throwing', () => {
    // If the script had thrown, the js class would exist but reveals would not.
    assert.ok(doc.querySelector('.reveal.visible'));
  });

  test('name text content is preserved after any letter-splitting', () => {
    const h1 = doc.getElementById('the-name');
    assert.equal(h1.textContent.replace(/\s/g, ''), 'ROHITH·ILLURI');
  });

  test('sound toggle hides itself when WebAudio is unavailable (jsdom)', () => {
    const btn = doc.getElementById('sound-toggle');
    assert.ok(btn, 'sound toggle missing from DOM');
    assert.equal(btn.style.display, 'none', 'button should hide without AudioContext');
  });
});

describe('soundtrack', () => {
  test('toggle is a real button, off by default, with an accessible label', () => {
    const btn = sdoc.getElementById('sound-toggle');
    assert.equal(btn.tagName, 'BUTTON');
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    assert.ok(btn.getAttribute('aria-label'));
    assert.match(btn.textContent, /OFF/);
  });

  test('no audio element, no autoplay — sound is generative and gesture-gated', () => {
    assert.equal(sdoc.querySelectorAll('audio, video').length, 0);
    assert.ok(!html.includes('autoplay'), 'autoplay attribute found');
    // Tone.js wraps AudioContext internally; gesture gate is Tone.start()
    assert.ok(html.includes('Tone.start') || html.includes('AudioContext'), 'WebAudio engine missing');
  });
});

describe('navigation', () => {
  test('every nav link targets an existing section id', () => {
    const links = [...sdoc.querySelectorAll('nav.frieze a')];
    assert.equal(links.length, 4);
    for (const a of links) {
      const id = a.getAttribute('href').replace('#', '');
      assert.ok(sdoc.getElementById(id), `nav target #${id} missing`);
    }
  });

  test('skip link exists and targets real content', () => {
    const skip = sdoc.querySelector('.skip-link');
    assert.ok(skip);
    assert.ok(sdoc.getElementById(skip.getAttribute('href').replace('#', '')));
  });
});

describe('living paintings', () => {
  const imgs = [...sdoc.querySelectorAll('.fresco img')];

  test('there are four section frescoes plus the header fresco', () => {
    assert.equal(imgs.length, 5);
  });

  test('every painting has a fallback URL and an empty (decorative) alt', () => {
    for (const img of imgs) {
      assert.ok(img.getAttribute('data-fallback'), 'missing data-fallback');
      assert.equal(img.getAttribute('alt'), '', 'decorative images should have alt=""');
      assert.ok(img.getAttribute('referrerpolicy'), 'missing referrerpolicy');
    }
  });

  test('every fresco has a painted underpaint fallback layer', () => {
    for (const fresco of sdoc.querySelectorAll('.fresco')) {
      assert.ok(fresco.querySelector('.underpaint'), 'fresco missing underpaint');
      assert.ok(fresco.querySelector('.glaze'), 'fresco missing readability glaze');
    }
  });

  test('only the header painting loads eagerly; the rest are lazy', () => {
    const eager = imgs.filter((i) => i.getAttribute('loading') === 'eager');
    const lazy = imgs.filter((i) => i.getAttribute('loading') === 'lazy');
    assert.equal(eager.length, 1);
    assert.equal(lazy.length, 4);
  });

  test('each fresco section carries a provenance caption', () => {
    assert.equal(sdoc.querySelectorAll('.provenance').length, 5);
  });
});

describe('motion posters', () => {
  test('six posters: three films, three sounds', () => {
    const posters = [...sdoc.querySelectorAll('.poster')];
    assert.equal(posters.length, 6);
    const ribbons = posters.map((p) => p.querySelector('.ribbon').textContent.trim());
    assert.equal(ribbons.filter((r) => r === 'FILM').length, 3);
    assert.equal(ribbons.filter((r) => r === 'SOUND').length, 3);
  });

  test('every poster has watermark initial, title, epitaph, and tilt handle', () => {
    for (const p of sdoc.querySelectorAll('.poster')) {
      assert.ok(p.querySelector('.watermark')?.textContent.trim());
      assert.ok(p.querySelector('h3')?.textContent.trim());
      assert.ok(p.querySelector('p')?.textContent.trim());
      assert.ok(p.hasAttribute('data-tilt'));
    }
  });

  test('each poster has a distinct palette class', () => {
    const classes = [...sdoc.querySelectorAll('.poster')].map(
      (p) => [...p.classList].find((c) => c.startsWith('poster-'))
    );
    assert.equal(new Set(classes).size, 6, 'poster palettes are not unique');
  });

  test('every poster carries artwork with a readability scrim, lazy and decorative', () => {
    for (const p of sdoc.querySelectorAll('.poster')) {
      const art = p.querySelector('img.art');
      assert.ok(art, 'poster missing img.art');
      assert.equal(art.getAttribute('alt'), '');
      assert.equal(art.getAttribute('loading'), 'lazy');
      assert.ok(p.querySelector('.scrim'), 'poster missing scrim');
    }
  });

  test('local card images exist on disk', () => {
    const pocDir = join(__dirname, '..', '..', 'site');
    let localCount = 0;
    for (const art of sdoc.querySelectorAll('.poster img.art')) {
      const src = art.getAttribute('src');
      if (/^https?:/.test(src)) continue;
      localCount++;
      assert.ok(existsSync(join(pocDir, src)), `missing local image: ${src}`);
    }
    assert.ok(localCount >= 5, 'expected at least five local card images');
  });
});

describe('style discipline', () => {
  test('global link reset: no default blue/underline anywhere', () => {
    assert.match(css, /a\s*\{\s*color:\s*inherit;\s*text-decoration:\s*none;\s*\}/);
  });

  test('prefers-reduced-motion disables grain-level effects', () => {
    const rm = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n  \}/);
    assert.ok(rm, 'missing reduced-motion block');
    assert.ok(rm[1].includes('#dust'), 'gold dust not disabled');
    assert.ok(rm[1].includes('animation: none'), 'animations not disabled');
  });

  test('horizontal overflow is locked down', () => {
    assert.match(css, /body\s*\{[^}]*overflow-x:\s*hidden/);
  });

  test('aged patina and manuscript frame are present', () => {
    assert.ok(sdoc.querySelector('.patina'), 'missing patina overlay');
    assert.ok(sdoc.querySelector('.frame'), 'missing manuscript frame');
    assert.match(css, /\.patina\s*\{[^}]*pointer-events:\s*none/, 'patina must not block taps');
    assert.match(css, /\.frame\s*\{[^}]*pointer-events:\s*none/, 'frame must not block taps');
  });

  test('inline SVG data URIs are well-formed', () => {
    const uris = css.match(/url\("data:image\/svg\+xml,([^"]+)"\)/g) ?? [];
    assert.ok(uris.length >= 2, 'expected marble + meander + grain SVGs');
    for (const u of uris) {
      const encoded = u.slice('url("data:image/svg+xml,'.length, -2);
      const decoded = decodeURIComponent(encoded);
      assert.ok(decoded.includes('<svg'), 'data URI does not decode to SVG');
    }
  });
});

describe('performance budget', () => {
  test('painting thumbnails are capped at 1000px wide', () => {
    for (const img of sdoc.querySelectorAll('.fresco img')) {
      const urls = [img.getAttribute('src'), ...(img.getAttribute('data-fallback') ?? '').split('|')]
        .filter(Boolean);
      for (const url of urls) {
        const width = Number(new URL(url).searchParams.get('width'));
        assert.ok(width > 0 && width <= 1000, `painting requested at ${width}px: ${url}`);
      }
    }
  });

  test('fallback chains and captions stay in lockstep', () => {
    const withCaptions = [...sdoc.querySelectorAll('.fresco img[data-captions]')];
    assert.ok(withCaptions.length >= 2, 'craft and letter paintings should carry captions');
    for (const img of withCaptions) {
      const candidates = 1 + img.getAttribute('data-fallback').split('|').filter(Boolean).length;
      const caps = img.getAttribute('data-captions').split('|').filter(Boolean).length;
      assert.equal(caps, candidates, 'caption count must match candidate count');
    }
  });

  test('exactly one image is high-priority; fonts swap; hosts are preconnected', () => {
    assert.equal(sdoc.querySelectorAll('img[fetchpriority="high"]').length, 1);
    const fontLink = sdoc.querySelector('link[href*="fonts.googleapis.com/css2"]');
    assert.match(fontLink.getAttribute('href'), /display=swap/);
    const preconnects = [...sdoc.querySelectorAll('link[rel="preconnect"]')].map((l) =>
      l.getAttribute('href')
    );
    assert.ok(preconnects.includes('https://upload.wikimedia.org'), 'missing painting-host preconnect');
  });

  test('no blend modes or backdrop filters (jank on low-end WebViews)', () => {
    assert.ok(!css.includes('mix-blend-mode: luminosity'), 'luminosity blend on large layers');
    assert.ok(!css.includes('backdrop-filter'), 'backdrop-filter present');
  });
});

describe('contact', () => {
  test('email links point at the right address', () => {
    const mails = [...sdoc.querySelectorAll('a[href^="mailto:"]')];
    assert.ok(mails.length >= 1);
    for (const m of mails) {
      assert.equal(m.getAttribute('href'), 'mailto:rohith.illuri@gmail.com');
    }
  });

  test('external links open safely', () => {
    for (const a of sdoc.querySelectorAll('a[target="_blank"]')) {
      assert.ok(a.getAttribute('rel')?.includes('noopener'), `${a.href} missing rel=noopener`);
    }
  });

  test('the seal is an envelope, not an abstract glyph', () => {
    const seal = sdoc.querySelector('.seal');
    assert.ok(seal.querySelector('svg'), 'seal should contain an envelope SVG');
    assert.ok(!seal.textContent.includes('✦'), 'misleading star glyph still present');
    assert.equal(seal.getAttribute('href'), 'mailto:rohith.illuri@gmail.com');
  });
});

describe('painting URLs resolve (network)', () => {
  const urls = [...sdoc.querySelectorAll('.fresco img, .poster img.art')]
    .flatMap((img) => [
      img.getAttribute('src'),
      ...(img.getAttribute('data-fallback') ?? '').split('|'),
    ])
    .filter((u) => u && /^https?:/.test(u));

  for (const url of urls) {
    test(`reachable: ${decodeURIComponent(url.slice(0, 90))}…`, async (t) => {
      let res;
      try {
        res = await fetch(url, {
          method: 'HEAD',
          redirect: 'follow',
          headers: { 'User-Agent': 'rohithilluri.github.io link-check (rohith.illuri@gmail.com)' },
        });
      } catch {
        t.skip('network unavailable in this environment');
        return;
      }
      if (res.status === 403 && (res.headers.get('x-deny-reason') ?? '').includes('host_not_allowed')) {
        t.skip('environment proxy blocks this host — verify in CI/browser');
        return;
      }
      // Rate limiting and server hiccups are inconclusive, not broken links.
      // The page walks its fallback chain at runtime either way; only a
      // definitive "this file does not exist" should fail the build.
      if (res.status === 429 || res.status === 403 || res.status >= 500) {
        t.skip(`inconclusive HTTP ${res.status} — not a missing file`);
        return;
      }
      await new Promise((r) => setTimeout(r, 400)); // be polite to the host
      assert.notEqual(res.status, 404, `painting URL 404s: ${url}`);
      assert.notEqual(res.status, 410, `painting URL is gone: ${url}`);
      assert.ok(res.ok, `HTTP ${res.status} for painting URL`);
    });
  }
});
