// ── Image → ASCII (canvas, browser only) ─────────────────
const ASCII_CHARS = [' ', '.', ':', '-', '=', '+', 'x', '%', '#', '@'];
const ART_W = 44;
const ART_H = 20;

async function imageToAscii(src) {
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width  = ART_W;
    canvas.height = ART_H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, ART_W, ART_H);
    const { data } = ctx.getImageData(0, 0, ART_W, ART_H);
    const rows = [];
    for (let y = 0; y < ART_H; y++) {
      let row = '';
      for (let x = 0; x < ART_W; x++) {
        const i = (y * ART_W + x) * 4;
        const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        row += ASCII_CHARS[Math.floor(lum * (ASCII_CHARS.length - 1))];
      }
      rows.push(row);
    }
    return rows;
  } catch {
    return ['  [image unavailable]'];
  }
}

// ── ASCII art creature for boot greeting ──────────────────
export const BOOT_TEXT =
`        ___
      _/   \\_
     / O   O \\
    |    ~    |
    |  (   )  |
     \\_______/
      /|   |\\
     / |   | \\

  rohith illuri
  self-taught developer
  ─────────────────────
  type 'help' to begin
`;

// ── Resume data ───────────────────────────────────────────
const MUSIC_ARTISTS = [
  { name: 'AC/DC',        desc: 'beer in one hand, blood in the other',  img: '/artists/ac-dc.jpg' },
  { name: 'The Beatles',  desc: 'the best band ever',                    img: '/artists/the-beatles.jpg' },
  { name: 'A.R. Rahman',  desc: 'musical maestro',                       img: '/artists/ar-rahman.jpg' },
  { name: 'Linkin Park',  desc: 'rip chester bennington',                img: '/artists/linkin-park.jpg' },
];

const MOVIES = [
  { name: 'Kill Bill: Vol. 1', year: 2003, desc: 'swords and revenge',         img: '/kill-bill-poster.jpg' },
  { name: 'The Dark Knight',   year: 2008, desc: 'epic superhero masterpiece', img: null },
  { name: 'Interstellar',      year: 2014, desc: 'space exploration epic',     img: '/artists/interstellar.jpeg' },
  { name: 'Pulp Fiction',      year: 1994, desc: 'tarantino classic',          img: null },
];

const SKILLS = [
  'JavaScript', 'TypeScript', 'React',      'Node.js',
  'Python',     'Java',       'HTML',        'CSS',
  'Tailwind',   'Git',        'Docker',      'AWS',
  'MongoDB',    'PostgreSQL', 'Express.js',  'GraphQL',
];

const FAKE_GIT_LOG = [
  { hash: 'e9f1c3a', date: '2026-05-30', msg: 'feat: agent-registry — ClaudeCodeAdapter + CodexAdapter with SKILL.md install routing' },
  { hash: 'b7d2e40', date: '2026-05-28', msg: 'feat: agent-registry — static JSON index + CI schema validation + sha256 checksums' },
  { hash: 'c5a8f12', date: '2026-05-24', msg: 'feat: agent-registry — cross-agent CLI (search/install/publish) scaffolding in Go' },
  { hash: 'a3f7b2e', date: '2024-12-01', msg: 'feat: add GSAP animations' },
  { hash: '9c1d8f4', date: '2024-11-20', msg: 'fix: mobile nav overflow' },
  { hash: '4e2a71b', date: '2024-11-15', msg: 'feat: YouTube background player' },
  { hash: '8b3c9d1', date: '2024-11-10', msg: 'refactor: extract hooks' },
  { hash: '1f0e5c7', date: '2024-10-28', msg: 'feat: deploy Crave to Vercel' },
  { hash: '6a4d2b8', date: '2024-10-15', msg: 'feat: cryptoapp live data' },
  { hash: '2c8f3e9', date: '2024-09-30', msg: 'docs: add project READMEs' },
  { hash: '7d1b0a5', date: '2024-09-12', msg: 'init: scaffold portfolio' },
];

// ── Line builder ──────────────────────────────────────────
const L  = (text, opts = {}) => ({ text, ...opts });
const ok = (lines, hint = 'celebrate') => ({ lines, creatureHint: hint });
const er = (text) => ({ lines: [L(text)], creatureHint: 'error' });

// ── Command runner ────────────────────────────────────────
export async function runCommand(raw, context = {}) {
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [], creatureHint: 'idle' };

  const parts = trimmed.split(/\s+/);
  const cmd   = parts[0].toLowerCase();
  const args  = parts.slice(1).join(' ').trim();

  switch (cmd) {

    case 'help':
      return ok([
        L('available commands', { green: true }),
        L(''),
        L('  about       who i am'),
        L('  skills      tech stack'),
        L('  projects    what i\'ve built'),
        L('  music       favorite artists  (loads ascii art)'),
        L('  movies      favorite films    (loads ascii art)'),
        L('  stats       personal records'),
        L(''),
        L('  ls          list directory'),
        L('  cat <file>  read a file'),
        L('  git log     commit history'),
        L('  git status  repo status'),
        L('  history     command history'),
        L('  date        current time'),
        L('  echo <txt>  echo text'),
        L('  clear       clear screen'),
        L(''),
        L('  wave · spin · dance · matrix', { dim: true }),
      ]);

    case 'about':
      return ok([
        L('rohith illuri', { green: true }),
        L('─────────────────────────────────────'),
        L(''),
        L('  self-taught developer.'),
        L('  passionate about physics, space, and building things.'),
        L('  currently obsessed with performance and clean UIs.'),
        L(''),
        L('  when not coding:'),
        L('    → deadlifting heavy things'),
        L('    → ac/dc at unreasonable volumes'),
        L('    → watching kill bill for the 12th time'),
        L(''),
        L('  github.com/rohithIlluri', { dim: true }),
      ]);

    case 'whoami':
      return ok([
        L('rohith illuri'),
        L('self-taught developer · builder · lifter', { dim: true }),
      ]);

    case 'skills':
      return ok([
        L('skills', { green: true }),
        L('─────────────────────────────────────'),
        L(''),
        ...SKILLS.map(s => L(`  ${s}`)),
      ]);

    case 'projects':
      return ok([
        L('projects', { green: true }),
        L('─────────────────────────────────────'),
        L(''),
        L('  agent-registry  cross-agent CLI registry  [WIP]', { green: true }),
        L('                  Go · MCP · SKILL.md · Sigstore'),
        L('                  type: cat agent-registry.txt for details'),
        L(''),
        L('  Crave           food marketplace'),
        L('                  React · Node · PostgreSQL'),
        L(''),
        L('  CryptoApp       live market dashboard'),
        L('                  React · WebSocket API'),
        L(''),
        L('  Toronto Proj    city data analysis'),
        L('                  Python · pandas'),
        L(''),
        L('  Nnets           neural network experiments'),
        L('                  Python'),
        L(''),
        L('  → github.com/rohithIlluri', { dim: true }),
      ]);

    case 'music': {
      const out = [
        L('music', { green: true }),
        L('─────────────────────────────────────'),
      ];
      for (const a of MUSIC_ARTISTS) {
        out.push(L(''));
        out.push(L(`  ${a.name}`, { green: true }));
        out.push(L(`  ${a.desc}`, { dim: true }));
        out.push(L(''));
        const rows = await imageToAscii(a.img);
        rows.forEach(r => out.push(L(`  ${r}`)));
        out.push(L(''));
      }
      return ok(out, 'celebrate');
    }

    case 'movies': {
      const out = [
        L('movies', { green: true }),
        L('─────────────────────────────────────'),
      ];
      for (const m of MOVIES) {
        out.push(L(''));
        out.push(L(`  ${m.name}  (${m.year})`, { green: true }));
        out.push(L(`  ${m.desc}`, { dim: true }));
        out.push(L(''));
        if (m.img) {
          const rows = await imageToAscii(m.img);
          rows.forEach(r => out.push(L(`  ${r}`)));
        }
        out.push(L(''));
      }
      return ok(out, 'celebrate');
    }

    case 'stats':
      return ok([
        L('stats', { green: true }),
        L('─────────────────────────────────────'),
        L(''),
        L('  deadlift pr      340 lbs'),
        L('  bench press      180 lbs'),
        L('  run              11.32 miles'),
        L('  typing (30s)     95 wpm'),
        L('  typing (15s)     103 wpm'),
        L(''),
        L('  coffee / day     3', { dim: true }),
        L('  bugs shipped     classified', { dim: true }),
      ]);

    case 'ls': {
      if (!args || args === '.') {
        return ok([
          L('about.txt   readme.txt   stats.json'),
          L('music/      movies/      projects/', { dim: true }),
        ]);
      }
      if (args === 'music/' || args === 'music')
        return ok(MUSIC_ARTISTS.map(a => L(a.name)));
      if (args === 'movies/' || args === 'movies')
        return ok(MOVIES.map(m => L(`${m.name} (${m.year})`)));
      if (args === 'projects/' || args === 'projects')
        return ok([L('agent-registry/   Crave/   CryptoApp/   toronto-project/   Nnets/')]);
      return er(`ls: ${args}: no such file or directory`);
    }

    case 'cat': {
      if (!args) return er('cat: missing operand');
      if (args === 'readme.txt') {
        return ok([
          L('rohith illuri — self-taught developer', { green: true }),
          L(''),
          L('  builds things with react, node, and whatever gets the job done.'),
          L('  projects: agent-registry · crave · cryptoapp · toronto-project · nnets'),
          L('  github:   github.com/rohithIlluri'),
          L('  license:  mit'),
        ]);
      }
      if (args === 'agent-registry.txt') {
        return ok([
          L('agent-registry', { green: true }),
          L('─────────────────────────────────────'),
          L(''),
          L('  free, cli-first, cross-agent registry for AI skills,'),
          L('  MCP servers, slash commands, subagents, and hooks.'),
          L(''),
          L('  status:  [WIP]  —  in active development'),
          L('  lang:    Go'),
          L('  arch:    static JSON index (git-repo/PR-based publish)'),
          L('           + per-agent adapters (ClaudeCode, Codex)'),
          L('           + optional Sigstore/cosign provenance'),
          L(''),
          L('  one artifact → installs into both Claude Code and'),
          L('  OpenAI Codex via adapter layer that detects ~/.claude'),
          L('  or ~/.codex and writes SKILL.md / MCP config to the'),
          L('  correct path and dialect (JSON vs TOML).'),
          L(''),
          L('  portable units:'),
          L('    → MCP servers   (cross-agent tool protocol)'),
          L('    → SKILL.md      (cross-agent procedural knowledge)'),
          L('    → slash-commands, subagents, hooks, plugin bundles'),
          L(''),
          L('  trust model:'),
          L('    community → verified publisher → curated/official'),
          L('    sha256 checksums · Sigstore bundles · mcp-scan CI'),
          L('    install-time permission disclosure before any write'),
          L(''),
          L('  hosting: $0/month — GitHub index + Cloudflare R2/Pages'),
          L(''),
          L('  inspired by: Homebrew taps · crates.io sparse index'),
          L('               Vercel skills.sh · MCP Registry v0.1'),
          L(''),
          L('  → github.com/rohithIlluri/agent-registry  (coming soon)', { dim: true }),
        ]);
      }
      if (args === 'about.txt') return runCommand('about', context);
      if (args === 'stats.json') return runCommand('stats', context);
      return er(`cat: ${args}: no such file or directory`);
    }

    case 'git': {
      const sub = parts[1];
      if (sub === 'log' && parts[2] === '--oneline')
        return ok(FAKE_GIT_LOG.map(c => L(`${c.hash}  ${c.msg}`)));
      if (sub === 'log') {
        return ok(
          FAKE_GIT_LOG.flatMap(c => [
            L(`commit ${c.hash}da3f9b2c1e4a7d8f0c3e`, { green: true }),
            L(`date   ${c.date}`, { dim: true }),
            L(`       ${c.msg}`),
            L(''),
          ])
        );
      }
      if (sub === 'status') {
        return ok([
          L('on branch main'),
          L("up to date with 'origin/main'"),
          L(''),
          L('nothing to commit, working tree clean', { green: true }),
        ]);
      }
      return er(`git: '${sub}' is not a git command`);
    }

    case 'history': {
      const hist = context.history || [];
      if (!hist.length) return ok([L('(empty)', { dim: true })]);
      return ok(hist.map((h, i) => L(`  ${String(i + 1).padStart(3)}  ${h}`, { dim: true })));
    }

    case 'date':
      return ok([L(new Date().toString())]);

    case 'echo':
      return ok([L(args || '')], 'wave');

    case 'pwd':
      return ok([L('/home/rohith')]);

    case 'man':
      if (args === 'rohith') {
        return ok([
          L('ROHITH(1)              User Commands              ROHITH(1)', { dim: true }),
          L(''),
          L('NAME', { green: true }),
          L('       rohith illuri — self-taught developer'),
          L(''),
          L('SYNOPSIS', { green: true }),
          L('       rohith [--coffee 3] [--music ac-dc] [--lift heavy]'),
          L(''),
          L('DESCRIPTION', { green: true }),
          L('       builds uis. writes clean code. ships things.'),
          L('       passionate about physics, space, and performance.'),
          L(''),
          L('BUGS', { green: true }),
          L('       talks too much about terminal aesthetics.', { dim: true }),
        ]);
      }
      return er(`no manual entry for '${args}'`);

    case 'sudo':
      return er('permission denied.');

    case 'exit':
      return ok([L("there is no escape.", { dim: true })], 'wave');

    case 'ping': {
      const host = args || 'localhost';
      return ok([
        L(`PING ${host}: 56 data bytes`),
        L(`64 bytes: icmp_seq=0 ttl=64 time=0.42 ms`),
        L(`64 bytes: icmp_seq=1 ttl=64 time=0.39 ms`),
        L(`64 bytes: icmp_seq=2 ttl=64 time=0.41 ms`),
        L(''),
        L(`4 packets, 0% loss`, { dim: true }),
      ]);
    }

    case 'matrix':
      return ok([
        L('wake up, neo...', { green: true }),
        L(''),
        L('01001000 01100101 01101100 01101100 01101111'),
        L('11001010 00110101 10100011 01010110 11100010'),
        L('00101010 11011001 01110100 10001101 00111011'),
        L('10110100 01001101 11010010 00101011 10011100'),
        L(''),
        L('the matrix has you.', { dim: true }),
      ], 'spin');

    case 'wave':
      return ok([L('👋')], 'wave');

    case 'spin':
      return ok([L('...', { dim: true })], 'spin');

    case 'dance':
      return ok([
        L('  \\o/   \\o/   \\o/'),
        L('   |     |     |'),
        L('  / \\   / \\   / \\'),
      ], 'celebrate');

    case 'clear':
      return { lines: null, creatureHint: 'spin' };

    default:
      return er(`command not found: ${cmd}   (try 'help')`);
  }
}

export const TAB_COMPLETIONS = [
  'help', 'about', 'whoami', 'skills', 'projects', 'music', 'movies', 'stats',
  'ls', 'cat readme.txt', 'cat about.txt', 'cat stats.json', 'cat agent-registry.txt',
  'git log', 'git log --oneline', 'git status',
  'history', 'date', 'echo ', 'pwd', 'man rohith',
  'ping ', 'wave', 'spin', 'dance', 'matrix', 'clear', 'exit',
  'ls music/', 'ls movies/', 'ls projects/',
];
