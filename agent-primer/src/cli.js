import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runScan } from './scan.js';
import { deriveProfile } from './derive.js';
import { buildPlan } from './adapters/index.js';
import { applyActions } from './fsutil.js';
import { saveState, stateDir } from './profile.js';

const HELP = `agent-primer — scans your machine and integrates into your AI workflows.
Strictly local: no network code exists in this project; nothing leaves your disk.

Usage: agent-primer <command> [options]

Commands:
  scan          detect AI tools, project stack, and what integration would do
  integrate     scan, then write/merge configs for every detected tool
  help          show this message

Options:
  --dry-run         (integrate) show what would be written without writing
  --scope <s>       override scope: global | project | both
  --autonomy <a>    permission preset: cautious (default) | balanced | autonomous
`;

function parseFlags(args) {
  const flags = { dryRun: false, scope: null, autonomy: 'cautious', rest: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') flags.dryRun = true;
    else if (a === '--scope') flags.scope = args[++i];
    else if (a.startsWith('--scope=')) flags.scope = a.slice('--scope='.length);
    else if (a === '--autonomy') flags.autonomy = args[++i];
    else if (a.startsWith('--autonomy=')) flags.autonomy = a.slice('--autonomy='.length);
    else flags.rest.push(a);
  }
  if (flags.scope && !['global', 'project', 'both'].includes(flags.scope)) {
    throw new Error(`invalid --scope "${flags.scope}" (global | project | both)`);
  }
  if (!['cautious', 'balanced', 'autonomous'].includes(flags.autonomy)) {
    throw new Error(`invalid --autonomy "${flags.autonomy}" (cautious | balanced | autonomous)`);
  }
  return flags;
}

function printScanReport(inventory, profile, planResults) {
  console.log('\nScan complete — everything below was read locally; nothing leaves this machine.\n');

  console.log('Detected tools:');
  for (const [name, info] of Object.entries(inventory.binaries)) {
    const mark = info.found ? 'ok ' : '-- ';
    console.log(`  ${mark} ${name}${info.version ? `  (${info.version})` : ''}`);
  }

  if (inventory.identity.name) {
    console.log(`\nIdentity (git): ${inventory.identity.name}`);
  }

  const p = inventory.project;
  console.log(`\nProject: ${p.dir}`);
  if (p.isProject) {
    console.log(`  languages: ${p.languages.join(', ')}`);
    if (p.packageManager) console.log(`  package manager: ${p.packageManager}`);
    if (p.testCommand) console.log(`  tests: ${p.testCommand}`);
  } else {
    console.log('  no project markers found (global integration only)');
  }

  console.log(`\nIntegration targets: ${profile.tools.join(', ')} (scope: ${profile.scope})`);
  printResults(planResults);
}

function printResults(results) {
  for (const r of results) {
    const tag = { created: '+', updated: '~', unchanged: '=', skipped: '-', planned: '>' }[r.status];
    console.log(`  ${tag} [${r.status}] ${r.action.path}  (${r.action.adapter}: ${r.action.description})`);
    if (r.backup) console.log(`      previous version backed up to ${r.backup}`);
  }
}

export async function main(argv) {
  const [command, ...args] = argv;
  const flags = parseFlags(args);

  switch (command) {
    case 'scan':
    case undefined: {
      const inventory = runScan();
      const profile = deriveProfile(inventory, { autonomy: flags.autonomy });
      const plan = buildPlan(profile, flags.scope ?? profile.scope);
      const results = applyActions(plan, { dryRun: true });
      printScanReport(inventory, profile, results);
      const file = saveState('inventory', inventory);
      console.log(`\nInventory saved to ${file} (local only).`);
      console.log('Run `agent-primer integrate` to apply the plan above.');
      return 0;
    }

    case 'integrate': {
      const inventory = runScan();
      const profile = deriveProfile(inventory, { autonomy: flags.autonomy });
      const plan = buildPlan(profile, flags.scope ?? profile.scope);
      const results = applyActions(plan, { dryRun: flags.dryRun });
      console.log(flags.dryRun ? '\nPlan (dry run, nothing written):' : '\nIntegrated:');
      printResults(results);
      if (!flags.dryRun) {
        saveState('inventory', inventory);
        saveState('profile', profile);
        console.log(`\nState saved under ${stateDir()} (local only).`);
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
    case '--help': {
      console.log(HELP);
      return 0;
    }

    default:
      console.error(`unknown command: ${command}\n`);
      console.log(HELP);
      return 1;
  }
}
