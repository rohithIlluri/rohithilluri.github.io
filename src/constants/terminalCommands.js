// ── Image → ASCII converter (canvas, runs in browser only) ──
const ASCII_CHARS = [' ', '.', ':', '-', '=', '+', 'S', '?', '%', '#', '@'];
const ART_W = 42;
const ART_H = 19;

async function imageToAscii(src) {
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width = ART_W;
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

// ── Hand-crafted ASCII art (movies without image files) ──
const DARK_KNIGHT_ART = [
  '                                          ',
  '      __   ___________   __              ',
  '     /  \\/           \\/  \\             ',
  '    /    \\     BAT     /    \\           ',
  '   / /\\   \\_________/   /\\ \\          ',
  '  /_/  \\___           ___/  \\_\\        ',
  '         / \\_________/ \\               ',
  '        /               \\              ',
  '       / DARK    KNIGHT  \\             ',
  '      /___________________\\            ',
  '                                          ',
];

const PULP_FICTION_ART = [
  '                                          ',
  '   .===================================.  ',
  '   |                                   |  ',
  '   |   P  U  L  P   F  I  C  T  I  O  N  |  ',
  '   |                                   |  ',
  '   |   +---------+   +---------+       |  ',
  '   |   |  ????   |   |  ????   |       |  ',
  '   |   +---------+   +---------+       |  ',
  '   |                                   |  ',
  '   |   Tarantino  .  1994              |  ',
  '   |                                   |  ',
  '   .===================================.  ',
  '                                          ',
];

// ── Boot text ────────────────────────────────────────────
export const BOOT_TEXT =
` ___   ___  _  _   ___
/ __| / _ \\| \\| | / __|
\\__ \\| (_) | .\` || (_ |
|___/ \\___/|_|\\_| \\___|

portfolio terminal — v3.0
type 'help' to explore.
`;

// ── Content data ──────────────────────────────────────────
const MUSIC_ARTISTS = [
  { name: 'AC/DC',        desc: 'beer in one hand, blood in the other',  img: '/artists/ac-dc.jpg' },
  { name: 'The Beatles',  desc: 'the best band ever',                    img: '/artists/the-beatles.jpg' },
  { name: 'A.R. Rahman',  desc: 'musical maestro',                       img: '/artists/ar-rahman.jpg' },
  { name: 'Linkin Park',  desc: 'rip chester bennington',                img: '/artists/linkin-park.jpg' },
];

const MOVIES = [
  { name: 'Kill Bill: Vol. 1', year: 2003, desc: 'swords and revenge',          img: '/kill-bill-poster.jpg' },
  { name: 'The Dark Knight',   year: 2008, desc: 'epic superhero masterpiece',  img: null, art: DARK_KNIGHT_ART },
  { name: 'Interstellar',      year: 2014, desc: 'space exploration epic',      img: '/artists/interstellar.jpeg' },
  { name: 'Pulp Fiction',      year: 1994, desc: 'quentin tarantino classic',   img: null, art: PULP_FICTION_ART },
];

const SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Python', 'Java', 'HTML', 'CSS',
  'Tailwind', 'Git', 'Docker', 'AWS',
  'MongoDB', 'PostgreSQL', 'Express.js', 'GraphQL',
];

const FAKE_GIT_LOG = [
  { hash: 'a3f7b2e', date: '2024-12-01', msg: 'feat: add GSAP animations to hero' },
  { hash: '9c1d8f4', date: '2024-11-20', msg: 'fix: mobile nav overflow' },
  { hash: '4e2a71b', date: '2024-11-15', msg: 'feat: add YouTube background player' },
  { hash: '8b3c9d1', date: '2024-11-10', msg: 'refactor: extract hooks' },
  { hash: '1f0e5c7', date: '2024-10-28', msg: 'feat: deploy Crave to Vercel' },
  { hash: '6a4d2b8', date: '2024-10-15', msg: 'feat: cryptoapp live market data' },
  { hash: '2c8f3e9', date: '2024-09-30', msg: 'docs: add project READMEs' },
  { hash: '7d1b0a5', date: '2024-09-12', msg: 'init: scaffold with React + Tailwind' },
];

// ── Line helpers ──────────────────────────────────────────
// Each line: { text, dim?, green? }
// Renderer applies: green → accent color, dim → muted, default → text color

function line(text, opts = {}) {
  return { text, ...opts };
}

function ok(lines, hint = 'celebrate') {
  return { lines, creatureHint: hint };
}

function err(text) {
  return { lines: [line(text)], creatureHint: 'error' };
}

// ── Command runner (async for image loading) ──────────────
export async function runCommand(raw, context = {}) {
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [], creatureHint: 'idle' };

  const parts  = trimmed.split(/\s+/);
  const cmd    = parts[0].toLowerCase();
  const args   = parts.slice(1).join(' ').trim();

  switch (cmd) {

    case 'help':
      return ok([
        line('commands', { green: true }),
        line(''),
        line('  about         who is song'),
        line('  skills        tech stack'),
        line('  projects      shipped projects'),
        line('  music         favorite artists'),
        line('  movies        favorite films'),
        line('  stats         personal records'),
        line(''),
        line('  ls            list files'),
        line('  cat <file>    read a file'),
        line('  git log       commit history'),
        line('  git status    repo status'),
        line('  history       command history'),
        line('  date          current time'),
        line('  echo <text>   echo text'),
        line('  clear         clear screen'),
        line(''),
        line('  wave / spin / dance   stunt time'),
        line('  man song              the manual'),
        line('  sudo                  nice try'),
        line(''),
        line('  (try `matrix` for something fun)', { dim: true }),
      ]);

    case 'about':
      return ok([
        line('song', { green: true }),
        line('─────────────────────────────'),
        line(''),
        line('  self-taught developer.'),
        line('  passionate about physics, space, and building things.'),
        line(''),
        line('  when not at the keyboard:'),
        line('    deadlifting heavy things'),
        line('    ac/dc at unreasonable volumes'),
        line('    watching kill bill for the 12th time'),
        line(''),
        line('  github.com/rohithIlluri', { dim: true }),
      ]);

    case 'whoami':
      return ok([
        line('song'),
        line('self-taught developer · builder · lifter', { dim: true }),
      ]);

    case 'skills':
      return ok([
        line('tech stack', { green: true }),
        line('─────────────────────────────'),
        line(''),
        ...SKILLS.map(s => line(`  ${s}`)),
      ]);

    case 'projects':
      return ok([
        line('projects', { green: true }),
        line('─────────────────────────────'),
        line(''),
        line('  Crave           food marketplace — React + Node + PostgreSQL'),
        line('  CryptoApp       live market dashboard — React + WebSocket'),
        line('  Toronto Proj    community platform — full-stack'),
        line('  Nnets           neural network experiments — Python'),
        line(''),
        line('  → github.com/rohithIlluri', { dim: true }),
      ]);

    case 'music': {
      const results = [
        line('music', { green: true }),
        line('─────────────────────────────'),
      ];
      for (const artist of MUSIC_ARTISTS) {
        results.push(line(''));
        results.push(line(`  ${artist.name}`, { green: true }));
        results.push(line(`  ${artist.desc}`, { dim: true }));
        results.push(line(''));
        const rows = await imageToAscii(artist.img);
        rows.forEach(r => results.push(line(`  ${r}`)));
        results.push(line('  ' + '─'.repeat(ART_W)));
      }
      return ok(results, 'celebrate');
    }

    case 'movies': {
      const results = [
        line('movies', { green: true }),
        line('─────────────────────────────'),
      ];
      for (const movie of MOVIES) {
        results.push(line(''));
        results.push(line(`  ${movie.name}  (${movie.year})`, { green: true }));
        results.push(line(`  ${movie.desc}`, { dim: true }));
        results.push(line(''));
        if (movie.img) {
          const rows = await imageToAscii(movie.img);
          rows.forEach(r => results.push(line(`  ${r}`)));
        } else if (movie.art) {
          movie.art.forEach(r => results.push(line(`  ${r}`)));
        }
        results.push(line('  ' + '─'.repeat(ART_W)));
      }
      return ok(results, 'celebrate');
    }

    case 'stats':
      return ok([
        line('stats', { green: true }),
        line('─────────────────────────────'),
        line(''),
        line('  deadlift_pr     340 lbs'),
        line('  bench_press     180 lbs'),
        line('  run             11.32 miles'),
        line('  typing_30s      95 wpm'),
        line('  typing_15s      103 wpm'),
        line(''),
        line('  coffee_per_day  3', { dim: true }),
        line('  bugs_shipped    classified', { dim: true }),
      ]);

    case 'ls': {
      if (!args || args === '.') {
        return ok([
          line('about.txt   readme.txt   stats.json'),
          line('music/      movies/      projects/', { dim: true }),
        ]);
      }
      if (args === 'music/' || args === 'music') {
        return ok(MUSIC_ARTISTS.map(a => line(a.name)));
      }
      if (args === 'movies/' || args === 'movies') {
        return ok(MOVIES.map(m => line(m.name)));
      }
      if (args === 'projects/' || args === 'projects') {
        return ok([line('Crave/   CryptoApp/   toronto-project/   Nnets/')]);
      }
      return err(`ls: ${args}: no such file or directory`);
    }

    case 'cat': {
      if (!args) return err('cat: missing operand');
      if (args === 'readme.txt') {
        return ok([
          line('song — self-taught developer', { green: true }),
          line(''),
          line('builds things with react, node, and whatever gets the job done.'),
          line(''),
          line('projects: crave · cryptoapp · toronto-project · nnets'),
          line('links:    github.com/rohithIlluri'),
          line('license:  mit'),
        ]);
      }
      if (args === 'about.txt') return runCommand('about', context);
      if (args === 'stats.json') return runCommand('stats', context);
      return err(`cat: ${args}: no such file or directory`);
    }

    case 'git': {
      const sub = parts[1];
      if (sub === 'log' && parts[2] === '--oneline') {
        return ok(FAKE_GIT_LOG.map(c => line(`${c.hash}  ${c.msg}`)));
      }
      if (sub === 'log') {
        return ok(
          FAKE_GIT_LOG.flatMap(c => [
            line(`commit ${c.hash}da3f9b2c1e4a7d8f`, { green: true }),
            line(`date   ${c.date}`, { dim: true }),
            line(`       ${c.msg}`),
            line(''),
          ])
        );
      }
      if (sub === 'status') {
        return ok([
          line('on branch main'),
          line("up to date with 'origin/main'"),
          line(''),
          line('nothing to commit, working tree clean', { green: true }),
        ]);
      }
      return err(`git: '${sub}' is not a git command`);
    }

    case 'history': {
      const hist = context.history || [];
      if (!hist.length) return ok([line('(empty)', { dim: true })]);
      return ok(hist.map((h, i) => line(`  ${String(i + 1).padStart(3)}  ${h}`, { dim: true })));
    }

    case 'date':
      return ok([line(new Date().toString())]);

    case 'echo':
      return ok([line(args || '')], 'wave');

    case 'pwd':
      return ok([line('/home/song')]);

    case 'man':
      if (args === 'song') {
        return ok([
          line('SONG(1)                  User Commands                  SONG(1)', { dim: true }),
          line(''),
          line('NAME', { green: true }),
          line('       song — a developer who ships things'),
          line(''),
          line('SYNOPSIS', { green: true }),
          line('       song [--coffee n] [--music loud] [--lift heavy]'),
          line(''),
          line('DESCRIPTION', { green: true }),
          line('       self-taught. builds uis. writes clean code.'),
          line('       passionate about physics and space.'),
          line('       occasionally breaks prod (fixes it quickly).'),
          line(''),
          line('OPTIONS', { green: true }),
          line('       --coffee n     required for functionality (n >= 1)'),
          line('       --music loud   optimal performance mode'),
          line('       --lift heavy   stress relief subsystem'),
          line(''),
          line('BUGS', { green: true }),
          line('       talks too much about terminal aesthetics.', { dim: true }),
        ]);
      }
      return err(`no manual entry for ${args}`);

    case 'sudo':
      return err(`song is not in the sudoers file. this incident will be reported.`);

    case 'exit':
      return ok([line("you can't leave. song owns you now.", { dim: true })], 'wave');

    case 'ping': {
      const host = args || 'localhost';
      return ok([
        line(`PING ${host}: 56 data bytes`),
        line(`64 bytes: icmp_seq=0 ttl=64 time=0.42 ms`),
        line(`64 bytes: icmp_seq=1 ttl=64 time=0.38 ms`),
        line(`64 bytes: icmp_seq=2 ttl=64 time=0.41 ms`),
        line(''),
        line(`4 packets, 0% loss`, { dim: true }),
      ]);
    }

    case 'matrix':
      return ok([
        line('wake up, neo...', { green: true }),
        line(''),
        line('01001000 01100101 01101100 01101100 01101111'),
        line('11001010 00110101 10100011 01010110 11100010'),
        line('00101010 11011001 01110100 10001101 00111011'),
        line('10110100 01001101 11010010 00101011 10011100'),
        line('01110001 10100010 00011011 11001001 01010111'),
        line(''),
        line('the matrix has you.', { dim: true }),
      ], 'spin');

    case 'wave':
      return ok([line('👋', { green: true })], 'wave');

    case 'spin':
      return ok([line('spinning...', { dim: true })], 'spin');

    case 'dance':
      return ok([
        line('  \\o/   \\o/   \\o/', { green: true }),
        line('   |     |     |'),
        line('  / \\   / \\   / \\'),
      ], 'celebrate');

    case 'clear':
      return { lines: null, creatureHint: 'spin' };

    case 'uname':
      return ok([
        line('Linux song-portfolio 6.1.0 x86_64 GNU/Linux'),
        line('user: song', { dim: true }),
      ]);

    default:
      return err(`command not found: ${cmd}  (try 'help')`);
  }
}

export const TAB_COMPLETIONS = [
  'help', 'about', 'whoami', 'skills', 'projects', 'music', 'movies', 'stats',
  'ls', 'cat readme.txt', 'cat about.txt', 'cat stats.json',
  'git log', 'git log --oneline', 'git status',
  'history', 'date', 'echo ', 'pwd', 'man song',
  'ping ', 'wave', 'spin', 'dance', 'matrix', 'clear', 'exit', 'sudo ',
  'ls music/', 'ls movies/', 'ls projects/',
];
