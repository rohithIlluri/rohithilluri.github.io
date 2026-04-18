export const BOOT_TEXT = `
  ____       _     _ _   _
 |  _ \\ ___ | |__ (_) |_| |__
 | |_) / _ \\| '_ \\| | __| '_ \\
 |  _ < (_) | | | | | |_| | | |
 |_| \\_\\___/|_| |_|_|\\__|_| |_|

 rohith illuri — self-taught developer
 portfolio v2.0.0 — type 'help' to get started
 ─────────────────────────────────────────────
`.trimStart();

const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'Python', 'Rust',
  'React', 'Node.js', 'GraphQL', 'Docker',
  'PostgreSQL', 'Redis', 'AWS', 'Git',
  'HTML', 'CSS', 'Tailwind', 'Linux',
];

const FAKE_GIT_LOG = [
  { hash: 'a3f7b2e', date: '2024-12-01', msg: 'feat: add GSAP animations to hero section' },
  { hash: '9c1d8f4', date: '2024-11-20', msg: 'fix: mobile nav overflow on small screens' },
  { hash: '4e2a71b', date: '2024-11-15', msg: 'feat: add YouTube background music player' },
  { hash: '8b3c9d1', date: '2024-11-10', msg: 'refactor: extract hooks into separate files' },
  { hash: '1f0e5c7', date: '2024-10-28', msg: 'feat: deploy Crave food marketplace to Vercel' },
  { hash: '6a4d2b8', date: '2024-10-15', msg: 'feat: cryptoapp live market data integration' },
  { hash: '2c8f3e9', date: '2024-09-30', msg: 'docs: add project READMEs and screenshots' },
  { hash: '7d1b0a5', date: '2024-09-12', msg: 'init: scaffold portfolio with React + Tailwind' },
];

const FAKE_FS = {
  'about.txt': [
    { text: 'Name:     Rohith Illuri', color: 'var(--term-text)' },
    { text: 'Role:     Self-Taught Developer', color: 'var(--term-text)' },
    { text: 'Based:    Earth (usually online)', color: 'var(--term-text)' },
    { text: '', color: '' },
    { text: 'I build things with React, Node, and whatever else gets the', color: 'var(--term-dim)' },
    { text: 'job done. Currently obsessed with performance and clean UIs.', color: 'var(--term-dim)' },
    { text: '', color: '' },
    { text: 'When not coding:', color: 'var(--term-text)' },
    { text: '  → Deadlifting heavy things', color: 'var(--term-cyan)' },
    { text: '  → Listening to AC/DC at unreasonable volumes', color: 'var(--term-cyan)' },
    { text: '  → Watching Kill Bill for the 12th time', color: 'var(--term-cyan)' },
  ],
  'readme.txt': [
    { text: '╔══════════════════════════════════════════════════╗', color: 'var(--term-border-color, #2a2a2a)' },
    { text: '║           ROHITH ILLURI — PORTFOLIO              ║', color: 'var(--term-purple)' },
    { text: '╚══════════════════════════════════════════════════╝', color: 'var(--term-border-color, #2a2a2a)' },
    { text: '', color: '' },
    { text: 'A developer who ships things.', color: 'var(--term-text)' },
    { text: '', color: '' },
    { text: 'PROJECTS', color: 'var(--term-yellow)' },
    { text: '  Crave        — food marketplace built with React + Node', color: 'var(--term-text)' },
    { text: '  CryptoApp    — live crypto market data dashboard', color: 'var(--term-text)' },
    { text: '  Toronto Proj — community project (details inside)', color: 'var(--term-text)' },
    { text: '  Nnets        — neural network experiments', color: 'var(--term-text)' },
    { text: '', color: '' },
    { text: 'LINKS', color: 'var(--term-yellow)' },
    { text: '  github.com/rohithIlluri', color: 'var(--term-cyan)' },
    { text: '', color: '' },
    { text: 'LICENSE: MIT — use it, remix it, ship it.', color: 'var(--term-dim)' },
  ],
  'stats.json': [
    { text: '{', color: 'var(--term-text)' },
    { text: '  "deadlift_kg":      180,', color: 'var(--term-green)' },
    { text: '  "bench_kg":         120,', color: 'var(--term-green)' },
    { text: '  "5k_run_min":       24,', color: 'var(--term-green)' },
    { text: '  "typing_wpm":       110,', color: 'var(--term-green)' },
    { text: '  "commits_total":    "a lot",', color: 'var(--term-yellow)' },
    { text: '  "coffee_per_day":   3,', color: 'var(--term-yellow)' },
    { text: '  "bugs_introduced":  "classified"', color: 'var(--term-red)' },
    { text: '}', color: 'var(--term-text)' },
  ],
  'music.txt': [
    { text: '01  AC/DC           — Highway to Hell, Back in Black', color: 'var(--term-text)' },
    { text: '02  The Beatles     — Come Together, Let It Be', color: 'var(--term-text)' },
    { text: '03  Led Zeppelin    — Stairway to Heaven, Kashmir', color: 'var(--term-text)' },
    { text: '04  Pink Floyd      — Comfortably Numb, Wish You Were Here', color: 'var(--term-text)' },
  ],
  'movies.txt': [
    { text: '01  Kill Bill Vol. 1   (2003) — Quentin Tarantino', color: 'var(--term-text)' },
    { text: '02  The Dark Knight    (2008) — Christopher Nolan', color: 'var(--term-text)' },
    { text: '03  Interstellar        (2014) — Christopher Nolan', color: 'var(--term-text)' },
    { text: '04  Pulp Fiction        (1994) — Quentin Tarantino', color: 'var(--term-text)' },
  ],
};

const MATRIX_FRAMES = [
  '01001000 01100101 01101100 01101100 01101111',
  '11001010 00110101 10100011 01010110 11100010',
  '00101010 11011001 01110100 10001101 00111011',
  '10110100 01001101 11010010 00101011 10011100',
  '01110001 10100010 00011011 11001001 01010111',
];

// ──────────────────────────────────────────────
// Command runner
// ──────────────────────────────────────────────

function ok(lines, hint = 'celebrate') {
  return { lines, creatureHint: hint };
}

function err(text) {
  return {
    lines: [{ text, color: 'var(--term-red)' }],
    creatureHint: 'error',
  };
}

export function runCommand(raw, context = {}) {
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [], creatureHint: 'idle' };

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  switch (cmd) {
    case 'help':
      return ok([
        { text: 'Available commands:', color: 'var(--term-yellow)' },
        { text: '', color: '' },
        { text: '  about          about me', color: 'var(--term-text)' },
        { text: '  whoami         who is this?', color: 'var(--term-text)' },
        { text: '  skills         tech stack', color: 'var(--term-text)' },
        { text: '  projects       project list', color: 'var(--term-text)' },
        { text: '  ls             list files', color: 'var(--term-text)' },
        { text: '  cat <file>     read a file', color: 'var(--term-text)' },
        { text: '  git log        fake commit history', color: 'var(--term-text)' },
        { text: '  git status     repo status', color: 'var(--term-text)' },
        { text: '  history        command history', color: 'var(--term-text)' },
        { text: '  date           current date', color: 'var(--term-text)' },
        { text: '  uname -a       system info', color: 'var(--term-text)' },
        { text: '  echo <text>    echo text', color: 'var(--term-text)' },
        { text: '  pwd            print working dir', color: 'var(--term-text)' },
        { text: '  man rohith     manual page', color: 'var(--term-text)' },
        { text: '  ping <host>    ping something', color: 'var(--term-text)' },
        { text: '  wave           make the creature wave', color: 'var(--term-text)' },
        { text: '  spin           make the creature spin', color: 'var(--term-text)' },
        { text: '  dance          creature dance party', color: 'var(--term-text)' },
        { text: '  clear          clear the terminal', color: 'var(--term-text)' },
        { text: '', color: '' },
        { text: '  (psst: try `matrix` for a secret)', color: 'var(--term-dim)' },
      ]);

    case 'about':
      return ok(FAKE_FS['about.txt']);

    case 'whoami':
      return ok([
        { text: 'rohith illuri', color: 'var(--term-green)' },
        { text: 'self-taught developer · builder · lifter', color: 'var(--term-dim)' },
      ]);

    case 'skills':
      return ok([
        { text: 'Tech stack:', color: 'var(--term-yellow)' },
        { text: '', color: '' },
        ...SKILLS_LIST.map(s => ({ text: `  ▸ ${s}`, color: 'var(--term-cyan)' })),
      ]);

    case 'projects':
      return ok([
        { text: 'Projects:', color: 'var(--term-yellow)' },
        { text: '', color: '' },
        { text: '  Crave         food marketplace — React + Node + PostgreSQL', color: 'var(--term-text)' },
        { text: '  CryptoApp     live market dashboard — React + WebSocket API', color: 'var(--term-text)' },
        { text: '  Toronto Proj  community platform — full-stack', color: 'var(--term-text)' },
        { text: '  Nnets         neural network experiments — Python', color: 'var(--term-text)' },
        { text: '', color: '' },
        { text: '  → github.com/rohithIlluri', color: 'var(--term-cyan)' },
      ]);

    case 'ls': {
      const target = args.trim();
      if (!target || target === '.') {
        return ok([
          { text: 'about.txt   readme.txt   stats.json   music.txt   movies.txt', color: 'var(--term-text)' },
          { text: 'skills/     projects/', color: 'var(--term-cyan)' },
        ]);
      }
      if (target === 'skills/' || target === 'skills') {
        return ok(SKILLS_LIST.map(s => ({ text: s, color: 'var(--term-cyan)' })));
      }
      if (target === 'projects/' || target === 'projects') {
        return ok([
          { text: 'Crave/   CryptoApp/   toronto-project/   Nnets/', color: 'var(--term-cyan)' },
        ]);
      }
      return err(`ls: cannot access '${target}': No such file or directory`);
    }

    case 'cat': {
      const file = args.trim();
      if (!file) return err('cat: missing file operand');
      if (FAKE_FS[file]) return ok(FAKE_FS[file]);
      return err(`cat: ${file}: No such file or directory`);
    }

    case 'git': {
      const sub = parts[1];
      const flag = parts[2];
      if (sub === 'log' && flag === '--oneline') {
        return ok(FAKE_GIT_LOG.map(c => ({
          text: `${c.hash}  ${c.msg}`,
          color: 'var(--term-text)',
        })));
      }
      if (sub === 'log') {
        return ok(
          FAKE_GIT_LOG.flatMap(c => [
            { text: `commit ${c.hash}da3f9b2c1e5a7d4f8b0c3e6a9d2f5b8c1e4a7d0f`, color: 'var(--term-yellow)' },
            { text: `Date:   ${c.date}`, color: 'var(--term-dim)' },
            { text: `    ${c.msg}`, color: 'var(--term-text)' },
            { text: '', color: '' },
          ])
        );
      }
      if (sub === 'status') {
        return ok([
          { text: 'On branch main', color: 'var(--term-text)' },
          { text: "Your branch is up to date with 'origin/main'.", color: 'var(--term-text)' },
          { text: '', color: '' },
          { text: 'nothing to commit, working tree clean', color: 'var(--term-green)' },
        ]);
      }
      return err(`git: '${sub}' is not a git command. Try 'git log' or 'git status'.`);
    }

    case 'history': {
      const hist = context.history || [];
      if (!hist.length) return ok([{ text: '(no commands yet)', color: 'var(--term-dim)' }]);
      return ok(hist.map((h, i) => ({ text: `  ${String(i + 1).padStart(3)}  ${h}`, color: 'var(--term-dim)' })));
    }

    case 'date':
      return ok([{ text: new Date().toString(), color: 'var(--term-text)' }]);

    case 'pwd':
      return ok([{ text: '/home/rohith', color: 'var(--term-text)' }]);

    case 'uname':
      return ok([
        { text: 'Linux portfolio 6.1.0 #1 SMP x86_64 GNU/Linux', color: 'var(--term-text)' },
        { text: 'user: rohith@portfolio', color: 'var(--term-dim)' },
      ]);

    case 'echo':
      return ok(
        [{ text: args || '', color: 'var(--term-green)' }],
        'wave'
      );

    case 'man':
      if (args.trim() === 'rohith') {
        return ok([
          { text: 'ROHITH(1)              User Commands              ROHITH(1)', color: 'var(--term-dim)' },
          { text: '', color: '' },
          { text: 'NAME', color: 'var(--term-yellow)' },
          { text: '       rohith - a developer who ships things', color: 'var(--term-text)' },
          { text: '', color: '' },
          { text: 'SYNOPSIS', color: 'var(--term-yellow)' },
          { text: '       rohith [--coffee n] [--music rock] [--lift heavy]', color: 'var(--term-text)' },
          { text: '', color: '' },
          { text: 'DESCRIPTION', color: 'var(--term-yellow)' },
          { text: '       Self-taught developer. Builds UIs. Writes clean code.', color: 'var(--term-text)' },
          { text: '       Occasionally breaks prod (but fixes it quickly).', color: 'var(--term-text)' },
          { text: '', color: '' },
          { text: 'OPTIONS', color: 'var(--term-yellow)' },
          { text: '       --coffee n     required for functionality (n >= 1)', color: 'var(--term-text)' },
          { text: '       --music rock   optimal performance mode', color: 'var(--term-text)' },
          { text: '       --lift heavy   stress relief subsystem', color: 'var(--term-text)' },
          { text: '', color: '' },
          { text: 'BUGS', color: 'var(--term-yellow)' },
          { text: '       Talks too much about terminal aesthetics.', color: 'var(--term-dim)' },
        ]);
      }
      return err(`No manual entry for ${args}`);

    case 'ping': {
      const host = args.trim() || 'localhost';
      return ok([
        { text: `PING ${host}: 56 data bytes`, color: 'var(--term-text)' },
        { text: `64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.42 ms`, color: 'var(--term-green)' },
        { text: `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.38 ms`, color: 'var(--term-green)' },
        { text: `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.41 ms`, color: 'var(--term-green)' },
        { text: `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.39 ms`, color: 'var(--term-green)' },
        { text: '', color: '' },
        { text: `--- ${host} ping statistics ---`, color: 'var(--term-dim)' },
        { text: '4 packets transmitted, 4 received, 0% packet loss', color: 'var(--term-green)' },
      ]);
    }

    case 'sudo':
      return err(`rohith is not in the sudoers file. This incident will be reported. 😈`);

    case 'exit':
      return ok([
        { text: "You can't leave. The terminal owns you now. 👁", color: 'var(--term-purple)' },
      ], 'wave');

    case 'matrix':
      return ok([
        { text: 'Wake up, Neo...', color: 'var(--term-green)' },
        { text: '', color: '' },
        ...MATRIX_FRAMES.map(f => ({ text: f, color: 'var(--term-green)' })),
        { text: '', color: '' },
        { text: 'The Matrix has you.', color: 'var(--term-dim)' },
      ], 'spin');

    case 'wave':
      return ok([{ text: '👋', color: 'var(--term-yellow)' }], 'wave');

    case 'spin':
      return ok([{ text: 'Spinning...', color: 'var(--term-cyan)' }], 'spin');

    case 'dance':
      return ok([
        { text: '  \\o/   \\o/   \\o/', color: 'var(--term-yellow)' },
        { text: '   |     |     |', color: 'var(--term-yellow)' },
        { text: '  / \\   / \\   / \\', color: 'var(--term-yellow)' },
        { text: '', color: '' },
        { text: '🎵 dancing...', color: 'var(--term-purple)' },
      ], 'celebrate');

    case 'clear':
      return { lines: null, creatureHint: 'spin' }; // null signals "clear all"

    default:
      return err(`command not found: ${cmd}. Type 'help' for available commands.`);
  }
}

export const TAB_COMPLETIONS = [
  'help', 'about', 'whoami', 'skills', 'projects', 'ls', 'cat ', 'git log',
  'git status', 'git log --oneline', 'history', 'date', 'uname -a', 'echo ',
  'pwd', 'man rohith', 'ping ', 'wave', 'spin', 'dance', 'matrix', 'clear', 'exit',
  'cat about.txt', 'cat readme.txt', 'cat stats.json', 'cat music.txt', 'cat movies.txt',
  'ls skills/', 'ls projects/', 'sudo ',
];
