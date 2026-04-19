import React, { useState, useEffect, useRef, useCallback } from 'react';
import CreatureMascot from '../terminal/CreatureMascot';

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
    <div className="tui-panel">
      <div className="tui-panel-title">whoami</div>

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
    </div>
  );
}

function SkillsSection() {
  return (
    <div className="tui-panel">
      <div className="tui-panel-title">skills</div>
      <div className="tui-skills-grid">
        {SKILLS.map(([name, color]) => (
          <span key={name} className="tui-skill-tag" style={{ '--tag-color': color }}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="tui-panel">
      <div className="tui-panel-title">projects</div>
      <div className="tui-project-list">
        {PROJECTS.map(p => (
          <div key={p.name} className="tui-project-row">
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
          </div>
        ))}
      </div>
    </div>
  );
}

function MusicSection() {
  return (
    <div className="tui-panel">
      <div className="tui-panel-title">music</div>
      <div className="tui-list">
        {ARTISTS.map(a => (
          <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="tui-list-row tui-link">
            <img src={a.img} alt={a.name} className="tui-thumb" />
            <span className="tui-list-num tui-dim">{a.n}</span>
            <span className="tui-list-name">{a.name}</span>
            <span className="tui-list-desc tui-dim">{a.desc}</span>
            <span className="tui-list-arrow tui-dim">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function MoviesSection() {
  return (
    <div className="tui-panel">
      <div className="tui-panel-title">movies</div>
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
    </div>
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
    <div className="tui-panel">
      <div className="tui-panel-title">stats</div>
      <div className="tui-kv-block">
        {stats.map(([k, v]) => (
          <div key={k} className="tui-kv-row">
            <span className="tui-kv-key tui-dim">{k}</span>
            <span className="tui-kv-val">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section registry ──────────────────────────────────────
const SECTIONS = [
  { id: 'about',    label: 'about',    Component: AboutSection    },
  { id: 'skills',   label: 'skills',   Component: SkillsSection   },
  { id: 'projects', label: 'projects', Component: ProjectsSection },
  { id: 'music',    label: 'music',    Component: MusicSection    },
  { id: 'movies',   label: 'movies',   Component: MoviesSection   },
  { id: 'stats',    label: 'stats',    Component: StatsSection    },
];

// ── Main TUI ──────────────────────────────────────────────
export default function TUI() {
  const [active, setActive]     = useState(0);
  const [creature, setCreature] = useState('idle');
  const creatureTimer = useRef(null);

  const goTo = useCallback((idx) => {
    setActive(idx);
    clearTimeout(creatureTimer.current);
    setCreature('celebrate');
    creatureTimer.current = setTimeout(() => setCreature('idle'), 1200);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowRight' || e.key === 'l') {
        setActive(a => {
          const n = (a + 1) % SECTIONS.length;
          clearTimeout(creatureTimer.current);
          setCreature('celebrate');
          creatureTimer.current = setTimeout(() => setCreature('idle'), 1200);
          return n;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        setActive(a => {
          const n = (a - 1 + SECTIONS.length) % SECTIONS.length;
          clearTimeout(creatureTimer.current);
          setCreature('celebrate');
          creatureTimer.current = setTimeout(() => setCreature('idle'), 1200);
          return n;
        });
      } else if (e.key >= '1' && e.key <= '6') {
        goTo(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goTo]);

  const { Component } = SECTIONS[active];

  return (
    <div className="tui-root">

      {/* Header */}
      <header className="tui-header">
        <span className="tui-header-name">rohith illuri</span>
        <span className="tui-header-sub">self-taught developer</span>
      </header>

      {/* Tab bar */}
      <nav className="tui-tabs" role="tablist">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === active}
            onClick={() => goTo(i)}
            className={`tui-tab${i === active ? ' tui-tab--active' : ''}`}
          >
            <span className="tui-tab-num">{i + 1}</span>
            {s.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="tui-content" role="tabpanel">
        <div key={active} className="tui-fade">
          <Component />
        </div>

        <CreatureMascot animationState={creature} />
      </main>

      {/* Status bar */}
      <footer className="tui-status">
        <span>← → navigate</span>
        <span className="tui-dim">1 – 6 jump to section</span>
        <span className="tui-status-right">rohith@portfolio</span>
      </footer>

    </div>
  );
}
