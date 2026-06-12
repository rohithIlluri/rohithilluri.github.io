// Adapter registry. To support a new AI tool, create a module exporting
// { id, name, binary, plan(profile, scope, cwd) } and register it here.
import claudeCode from './claude-code.js';
import codex from './codex.js';
import agentsMd from './agents-md.js';

export const adapters = [claudeCode, codex, agentsMd];

export function getAdapter(id) {
  const adapter = adapters.find((a) => a.id === id);
  if (!adapter) {
    throw new Error(
      `unknown tool "${id}" — known tools: ${adapters.map((a) => a.id).join(', ')}`,
    );
  }
  return adapter;
}

/**
 * Build the full file-action plan for a profile.
 * scope: "global" | "project" | "both"
 */
export function buildPlan(profile, scope = profile.scope, cwd = process.cwd()) {
  const scopes = scope === 'both' ? ['global', 'project'] : [scope];
  const plan = [];
  for (const id of profile.tools) {
    const adapter = getAdapter(id);
    for (const s of scopes) {
      plan.push(...adapter.plan(profile, s, cwd));
    }
  }
  return plan;
}
