# agent-primer

**One preference interview. Every AI coding tool configured.**

agent-primer is a small framework that sets up AI coding CLIs (Claude Code,
Codex CLI, and anything that reads `AGENTS.md`) for people who are new to
them. It asks you a few plain-language questions, stores the answers in a
single memory store, and writes each tool's native config — memory files,
permission settings, safety guardrails — tuned to your experience level.

Zero dependencies. No build step. Node 18+.

## Quick start

```bash
npx agent-primer init        # interview → configs for every tool you use
npx agent-primer init --defaults   # skip the interview, safe beginner setup
```

That's it. Open Claude Code or Codex and it already knows your name, your
stack, how much explanation you want, and what it must never do.

## Why

New users get the worst defaults: the AI doesn't know their experience level,
permission prompts are confusing, and nothing remembers their preferences
across tools. agent-primer fixes that with three ideas:

1. **One profile, many tools.** Your preferences live in
   `~/.agent-primer/profile.json`. Adapters translate it into each tool's
   native format, so they never drift apart.
2. **Skill-aware guardrails.** A beginner profile makes tools explain every
   step and ask before anything risky; an advanced profile gets out of the
   way. Permissions scale the same way (cautious → balanced → autonomous),
   and secret files (`.env`, keys) are always denied.
3. **A memory store that syncs.** `agent-primer remember "I prefer pnpm"`
   adds a fact once and pushes it to every tool's memory file.

## Commands

| Command | What it does |
| --- | --- |
| `init` | Interview, save profile, write all configs |
| `apply` | Re-write configs from the saved profile (idempotent) |
| `remember "fact"` | Add a fact to the memory store and sync all tools |
| `forget <n>` | Remove fact *n* (numbers shown by `show`) |
| `show` | Print the saved profile |
| `doctor` | Check Node version, installed CLIs, config health |

Flags: `--dry-run` (preview without writing), `--scope global|project|both`,
`--defaults` (non-interactive init).

## What gets written

| Tool | Memory | Permissions |
| --- | --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` / `./CLAUDE.md` | `settings.json` (allow/deny rules, default mode) |
| Codex CLI | `~/.codex/AGENTS.md` / `./AGENTS.md` | `config.toml` (approval policy, sandbox) — created only if missing |
| Generic | `./AGENTS.md` | — |

Writes are never destructive: memory files are edited only inside a marked
`agent-primer` block (your own notes are untouched), JSON settings are
deep-merged, and any changed file is backed up first (`*.bak-<timestamp>`).

## Architecture

```
Profile (memory store)  →  Adapters (one per tool)  →  Plan (file actions)  →  Executor (safe writes)
```

- `src/profile.js` — the store: load/save/validate `profile.json`
- `src/wizard.js` — the interview that builds a profile
- `src/adapters/` — **the extension point.** An adapter is
  `{ id, name, binary, plan(profile, scope, cwd) }` returning file actions.
  Add a file here + one line in `adapters/index.js` to support a new tool.
- `src/templates/` — renders the profile into markdown memory and
  permission presets
- `src/fsutil.js` — managed-block upserts, JSON deep-merge, backups, dry-run

### Adding an adapter

```js
// src/adapters/mytool.js
import { renderMemory } from '../templates/memory.js';

export default {
  id: 'mytool',
  name: 'My Tool',
  binary: 'mytool',
  plan(profile, scope, cwd) {
    return [{
      adapter: this.id, scope,
      kind: 'upsert-block',                  // or merge-json / write-if-absent
      path: `${cwd}/.mytool/MEMORY.md`,
      content: renderMemory(profile),
      description: 'memory file',
    }];
  },
};
```

## Development

```bash
npm test   # node:test suite, no dependencies
```
