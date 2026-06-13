// Adapter for OpenAI's Codex CLI.
// Memory: ~/.codex/AGENTS.md (global) / ./AGENTS.md (project)
// Config: ~/.codex/config.toml — created only if missing, since TOML cannot be
// safely merged the way JSON can.
import os from 'node:os';
import path from 'node:path';
import { renderMemory } from '../templates/memory.js';
import { codexConfigToml } from '../templates/permissions.js';

export default {
  id: 'codex',
  name: 'Codex CLI',
  binary: 'codex',

  plan(profile, scope, cwd) {
    if (scope === 'project') {
      return [
        {
          adapter: this.id,
          scope,
          role: 'memory',
          kind: 'upsert-block',
          path: path.join(cwd, 'AGENTS.md'),
          content: renderMemory(profile),
          description: 'project memory file',
        },
      ];
    }
    const root = path.join(os.homedir(), '.codex');
    return [
      {
        adapter: this.id,
        scope,
        role: 'memory',
        kind: 'upsert-block',
        path: path.join(root, 'AGENTS.md'),
        content: renderMemory(profile),
        description: 'memory file (preferences, stack, guardrails)',
      },
      {
        adapter: this.id,
        scope,
        kind: 'write-if-absent',
        path: path.join(root, 'config.toml'),
        content: codexConfigToml(profile),
        description: 'approval/sandbox config (only created if missing)',
      },
    ];
  },
};
