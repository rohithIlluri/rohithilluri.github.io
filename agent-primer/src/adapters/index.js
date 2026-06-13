// Adapter registry. To support a new AI tool, create a module exporting
// { id, name, binary, plan(profile, scope, cwd) } and register it here.
import path from 'node:path';
import claudeCode from './claude-code.js';
import codex from './codex.js';
import agentsMd from './agents-md.js';
import { renderImportStub } from '../templates/memory.js';

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
 * Unify project-scope memory onto a single AGENTS.md.
 *
 * Adapters each emit their own memory file independently, so a user with
 * several tools would get the same instructions duplicated across CLAUDE.md
 * and AGENTS.md — two blocks to drift apart. When a project AGENTS.md is in
 * the plan (the open convention 30+ tools read), it becomes the one source of
 * truth: duplicate AGENTS.md writes collapse to one, and every other
 * project-scope memory file (CLAUDE.md) is rewritten to a thin `@AGENTS.md`
 * import. If no AGENTS.md is present (e.g. Claude Code is the only tool), each
 * memory file keeps its full content — no point importing a file that won't
 * exist.
 */
function unifyProjectMemory(plan) {
  const canonical = plan.find(
    (a) => a.scope === 'project' && a.role === 'memory' && path.basename(a.path) === 'AGENTS.md',
  );
  if (!canonical) return plan;

  const out = [];
  const writtenAgents = new Set();
  for (const action of plan) {
    const isProjectMemory = action.scope === 'project' && action.role === 'memory';
    if (!isProjectMemory) {
      out.push(action);
      continue;
    }
    if (path.basename(action.path) === 'AGENTS.md') {
      if (writtenAgents.has(action.path)) continue; // collapse duplicates
      writtenAgents.add(action.path);
      out.push(action);
      continue;
    }
    // A non-AGENTS memory file (CLAUDE.md): rewrite to import the canonical one.
    const target = path.relative(path.dirname(action.path), canonical.path) || 'AGENTS.md';
    out.push({
      ...action,
      content: renderImportStub(target),
      description: `${action.description} → imports ${target}`,
    });
  }
  return out;
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
  return unifyProjectMemory(plan);
}
