import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  deepMerge,
  upsertManagedBlock,
  applyActions,
  BLOCK_BEGIN,
  BLOCK_END,
} from '../src/fsutil.js';

test('deepMerge: scalars from ours win, objects recurse, arrays union', () => {
  const base = {
    a: 1,
    nested: { keep: true, mode: 'old' },
    list: ['x', 'y'],
  };
  const ours = { a: 2, nested: { mode: 'new' }, list: ['y', 'z'] };
  const merged = deepMerge(base, ours);
  assert.deepEqual(merged, {
    a: 2,
    nested: { keep: true, mode: 'new' },
    list: ['x', 'y', 'z'],
  });
  assert.deepEqual(base.list, ['x', 'y'], 'inputs are not mutated');
});

test('upsertManagedBlock: creates, replaces, preserves user content', () => {
  const first = upsertManagedBlock(null, 'hello');
  assert.ok(first.includes(BLOCK_BEGIN) && first.includes('hello'));

  const withUserNotes = `# My own notes\n\n${first}`;
  const replaced = upsertManagedBlock(withUserNotes, 'updated');
  assert.ok(replaced.includes('# My own notes'), 'user content preserved');
  assert.ok(replaced.includes('updated'));
  assert.ok(!replaced.includes('hello'), 'old managed content replaced');
  assert.equal(replaced.indexOf(BLOCK_BEGIN), replaced.lastIndexOf(BLOCK_BEGIN), 'exactly one block');

  const appended = upsertManagedBlock('# Existing file without block', 'body');
  assert.ok(appended.startsWith('# Existing file without block'));
  assert.ok(appended.includes(BLOCK_END));
});

test('applyActions: idempotent, backs up on change, respects dry-run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'primer-'));
  const md = path.join(dir, 'MEMORY.md');
  const json = path.join(dir, 'settings.json');
  const actions = [
    { adapter: 't', scope: 'global', kind: 'upsert-block', path: md, content: 'v1', description: '' },
    { adapter: 't', scope: 'global', kind: 'merge-json', path: json, data: { a: [1] }, description: '' },
  ];

  const dry = applyActions(actions, { dryRun: true });
  assert.ok(dry.every((r) => r.status === 'planned'));
  assert.ok(!fs.existsSync(md), 'dry run writes nothing');

  const first = applyActions(actions);
  assert.ok(first.every((r) => r.status === 'created'));

  const second = applyActions(actions);
  assert.ok(second.every((r) => r.status === 'unchanged'), 'reapply is a no-op');

  const changed = applyActions([
    { ...actions[0], content: 'v2' },
    { adapter: 't', scope: 'global', kind: 'merge-json', path: json, data: { a: [2] }, description: '' },
  ]);
  assert.ok(changed.every((r) => r.status === 'updated' && r.backup));
  assert.deepEqual(JSON.parse(fs.readFileSync(json, 'utf8')), { a: [1, 2] });

  const skip = applyActions([
    { adapter: 't', scope: 'global', kind: 'write-if-absent', path: json, content: 'nope', description: '' },
  ]);
  assert.equal(skip[0].status, 'skipped');
});
