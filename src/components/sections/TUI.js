import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CreatureMascot from '../terminal/CreatureMascot';
import CommandPalette from '../ui/CommandPalette';
import HelpOverlay from '../ui/HelpOverlay';

// ── Data ─────────────────────────────────────────────────
const SOCIALS = [
  { label: 'github',   href: 'https://github.com/rohithIlluri' },
  { label: 'twitter',  href: 'https://twitter.com/rohithilluri' },
  { label: 'linkedin', href: 'https://linkedin.com/in/rohithilluri' },
  { label: 'discord',  href: '#' },
  { label: 'email',    href: 'mailto:rohithilluri@gmail.com' },
];

const SKILLS = [
  ['JavaScript', '#fbbf24'], ['TypeScript', '#60a5fa'], ['React',      '#22d3ee'],
  ['Node.js',    '#4ade80'], ['Python',     '#60a5fa'], ['Java',       '#fb923c'],
  ['HTML',       '#fb923c'], ['CSS',        '#c084fc'], ['Tailwind',   '#22d3ee'],
  ['Git',        '#f87171'], ['Docker',     '#60a5fa'], ['AWS',        '#fbbf24'],
  ['MongoDB',    '#4ade80'], ['PostgreSQL', '#60a5fa'], ['Express.js', '#4ade80'],
  ['GraphQL',    '#f472b6'],
];

const PROJECTS = [
  {
    name: 'Crave',
    desc: 'Food marketplace',
    tech: 'React · Node.js · PostgreSQL',
    github: 'https://github.com/rohithIlluri/Crave',
    live: null,
  },
  {
    name: 'CryptoApp',
    desc: 'Live market dashboard',
    tech: 'React · WebSocket API',
    github: 'https://github.com/rohithIlluri/cryptoapp',
    live: null,
  },
  {
    name: 'Toronto Project',
    desc: 'Community platform',
    tech: 'Full-stack',
    github: 'https://github.com/rohithIlluri',
    live: null,
  },
  {
    name: 'Nnets',
    desc: 'Neural network experiments',
    tech: 'Python',
    github: 'https://github.com/rohithIlluri/Nnets',
    live: null,
  },
];

const ARTISTS = [
  { n: '01', name: 'AC/DC',       desc: 'beer in one hand, blood in the other',  url: 'https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un', img: '/artists/ac-dc.jpg' },
  { n: '02', name: 'The Beatles', desc: 'the best band ever',                    url: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2', img: '/artists/the-beatles.jpg' },
  { n: '03', name: 'A.R. Rahman', desc: 'musical maestro',                       url: 'https://open.spotify.com/artist/1mYsTxnqsietFxj1OgoGbG', img: '/artists/ar-rahman.jpg' },
  { n: '04', name: 'Linkin Park', desc: 'rip chester bennington',                url: 'https://open.spotify.com/artist/6XyY86QOPPrYVGvF9ch6wz', img: '/artists/linkin-park.jpg' },
];

const MOVIES = [
  { n: '01', name: 'Kill Bill: Vol. 1', year: 2003, desc: 'swords and revenge',         url: 'https://www.themoviedb.org/movie/24' },
  { n: '02', name: 'The Dark Knight',   year: 2008, desc: 'epic superhero masterpiece', url: 'https://www.themoviedb.org/movie/155' },
  { n: '03', name: 'Interstellar',      year: 2014, desc: 'space exploration epic',     url: 'https://www.themoviedb.org/movie/157336' },
  { n: '04', name: 'Pulp Fiction',      year: 1994, desc: 'tarantino classic',          url: 'https://www.themoviedb.org/movie/680' },
];

// ── Sections ─────────────────────────────────────────────

function AboutSection() {
  return (
    <section className="tui-panel" aria-labelledby="sec-about">
      <h2 id="sec-about" className="tui-panel-title">whoami</h2>

      <p className="tui-body-line" style={{ marginBottom: '1.2rem' }}>
        self-taught developer.<br />
        passionate about physics, space, and building things.<br />
        currently obsessed with performance and clean UIs.
      </p>

      <p className="tui-body-line tui-dim" style={{ marginBottom: '1.2rem' }}>
        when not at the keyboard:<br />
        &nbsp;&nbsp;→ deadlifting heavy things<br />
        &nbsp;&nbsp;→ ac/dc at unreasonable volumes<br />
        &nbsp;&nbsp;→ watching kill bill for the 12th time
      </p>

      <div className="tui-kv-block">
        {SOCIALS.map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="tui-kv-row tui-link">
            <span className="tui-kv-key">{s.label}</span>
            <span className="tui-kv-val tui-dim">{s.href.replace(/^https?:\/\//, '')}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function SkillsSection() {
  return (
    <section className="tui-panel" aria-labelledby="sec-skills">
      <h2 id="sec-skills" className="tui-panel-title">skills</h2>
      <div className="tui-skills-grid">
        {SKILLS.map(([name, color]) => (
          <span key={name} className="tui-skill-tag" style={{ '--tag-color': color }}>
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className="tui-panel" aria-labelledby="sec-projects">
      <h2 id="sec-projects" className="tui-panel-title">projects</h2>
      <div className="tui-project-list">
        {PROJECTS.map(p => (
          <article key={p.name} className="tui-project-row">
            <div className="tui-project-header">
              <span className="tui-project-name">{p.name}</span>
              <span className="tui-dim tui-project-desc">{p.desc}</span>
            </div>
            <div className="tui-project-tech tui-dim">{p.tech}</div>
            <div className="tui-project-links">
              {p.github && (
                <a href={p.github} target="_blank" rel="noreferrer" className="tui-btn">
                  github ↗
                </a>
              )}
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="tui-btn">
                  live ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MusicSection() {
  return (
    <section className="tui-panel" aria-labelledby="sec-music">
      <h2 id="sec-music" className="tui-panel-title">music</h2>
      <div className="tui-list">
        {ARTISTS.map(a => (
          <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="tui-list-row tui-link">
            <img src={a.img} alt="" loading="lazy" decoding="async" className="tui-thumb" />
            <span className="tui-list-num tui-dim">{a.n}</span>
            <span className="tui-list-name">{a.name}</span>
            <span className="tui-list-desc tui-dim">{a.desc}</span>
            <span className="tui-list-arrow tui-dim">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function MoviesSection() {
  return (
    <section className="tui-panel" aria-labelledby="sec-movies">
      <h2 id="sec-movies" className="tui-panel-title">movies</h2>
      <div className="tui-list">
        {MOVIES.map(m => (
          <a key={m.name} href={m.url} target="_blank" rel="noreferrer" className="tui-list-row tui-link">
            <span className="tui-list-num tui-dim">{m.n}</span>
            <span className="tui-list-name">{m.name}</span>
            <span className="tui-list-year tui-dim">({m.year})</span>
            <span className="tui-list-desc tui-dim">{m.desc}</span>
            <span className="tui-list-arrow tui-dim">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    ['deadlift pr',    '340 lbs'],
    ['bench press',    '180 lbs'],
    ['run',            '11.32 miles'],
    ['typing (30s)',   '95 wpm'],
    ['typing (15s)',   '103 wpm'],
    ['coffee / day',   '3'],
  ];
  return (
    <section className="tui-panel" aria-labelledby="sec-stats">
      <h2 id="sec-stats" className="tui-panel-title">stats</h2>
      <div className="tui-kv-block">
        {stats.map(([k, v]) => (
          <div key={k} className="tui-kv-row">
            <span className="tui-kv-key tui-dim">{k}</span>
            <span className="tui-kv-val">{v}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section registry ──────────────────────────────────────
const SECTIONS = [
  { id: 'about',    label: 'about',    Component: AboutSection,    icon: '◉' },
  { id: 'skills',   label: 'skills',   Component: SkillsSection,   icon: '◇' },
  { id: 'projects', label: 'projects', Component: ProjectsSection, icon: '▸' },
  { id: 'music',    label: 'music',    Component: MusicSection,    icon: '♪' },
  { id: 'movies',   label: 'movies',   Component: MoviesSection,   icon: '▶' },
  { id: 'stats',    label: 'stats',    Component: StatsSection,    icon: '▦' },
];

// View Transitions API helper — gracefully no-ops where unsupported
const startViewTransition = (cb) => {
  if (typeof document !== 'undefined' && document.startViewTransition) {
    document.startViewTransition(cb);
  } else {
    cb();
  }
};

// ── Main TUI ──────────────────────────────────────────────
export default function TUI() {
  const [active, setActive]     = useState(0);
  const [creature, setCreature] = useState('idle');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const creatureTimer = useRef(null);
  const contentRef = useRef(null);

  const triggerCelebrate = useCallback(() => {
    clearTimeout(creatureTimer.current);
    setCreature('celebrate');
    creatureTimer.current = setTimeout(() => setCreature('idle'), 1200);
  }, []);

  const goTo = useCallback((idx) => {
    if (idx === active || idx < 0 || idx >= SECTIONS.length) return;
    startViewTransition(() => setActive(idx));
    triggerCelebrate();
  }, [active, triggerCelebrate]);

  const goToId = useCallback((id) => {
    const idx = SECTIONS.findIndex(s => s.id === id);
    if (idx >= 0) goTo(idx);
  }, [goTo]);

  // Hash routing — sync URL ↔ active tab
  useEffect(() => {
    const h = (window.location.hash || '').replace('#', '');
    const idx = SECTIONS.findIndex(s => s.id === h);
    if (idx >= 0) setActive(idx);

    const onHash = () => {
      const id = (window.location.hash || '').replace('#', '');
      const i = SECTIONS.findIndex(s => s.id === id);
      if (i >= 0) setActive(i);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const id = SECTIONS[active]?.id;
    if (id) {
      const newHash = `#${id}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  }, [active]);

  // Reading progress for the active section
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [active]);

  // Reset scroll & progress on tab change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setProgress(0);
  }, [active]);

  // Keyboard shortcuts
  useEffect(() => {
    let pendingG = false;
    let gTimer = null;

    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Cmd/Ctrl + K → command palette
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen(o => !o);
        return;
      }

      if (paletteOpen || helpOpen) return;

      if (e.key === '/') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setHelpOpen(o => !o);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'l') {
        goTo((active + 1) % SECTIONS.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        // 'g' chord handling for vim-style 'gh'
        if (pendingG) {
          pendingG = false;
          clearTimeout(gTimer);
          goToId('about');
          return;
        }
        goTo((active - 1 + SECTIONS.length) % SECTIONS.length);
      } else if (e.key >= '1' && e.key <= '6') {
        goTo(parseInt(e.key, 10) - 1);
      } else if (e.key === 'g') {
        pendingG = true;
        clearTimeout(gTimer);
        gTimer = setTimeout(() => { pendingG = false; }, 600);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      clearTimeout(gTimer);
    };
  }, [active, goTo, goToId, paletteOpen, helpOpen]);

  // Build command palette commands
  const commands = useMemo(() => {
    const sectionCmds = SECTIONS.map((s, i) => ({
      id: `go-${s.id}`,
      label: `Go to ${s.label}`,
      hint: `section ${i + 1}`,
      icon: s.icon,
      shortcut: String(i + 1),
      keywords: [s.id, s.label, 'navigate', 'go'],
      run: () => goTo(i),
    }));

    const linkCmds = SOCIALS.map(s => ({
      id: `open-${s.label}`,
      label: `Open ${s.label}`,
      hint: s.href.replace(/^https?:\/\//, '').replace(/^mailto:/, ''),
      icon: '↗',
      keywords: ['open', 'link', s.label, 'social'],
      run: () => window.open(s.href, '_blank', 'noreferrer'),
    }));

    const utilityCmds = [
      {
        id: 'show-help',
        label: 'Show keyboard shortcuts',
        icon: '?',
        shortcut: '?',
        keywords: ['help', 'shortcuts', 'keys'],
        run: () => setHelpOpen(true),
      },
      {
        id: 'view-source',
        label: 'View source on GitHub',
        icon: '⌘',
        keywords: ['source', 'repo', 'github', 'code'],
        run: () => window.open('https://github.com/rohithIlluri/rohithilluri.github.io', '_blank', 'noreferrer'),
      },
      {
        id: 'copy-email',
        label: 'Copy email address',
        icon: '@',
        hint: 'rohithilluri@gmail.com',
        keywords: ['email', 'copy', 'contact'],
        run: () => navigator.clipboard?.writeText('rohithilluri@gmail.com').catch(() => {}),
      },
    ];

    return [...sectionCmds, ...utilityCmds, ...linkCmds];
  }, [goTo]);

  const { Component } = SECTIONS[active];
  const activeId = SECTIONS[active].id;

  return (
    <div className="tui-root">

      {/* Header */}
      <header className="tui-header">
        <div className="tui-header-left">
          <span className="tui-header-dot" aria-hidden="true" />
          <span className="tui-header-name">rohith illuri</span>
          <span className="tui-header-sub tui-dim">· self-taught dev</span>
        </div>
        <div className="tui-header-right">
          <button
            className="tui-cmdk-trigger"
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
          >
            <span className="tui-dim">search…</span>
            <kbd className="cmdk-kbd">⌘K</kbd>
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <nav className="tui-tabs" role="tablist" aria-label="Sections">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            id={`tab-${s.id}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`panel-${s.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => goTo(i)}
            className={`tui-tab${i === active ? ' tui-tab--active' : ''}`}
          >
            <span className="tui-tab-num" aria-hidden="true">{i + 1}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {/* Reading progress */}
      <div
        className="tui-progress"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="tui-progress-bar" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Content */}
      <main
        id="main"
        ref={contentRef}
        className="tui-content"
        role="tabpanel"
        aria-labelledby={`tab-${activeId}`}
        data-panel={`panel-${activeId}`}
        style={{ viewTransitionName: 'tui-panel' }}
      >
        <div key={active} className="tui-fade">
          <Component />
        </div>

        <CreatureMascot animationState={creature} />
      </main>

      {/* Status bar */}
      <footer className="tui-status">
        <span><kbd className="cmdk-kbd">←</kbd><kbd className="cmdk-kbd">→</kbd> navigate</span>
        <span className="tui-dim"><kbd className="cmdk-kbd">⌘K</kbd> palette</span>
        <span className="tui-dim"><kbd className="cmdk-kbd">?</kbd> help</span>
        <span className="tui-status-right">
          <span className="tui-status-pulse" aria-hidden="true" />
          rohith@portfolio
        </span>
      </footer>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />
      <HelpOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
