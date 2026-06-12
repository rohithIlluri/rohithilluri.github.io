// File-system primitives shared by every adapter. All writes are non-destructive:
// existing files are backed up before being changed, JSON is merged rather than
// replaced, and memory files are edited only inside a clearly marked block so
// the user's own notes are never touched.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const BLOCK_BEGIN = '<!-- agent-primer:begin (managed — edits inside this block are overwritten by `agent-primer apply`) -->';
export const BLOCK_END = '<!-- agent-primer:end -->';

/** Expand a leading "~" to the user's home directory. */
export function expandHome(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/') || p.startsWith('~\\')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

export function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Deep-merge `ours` into `base`. Objects recurse, arrays union (preserving
 * order, deduping primitives), scalars from `ours` win. Returns a new value.
 */
export function deepMerge(base, ours) {
  if (Array.isArray(base) && Array.isArray(ours)) {
    const out = [...base];
    for (const item of ours) {
      const dup = out.some(
        (x) => x === item || JSON.stringify(x) === JSON.stringify(item),
      );
      if (!dup) out.push(item);
    }
    return out;
  }
  if (isPlainObject(base) && isPlainObject(ours)) {
    const out = { ...base };
    for (const [k, v] of Object.entries(ours)) {
      out[k] = k in base ? deepMerge(base[k], v) : v;
    }
    return out;
  }
  return ours;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Insert or replace the agent-primer managed block in a document.
 * Content outside the markers is preserved verbatim.
 */
export function upsertManagedBlock(existing, content) {
  const block = `${BLOCK_BEGIN}\n${content.trim()}\n${BLOCK_END}`;
  if (existing === null || existing.trim() === '') return block + '\n';
  const begin = existing.indexOf(BLOCK_BEGIN);
  const end = existing.indexOf(BLOCK_END);
  if (begin !== -1 && end !== -1 && end > begin) {
    return (
      existing.slice(0, begin) + block + existing.slice(end + BLOCK_END.length)
    );
  }
  return existing.replace(/\s*$/, '') + '\n\n' + block + '\n';
}

function backup(file) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = `${file}.bak-${stamp}`;
  fs.copyFileSync(file, dest);
  return dest;
}

/**
 * Execute a list of file actions produced by adapters.
 * Kinds:
 *   - "upsert-block": managed-block edit of a text/markdown file
 *   - "merge-json":   deep-merge `action.data` into an existing JSON file
 *   - "write-if-absent": create the file only when it does not exist
 *
 * Returns one result per action: { action, status, backup? } where status is
 * "created" | "updated" | "unchanged" | "skipped" | "planned".
 */
export function applyActions(actions, { dryRun = false } = {}) {
  const results = [];
  for (const action of actions) {
    const file = action.path;
    const existing = readIfExists(file);
    let next;
    let status;

    if (action.kind === 'upsert-block') {
      next = upsertManagedBlock(existing, action.content);
      status = existing === null ? 'created' : next === existing ? 'unchanged' : 'updated';
    } else if (action.kind === 'merge-json') {
      const current = existing === null ? {} : JSON.parse(existing);
      const merged = deepMerge(current, action.data);
      next = JSON.stringify(merged, null, 2) + '\n';
      status = existing === null ? 'created' : next === existing ? 'unchanged' : 'updated';
    } else if (action.kind === 'write-if-absent') {
      if (existing !== null) {
        results.push({ action, status: 'skipped' });
        continue;
      }
      next = action.content;
      status = 'created';
    } else {
      throw new Error(`unknown action kind: ${action.kind}`);
    }

    if (dryRun) {
      results.push({ action, status: status === 'unchanged' ? 'unchanged' : 'planned' });
      continue;
    }
    if (status === 'unchanged') {
      results.push({ action, status });
      continue;
    }

    fs.mkdirSync(path.dirname(file), { recursive: true });
    const backupPath = status === 'updated' ? backup(file) : undefined;
    fs.writeFileSync(file, next);
    results.push({ action, status, backup: backupPath });
  }
  return results;
}
