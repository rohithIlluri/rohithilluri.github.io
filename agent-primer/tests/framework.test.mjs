import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanProject } from '../src/scan.js';
import { deriveProfile } from '../src/derive.js';
import { renderMemory } from '../src/templates/memory.js';
import { claudeSettings, codexConfigToml } from '../src/templates/permissions.js';
import { buildPlan, getAdapter } from '../src/adapters/index.js';

function makeProfile(overrides = {}) {
  return {
    version: 2,
    derivedAt: new Date().toISOString(),
    identity: { name: 'Rohith' },
    tools: ['claude-code'],
    scope: 'global',
    autonomy: 'cautious',
    stack: { languages: ['TypeScript'], packageManager: 'npm', testCommand: 'npm test' },
    ...overrides,
  };
}

function makeInventory(overrides = {}) {
  return {
    scannedAt: new Date().toISOString(),
    platform: 'linux',
    shell: '/bin/bash',
    binaries: {
      claude: { found: true, version: 'Claude Code 2.1.0' },
      codex: { found: false, version: null },
    },
    identity: { name: 'Rohith' },
    project: {
      dir: '/tmp/proj',
      isProject: true,
      markers: ['package.json'],
      languages: ['TypeScript'],
      packageManager: 'pnpm',
      testCommand: 'pnpm test',
    },
    ...overrides,
  };
}

test('scanProject: detects languages, package manager, and test command from markers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'primer-proj-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ scripts: { test: 'node --test' } }),
  );
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), '{}');
  fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
  fs.writeFileSync(path.join(dir, 'go.mod'), 'module example.com/x');

  const p = scanProject(dir);
  assert.equal(p.isProject, true);
  assert.deepEqual(p.languages, ['TypeScript', 'Go']);
  assert.equal(p.packageManager, 'pnpm');
  assert.equal(p.testCommand, 'pnpm test');

  const empty = scanProject(fs.mkdtempSync(path.join(os.tmpdir(), 'primer-empty-')));
  assert.equal(empty.isProject, false);
  assert.deepEqual(empty.languages, []);
});

test('scanProject: npm default placeholder test script is ignored', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'primer-placeholder-'));
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ scripts: { test: 'echo "Error: no test specified" && exit 1' } }),
  );
  assert.equal(scanProject(dir).testCommand, '');
});

test('deriveProfile: detected tools, scope from context, safe defaults', () => {
  const inv = makeInventory();
  const profile = deriveProfile(inv);
  assert.deepEqual(profile.tools, ['claude-code'], 'only detected tools');
  assert.equal(profile.scope, 'both', 'tool detected + in a project');
  assert.equal(profile.autonomy, 'cautious', 'never guessed upward');
  assert.equal(profile.identity.name, 'Rohith');
  assert.equal(profile.stack.packageManager, 'pnpm');

  const noTools = deriveProfile(
    makeInventory({ binaries: { claude: { found: false }, codex: { found: false } } }),
  );
  assert.deepEqual(noTools.tools, ['agents-md'], 'fallback to shared convention');
  assert.equal(noTools.scope, 'project');

  const noProject = deriveProfile(
    makeInventory({ project: { dir: '/x', isProject: false, markers: [], languages: [], packageManager: '', testCommand: '' } }),
  );
  assert.equal(noProject.scope, 'global');
});

test('renderMemory: reflects identity, detected stack, and guardrails', () => {
  const md = renderMemory(makeProfile());
  assert.ok(md.includes('Rohith'));
  assert.ok(md.includes('TypeScript'));
  assert.ok(md.includes('npm test'));
  assert.ok(md.includes('generated locally'));
  assert.ok(md.includes('secrets'));

  const bare = renderMemory(
    makeProfile({ identity: { name: '' }, stack: { languages: [], packageManager: '', testCommand: '' } }),
  );
  assert.ok(!bare.includes('My stack'), 'no stack section without detections');
  assert.ok(bare.includes('Guardrails'), 'guardrails always present');
});

test('claudeSettings: permissions scale with autonomy, secrets always denied', () => {
  const cautious = claudeSettings(makeProfile());
  assert.equal(cautious.permissions.defaultMode, undefined);
  assert.ok(!cautious.permissions.allow.some((r) => r.includes('git push')));

  const auto = claudeSettings(makeProfile({ autonomy: 'autonomous' }));
  assert.equal(auto.permissions.defaultMode, 'acceptEdits');
  assert.ok(auto.permissions.allow.some((r) => r.includes('git push')));

  for (const s of [cautious, auto]) {
    assert.ok(s.permissions.deny.some((r) => r.includes('.env')));
  }
});

test('codexConfigToml: maps autonomy to approval policy and sandbox', () => {
  assert.ok(codexConfigToml(makeProfile()).includes('approval_policy = "untrusted"'));
  assert.ok(codexConfigToml(makeProfile()).includes('sandbox_mode = "read-only"'));
  const balanced = codexConfigToml(makeProfile({ autonomy: 'balanced' }));
  assert.ok(balanced.includes('sandbox_mode = "workspace-write"'));
});

test('buildPlan: covers every selected tool in every requested scope', () => {
  const profile = makeProfile({ tools: ['claude-code', 'codex', 'agents-md'] });
  const cwd = '/tmp/proj';
  const plan = buildPlan(profile, 'both', cwd);

  const paths = plan.map((a) => a.path);
  assert.ok(paths.some((p) => p.endsWith(path.join('.claude', 'CLAUDE.md'))), 'global claude memory');
  assert.ok(paths.some((p) => p === path.join(cwd, 'CLAUDE.md')), 'project claude memory');
  assert.ok(paths.some((p) => p.endsWith(path.join('.claude', 'settings.json'))));
  assert.ok(paths.some((p) => p.endsWith(path.join('.codex', 'config.toml'))));
  assert.ok(paths.some((p) => p === path.join(cwd, 'AGENTS.md')));

  const projectOnly = buildPlan(profile, 'project', cwd);
  assert.ok(projectOnly.every((a) => a.scope === 'project'));
  assert.ok(!projectOnly.some((a) => a.path.includes('config.toml')));
});

test('getAdapter: helpful error for unknown tools', () => {
  assert.throws(() => getAdapter('cursor'), /known tools: claude-code, codex, agents-md/);
});

test('invariant: no network code anywhere in src/', () => {
  const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
  const offenders = [];
  const banned = /node:(https?|net|dns|tls|dgram)\b|\bfetch\s*\(/;
  for (const file of fs.readdirSync(srcDir, { recursive: true })) {
    const full = path.join(srcDir, String(file));
    if (!full.endsWith('.js') || !fs.statSync(full).isFile()) continue;
    if (banned.test(fs.readFileSync(full, 'utf8'))) offenders.push(String(file));
  }
  assert.deepEqual(offenders, [], 'src/ must contain no network primitives');
});
