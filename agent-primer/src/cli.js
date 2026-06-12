import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runWizard } from './wizard.js';
import { runDoctor } from './doctor.js';
import { buildPlan } from './adapters/index.js';
import { applyActions } from './fsutil.js';
import {
  defaultProfile,
  loadProfile,
  requireProfile,
  saveProfile,
  profilePath,
} from './profile.js';

const HELP = `agent-primer — one preference interview, every AI coding tool configured.

Usage: agent-primer <command> [options]

Commands:
  init              interview you, save a profile, write all configs
  apply             re-write configs from the saved profile
  remember "fact"   add a fact to your memory store and sync all tools
  forget <n>        remove fact number n (see \`show\`)
  show              print the saved profile
  doctor            check your environment and config health
  help              show this message

Options:
  --dry-run         show what would be written without writing
  --defaults        (init) skip the interview, use safe beginner defaults
  --scope <s>       override scope: global | project | both
`;

function parseFlags(args) {
  const flags = { dryRun: false, defaults: false, scope: null, rest: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') flags.dryRun = true;
    else if (a === '--defaults' || a === '--yes') flags.defaults = true;
    else if (a === '--scope') flags.scope = args[++i];
    else if (a.startsWith('--scope=')) flags.scope = a.slice('--scope='.length);
    else flags.rest.push(a);
  }
  if (flags.scope && !['global', 'project', 'both'].includes(flags.scope)) {
    throw new Error(`invalid --scope "${flags.scope}" (global | project | both)`);
  }
  return flags;
}

function printResults(results) {
  for (const r of results) {
    const tag = { created: '+', updated: '~', unchanged: '=', skipped: '-', planned: '>' }[r.status];
    console.log(`  ${tag} [${r.status}] ${r.action.path}  (${r.action.adapter}: ${r.action.description})`);
    if (r.backup) console.log(`      previous version backed up to ${r.backup}`);
  }
}

function applyProfile(profile, flags) {
  const plan = buildPlan(profile, flags.scope ?? profile.scope);
  const results = applyActions(plan, { dryRun: flags.dryRun });
  console.log(flags.dryRun ? '\nPlan (dry run, nothing written):' : '\nConfigs written:');
  printResults(results);
  return results;
}

export async function main(argv) {
  const [command, ...args] = argv;
  const flags = parseFlags(args);

  switch (command) {
    case 'init': {
      const existing = loadProfile();
      const profile = flags.defaults
        ? (existing ?? defaultProfile())
        : await runWizard(existing);
      if (!flags.dryRun) {
        const file = saveProfile(profile);
        console.log(`\nProfile saved to ${file}`);
      }
      applyProfile(profile, flags);
      console.log('\nDone. Your AI tools now know your preferences.');
      console.log('Tip: `agent-primer remember "I prefer X"` keeps them up to date.');
      return 0;
    }

    case 'apply': {
      applyProfile(requireProfile(), flags);
      return 0;
    }

    case 'remember': {
      const fact = flags.rest.join(' ').trim();
      if (!fact) throw new Error('usage: agent-primer remember "your fact here"');
      const profile = requireProfile();
      profile.memory.facts.push(fact);
      saveProfile(profile);
      console.log(`Remembered: "${fact}"`);
      applyProfile(profile, flags);
      return 0;
    }

    case 'forget': {
      const n = Number(flags.rest[0]);
      const profile = requireProfile();
      if (!Number.isInteger(n) || n < 1 || n > profile.memory.facts.length) {
        throw new Error(
          `usage: agent-primer forget <1-${profile.memory.facts.length || 0}> (see \`agent-primer show\`)`,
        );
      }
      const [removed] = profile.memory.facts.splice(n - 1, 1);
      saveProfile(profile);
      console.log(`Forgot: "${removed}"`);
      applyProfile(profile, flags);
      return 0;
    }

    case 'show': {
      const profile = requireProfile();
      console.log(`Profile: ${profilePath()}\n`);
      console.log(JSON.stringify(profile, null, 2));
      if (profile.memory.facts.length) {
        console.log('\nFacts:');
        profile.memory.facts.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
      }
      return 0;
    }

    case 'doctor': {
      for (const item of runDoctor()) {
        const mark = item.ok ? 'ok ' : '!! ';
        console.log(`  ${mark} ${item.label}${item.detail ? ` — ${item.detail}` : ''}`);
      }
      return 0;
    }

    case '--version':
    case 'version': {
      const pkg = JSON.parse(
        fs.readFileSync(
          path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json'),
          'utf8',
        ),
      );
      console.log(pkg.version);
      return 0;
    }

    case 'help':
    case '--help':
    case undefined: {
      console.log(HELP);
      return 0;
    }

    default:
      console.error(`unknown command: ${command}\n`);
      console.log(HELP);
      return 1;
  }
}
