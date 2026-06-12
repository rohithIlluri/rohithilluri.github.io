// Adapter for Anthropic's Claude Code CLI.
// Memory:      ~/.claude/CLAUDE.md (global) / ./CLAUDE.md (project)
// Permissions: ~/.claude/settings.json / ./.claude/settings.json
import os from 'node:os';
import path from 'node:path';
import { renderMemory } from '../templates/memory.js';
import { claudeSettings } from '../templates/permissions.js';

export default {
  id: 'claude-code',
  name: 'Claude Code',
  binary: 'claude',

  plan(profile, scope, cwd) {
    const root =
      scope === 'global' ? path.join(os.homedir(), '.claude') : path.join(cwd, '.claude');
    const memoryFile =
      scope === 'global'
        ? path.join(root, 'CLAUDE.md')
        : path.join(cwd, 'CLAUDE.md');

    return [
      {
        adapter: this.id,
        scope,
        kind: 'upsert-block',
        path: memoryFile,
        content: renderMemory(profile),
        description: 'memory file (preferences, stack, guardrails)',
      },
      {
        adapter: this.id,
        scope,
        kind: 'merge-json',
        path: path.join(root, 'settings.json'),
        data: claudeSettings(profile),
        description: 'permission settings',
      },
    ];
  },
};
