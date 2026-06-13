// Turns a scan inventory into a profile — the bridge between "what is on
// this machine" and "what should be configured". No questions asked: every
// field is derived from local evidence, with safe fallbacks.
import { adapters } from './adapters/index.js';

export function deriveProfile(inventory, { autonomy = 'cautious' } = {}) {
  const detected = adapters
    .filter((a) => a.binary && inventory.binaries[a.binary]?.found)
    .map((a) => a.id);

  // No known AI CLI installed: still useful — maintain the shared AGENTS.md
  // convention that most tools (Cursor, Gemini CLI, Zed, ...) read.
  const tools = detected.length > 0 ? detected : ['agents-md'];

  // Integrate where the user actually works: inside a project, configure the
  // project too; otherwise only touch global configs.
  const scope = inventory.project.isProject
    ? detected.length > 0
      ? 'both'
      : 'project'
    : 'global';

  return {
    version: 2,
    derivedAt: new Date().toISOString(),
    identity: { name: inventory.identity.name || '' },
    tools,
    scope,
    autonomy,
    stack: {
      languages: inventory.project.languages,
      packageManager: inventory.project.packageManager,
      testCommand: inventory.project.testCommand,
    },
  };
}
