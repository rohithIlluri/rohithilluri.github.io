// Generic adapter: maintains a project-level AGENTS.md, the emerging shared
// convention read by many AI tools (Cursor, Gemini CLI, Zed, ...). Use this
// when the user's tool has no dedicated adapter yet.
import path from 'node:path';
import { renderMemory } from '../templates/memory.js';

export default {
  id: 'agents-md',
  name: 'Generic AGENTS.md',
  binary: null,

  plan(profile, scope, cwd) {
    if (scope === 'global') return [];
    return [
      {
        adapter: this.id,
        scope,
        role: 'memory',
        kind: 'upsert-block',
        path: path.join(cwd, 'AGENTS.md'),
        content: renderMemory(profile),
        description: 'project memory file (read by most AI coding tools)',
      },
    ];
  },
};
