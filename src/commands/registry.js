import { CUSTOM_PROJECTS, PROJECT_REPOS } from '../constants/projects';
import { MUSIC_ARTISTS } from '../constants/spotify';
import { FAVORITE_MOVIES } from '../constants/tmdb';
import { GITHUB_USERNAME, GITHUB_API_BASE } from '../constants/github';
import { fetchLiveRepoData, getRelativeTime } from '../utils/github';

// ── Entry helpers ─────────────────────────────────────────────────────────
const t = (text, color) => ({ type: 'text', text, color });
const blank = () => ({ type: 'blank' });
const section = (title) => ({ type: 'section', title });
const divider = () => ({ type: 'divider' });
const row = (label, value, labelColor, valueColor) => ({ type: 'row', label, value, labelColor, valueColor });
const err = (text) => ({ type: 'error', text });

// ── help ──────────────────────────────────────────────────────────────────
function helpCmd() {
  const W = 58;
  const top    = `╭─ Available Commands ${'─'.repeat(W - 22)}╮`;
  const bottom = `╰${'─'.repeat(W + 1)}╯`;
  const line   = (txt) => {
    const content = ` ${txt}`;
    const pad = Math.max(0, W - content.length);
    return `│${content}${' '.repeat(pad)}│`;
  };

  return [
    blank(),
    t(top, 'muted'),
    t(line(''), 'muted'),
    t(line('  Navigation & Info'), 'cyan'),
    t(line('    about / whoami     Personal bio and links'), 'muted'),
    t(line('    skills             Tech skills by category'), 'muted'),
    t(line('    projects           All projects (live from GitHub)'), 'muted'),
    t(line('    project <name>     Details for a specific project'), 'muted'),
    t(line('    stats              Personal records'), 'muted'),
    t(line('    music              Favorite artists'), 'muted'),
    t(line('    movies             Favorite films'), 'muted'),
    t(line('    contact            Contact info'), 'muted'),
    t(line('    github             GitHub profile stats'), 'muted'),
    t(line(''), 'muted'),
    t(line('  Terminal'), 'cyan'),
    t(line('    ls                 List all sections'), 'muted'),
    t(line('    banner             Show welcome banner'), 'muted'),
    t(line('    date               Current date and time'), 'muted'),
    t(line('    echo <text>        Print text to terminal'), 'muted'),
    t(line('    clear / cls        Clear terminal'), 'muted'),
    t(line(''), 'muted'),
    t(line('  Keyboard'), 'cyan'),
    t(line('    ↑ / ↓              Command history'), 'muted'),
    t(line('    Tab                Auto-complete'), 'muted'),
    t(line('    Ctrl+L             Clear terminal'), 'muted'),
    t(line('    Ctrl+C             Clear input'), 'muted'),
    t(line(''), 'muted'),
    t(bottom, 'muted'),
    blank(),
  ];
}

// ── about / whoami ────────────────────────────────────────────────────────
function aboutCmd() {
  return [
    blank(),
    section('About Rohith Illuri'),
    divider(),
    blank(),
    t('  Self-taught developer who ships things on the internet.', 'white'),
    t('  Into tech and physics — the forces that shape the universe.', 'white'),
    t('  Fascinated by space, science, and ideas that expand the mind.', 'white'),
    blank(),
    section('Links'),
    divider(),
    row('  twitter   ', 'x.com/rohithilluri', 'muted', 'blue'),
    row('  linkedin  ', 'linkedin.com/in/rohithilluri', 'muted', 'blue'),
    row('  github    ', 'github.com/rohithIlluri', 'muted', 'blue'),
    row('  discord   ', 'discord.com/users/tars9791', 'muted', 'blue'),
    row('  email     ', 'rohith.illuri@gmail.com', 'muted', 'blue'),
    blank(),
  ];
}

// ── skills ────────────────────────────────────────────────────────────────
function skillsCmd() {
  return [
    blank(),
    section('Technical Skills'),
    divider(),
    blank(),
    t('  Languages', 'yellow'),
    t('  JavaScript  TypeScript  Python  Java', 'white'),
    blank(),
    t('  Frontend', 'yellow'),
    t('  React  Next.js  HTML/CSS  Tailwind CSS', 'white'),
    blank(),
    t('  Backend', 'yellow'),
    t('  Node.js  Express.js  GraphQL', 'white'),
    blank(),
    t('  Databases', 'yellow'),
    t('  MongoDB  PostgreSQL', 'white'),
    blank(),
    t('  DevOps & Tools', 'yellow'),
    t('  Git  Docker  AWS', 'white'),
    blank(),
  ];
}

// ── projects (async) ──────────────────────────────────────────────────────
async function projectsCmd() {
  let repos = [];
  try {
    repos = await fetchLiveRepoData(PROJECT_REPOS);
  } catch (_) {}

  const out = [blank(), section('Featured Projects'), divider(), blank()];

  for (const repoName of PROJECT_REPOS) {
    const repo = repos.find(r => r.name === repoName) || {};
    const custom = CUSTOM_PROJECTS[repoName] || {};

    const desc = custom.description || repo.description || 'No description available.';
    const lang = custom.language || repo.language || 'Unknown';
    const stars = repo.stargazers_count ?? 0;
    const forks = repo.forks_count ?? 0;
    const ghUrl = repo.html_url || `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    const liveUrl = custom.liveUrl || repo.homepage || null;
    const updated = repo.updated_at ? getRelativeTime(repo.updated_at) : null;

    out.push(t(`  ${repoName}`, 'yellow'));
    out.push(t(`  ${desc}`, 'white'));
    out.push(row('    language  ', lang, 'muted', 'cyan'));
    if (updated) out.push(row('    updated   ', updated, 'muted', 'white'));
    out.push(row('    stars     ', `★ ${stars}   ⑂ ${forks}`, 'muted', 'white'));
    out.push(row('    github    ', ghUrl, 'muted', 'blue'));
    if (liveUrl) out.push(row('    live      ', liveUrl, 'muted', 'green'));
    out.push(t(`    → run 'project ${repoName}' for full details`, 'dim'));
    out.push(blank());
  }

  out.push(t(`  Projects: ${PROJECT_REPOS.join(', ')}`, 'dim'));
  out.push(blank());
  return out;
}

// ── project <name> (async) ────────────────────────────────────────────────
async function projectCmd(args) {
  const name = args[0];
  if (!name) {
    return [
      blank(),
      err('Usage: project <name>'),
      t(`  Available: ${PROJECT_REPOS.join(', ')}`, 'muted'),
      blank(),
    ];
  }

  const match = PROJECT_REPOS.find(r => r.toLowerCase() === name.toLowerCase());
  if (!match) {
    return [
      blank(),
      err(`Project not found: "${name}"`),
      t(`  Available: ${PROJECT_REPOS.join(', ')}`, 'muted'),
      blank(),
    ];
  }

  let repo = null;
  try {
    const results = await fetchLiveRepoData([match]);
    repo = results[0] || null;
  } catch (_) {}

  const custom = CUSTOM_PROJECTS[match] || {};
  const desc = custom.description || (repo && repo.description) || 'No description available.';
  const lang = custom.language || (repo && repo.language) || 'Unknown';
  const stars = (repo && repo.stargazers_count) ?? 0;
  const forks = (repo && repo.forks_count) ?? 0;
  const openIssues = (repo && repo.open_issues_count) ?? 0;
  const ghUrl = (repo && repo.html_url) || `https://github.com/${GITHUB_USERNAME}/${match}`;
  const liveUrl = custom.liveUrl || (repo && repo.homepage) || null;
  const updated = repo && repo.updated_at
    ? new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return [
    blank(),
    section(`Project: ${match}`),
    divider(),
    blank(),
    t(`  ${desc}`, 'white'),
    blank(),
    row('  language     ', lang, 'muted', 'cyan'),
    row('  updated      ', updated, 'muted', 'white'),
    row('  stars        ', `★ ${stars}`, 'muted', 'yellow'),
    row('  forks        ', `⑂ ${forks}`, 'muted', 'white'),
    row('  open issues  ', String(openIssues), 'muted', openIssues > 0 ? 'red' : 'white'),
    row('  github       ', ghUrl, 'muted', 'blue'),
    ...(liveUrl ? [row('  live demo    ', liveUrl, 'muted', 'green')] : []),
    blank(),
  ];
}

// ── stats ─────────────────────────────────────────────────────────────────
function statsCmd() {
  return [
    blank(),
    section('Personal Stats'),
    divider(),
    blank(),
    t('  Powerlifting PRs', 'yellow'),
    row('  deadlift      ', '340 lbs', 'muted', 'green'),
    row('  bench press   ', '180 lbs', 'muted', 'green'),
    blank(),
    t('  Cardio', 'yellow'),
    row('  longest run   ', '11.32 miles', 'muted', 'green'),
    blank(),
    t('  Typing', 'yellow'),
    row('  30s test      ', '95 wpm', 'muted', 'cyan'),
    row('  15s test      ', '103.13 wpm', 'muted', 'cyan'),
    blank(),
  ];
}

// ── music ─────────────────────────────────────────────────────────────────
function musicCmd() {
  return [
    blank(),
    section('Favorite Artists'),
    divider(),
    blank(),
    ...MUSIC_ARTISTS.flatMap(a => [
      t(`  ${a.name}`, 'yellow'),
      t(`  ${a.description}`, 'white'),
      row('  spotify  ', a.spotifyUrl, 'muted', 'blue'),
      blank(),
    ]),
    t('  Music streams in the status bar below ↓', 'dim'),
    blank(),
  ];
}

// ── movies ────────────────────────────────────────────────────────────────
function moviesCmd() {
  return [
    blank(),
    section('Favorite Films'),
    divider(),
    blank(),
    ...FAVORITE_MOVIES.flatMap(m => [
      t(`  ${m.name}  (${m.year})`, 'yellow'),
      t(`  ${m.description}`, 'white'),
      row('  tmdb     ', m.tmdbUrl, 'muted', 'blue'),
      blank(),
    ]),
  ];
}

// ── contact ───────────────────────────────────────────────────────────────
function contactCmd() {
  return [
    blank(),
    section('Contact'),
    divider(),
    blank(),
    t('  Best reached by email or Twitter.', 'muted'),
    blank(),
    row('  email     ', 'rohith.illuri@gmail.com', 'muted', 'green'),
    row('  twitter   ', 'x.com/rohithilluri', 'muted', 'blue'),
    row('  linkedin  ', 'linkedin.com/in/rohithilluri', 'muted', 'blue'),
    row('  github    ', 'github.com/rohithIlluri', 'muted', 'blue'),
    row('  discord   ', 'discord.com/users/tars9791', 'muted', 'magenta'),
    blank(),
  ];
}

// ── github (async) ────────────────────────────────────────────────────────
async function githubCmd() {
  let user = null;
  let repoList = [];
  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`),
      fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100`),
    ]);
    if (uRes.ok) user = await uRes.json();
    if (rRes.ok) repoList = await rRes.json();
  } catch (_) {}

  if (!user) {
    return [
      blank(),
      err('Failed to fetch GitHub stats. Check your network.'),
      blank(),
    ];
  }

  const totalStars = repoList.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const langs = [...new Set(repoList.filter(r => r.language).map(r => r.language))];
  const joined = user.created_at
    ? new Date(user.created_at).getFullYear()
    : 'Unknown';

  return [
    blank(),
    section(`GitHub: ${user.login}`),
    divider(),
    blank(),
    row('  name         ', user.name || user.login, 'muted', 'white'),
    row('  bio          ', user.bio || '—', 'muted', 'white'),
    row('  location     ', user.location || '—', 'muted', 'white'),
    row('  public repos ', String(user.public_repos), 'muted', 'yellow'),
    row('  followers    ', String(user.followers), 'muted', 'green'),
    row('  following    ', String(user.following), 'muted', 'green'),
    row('  total stars  ', `★ ${totalStars}`, 'muted', 'yellow'),
    row('  member since ', String(joined), 'muted', 'cyan'),
    row('  profile      ', `github.com/${user.login}`, 'muted', 'blue'),
    blank(),
    ...(langs.length > 0 ? [
      t('  Languages used across repos:', 'muted'),
      t(`  ${langs.slice(0, 10).join('  ')}`, 'white'),
      blank(),
    ] : []),
  ];
}

// ── ls ────────────────────────────────────────────────────────────────────
function lsCmd() {
  return [
    blank(),
    t('  sections/', 'yellow'),
    t('  ├── about          Personal bio and links', 'muted'),
    t('  ├── skills         Tech skills by category', 'muted'),
    t('  ├── projects       Featured projects (4)', 'muted'),
    t('  ├── stats          Fitness & typing records', 'muted'),
    t('  ├── music          Favorite artists', 'muted'),
    t('  ├── movies         Favorite films', 'muted'),
    t('  └── contact        Contact information', 'muted'),
    blank(),
    t('  Type any section name to explore it.', 'green'),
    blank(),
  ];
}

// ── banner ────────────────────────────────────────────────────────────────
export function bannerCmd() {
  return [
    blank(),
    t('  ██████╗  ██████╗ ██╗  ██╗██╗████████╗██╗  ██╗', 'green'),
    t('  ██╔══██╗██╔═══██╗██║  ██║██║╚══██╔══╝██║  ██║', 'green'),
    t('  ██████╔╝██║   ██║███████║██║   ██║   ███████║', 'green'),
    t('  ██╔══██╗██║   ██║██╔══██║██║   ██║   ██╔══██║', 'green'),
    t('  ██║  ██║╚██████╔╝██║  ██║██║   ██║   ██║  ██║', 'green'),
    t('  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝', 'green'),
    blank(),
    t('  ██╗██╗     ██╗     ██╗   ██╗██████╗ ██╗', 'yellow'),
    t('  ██║██║     ██║     ██║   ██║██╔══██╗██║', 'yellow'),
    t('  ██║██║     ██║     ██║   ██║██████╔╝██║', 'yellow'),
    t('  ██║██║     ██║     ██║   ██║██╔══██╗██║', 'yellow'),
    t('  ██║███████╗███████╗╚██████╔╝██║  ██║██║', 'yellow'),
    t('  ╚═╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝', 'yellow'),
    blank(),
    t('  Self-taught developer. I just ship things.', 'white'),
    t('  Type "help" for available commands.', 'muted'),
    blank(),
  ];
}

// ── date ──────────────────────────────────────────────────────────────────
function dateCmd() {
  const now = new Date();
  const formatted = now.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
    second: '2-digit', timeZoneName: 'short',
  });
  return [blank(), t(`  ${formatted}`, 'cyan'), blank()];
}

// ── echo ──────────────────────────────────────────────────────────────────
function echoCmd(args) {
  const text = args.join(' ');
  return text
    ? [blank(), t(`  ${text}`, 'white'), blank()]
    : [blank(), t('  (no text provided — usage: echo <text>)', 'muted'), blank()];
}

// ── clear ─────────────────────────────────────────────────────────────────
function clearCmd() {
  return [{ type: 'clear' }];
}

// ── not found ─────────────────────────────────────────────────────────────
function notFound(cmd) {
  return [
    blank(),
    err(`${cmd}: command not found`),
    t('  Type "help" for available commands.', 'muted'),
    blank(),
  ];
}

// ── exports ───────────────────────────────────────────────────────────────
export const COMMAND_NAMES = [
  'help', 'about', 'whoami', 'skills', 'projects', 'project',
  'stats', 'music', 'movies', 'contact', 'github', 'ls',
  'clear', 'cls', 'banner', 'date', 'echo',
];

export const COMMANDS = {
  help:     helpCmd,
  about:    aboutCmd,
  whoami:   aboutCmd,
  skills:   skillsCmd,
  projects: projectsCmd,
  project:  projectCmd,
  stats:    statsCmd,
  music:    musicCmd,
  movies:   moviesCmd,
  contact:  contactCmd,
  github:   githubCmd,
  ls:       lsCmd,
  clear:    clearCmd,
  cls:      clearCmd,
  banner:   bannerCmd,
  date:     dateCmd,
  echo:     echoCmd,
};

export async function processCommand(rawInput) {
  const parts = rawInput.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = COMMANDS[cmd];
  if (!handler) return notFound(cmd);
  return handler(args);
}
