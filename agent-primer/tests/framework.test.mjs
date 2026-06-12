import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultProfile } from '../src/profile.js';
import { renderMemory } from '../src/templates/memory.js';
import { claudeSettings, codexConfigToml } from '../src/templates/permissions.js';
import { buildPlan, getAdapter } from '../src/adapters/index.js';

test('renderMemory: reflects level, stack, behavior, and facts', () => {
  const profile = defaultProfile();
  profile.user.name = 'Rohith';
  profile.memory.facts.push('I prefer pnpm');
  const md = renderMemory(profile);
  assert.ok(md.includes('Rohith'));
  assert.ok(md.includes('new to professional software development'), 'beginner intro');
  assert.ok(md.includes('npm test'));
  assert.ok(md.includes('I prefer pnpm'));
  assert.ok(md.includes('Conventional Commits'));

  profile.user.level = 'advanced';
  profile.behavior.explainSteps = false;
  const adv = renderMemory(profile);
  assert.ok(adv.includes('experienced developer'));
  assert.ok(!adv.includes('Explain your plan'));
});

test('claudeSettings: permissions scale with autonomy, secrets always denied', () => {
  const profile = defaultProfile();

  const cautious = claudeSettings(profile);
  assert.equal(cautious.permissions.defaultMode, undefined);
  assert.ok(!cautious.permissions.allow.some((r) => r.includes('git push')));

  profile.behavior.autonomy = 'autonomous';
  const auto = claudeSettings(profile);
  assert.equal(auto.permissions.defaultMode, 'acceptEdits');
  assert.ok(auto.permissions.allow.some((r) => r.includes('git push')));

  for (const s of [cautious, auto]) {
    assert.ok(s.permissions.deny.some((r) => r.includes('.env')));
  }
});

test('codexConfigToml: maps autonomy to approval policy', () => {
  const profile = defaultProfile();
  assert.ok(codexConfigToml(profile).includes('approval_policy = "untrusted"'));
  profile.behavior.autonomy = 'balanced';
  assert.ok(codexConfigToml(profile).includes('sandbox_mode = "workspace-write"'));
});

test('buildPlan: covers every selected tool in every requested scope', () => {
  const profile = defaultProfile();
  profile.tools = ['claude-code', 'codex', 'agents-md'];
  const cwd = '/tmp/proj';
  const plan = buildPlan(profile, 'both', cwd);

  const paths = plan.map((a) => a.path);
  assert.ok(paths.some((p) => p.endsWith('.claude/CLAUDE.md')), 'global claude memory');
  assert.ok(paths.some((p) => p === `${cwd}/CLAUDE.md`), 'project claude memory');
  assert.ok(paths.some((p) => p.endsWith('.claude/settings.json')));
  assert.ok(paths.some((p) => p.endsWith('.codex/config.toml')));
  assert.ok(paths.some((p) => p === `${cwd}/AGENTS.md`));

  const projectOnly = buildPlan(profile, 'project', cwd);
  assert.ok(projectOnly.every((a) => a.scope === 'project'));
  assert.ok(!projectOnly.some((a) => a.path.includes('.codex/config.toml')));
});

test('getAdapter: helpful error for unknown tools', () => {
  assert.throws(() => getAdapter('cursor'), /known tools: claude-code, codex, agents-md/);
});
