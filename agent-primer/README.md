# agent-primer

**Scans your machine. Integrates into your AI workflows. Nothing leaves your disk.**

agent-primer is an open-source (MIT), fully local framework that sets up AI
coding CLIs automatically. It detects which tools you have (Claude Code,
Codex CLI, anything that reads `AGENTS.md`), learns how you work from local
evidence — git identity, project markers, lockfiles — and writes each tool's
native config: memory files, permission settings, safety guardrails. No
interview, no account, no telemetry, no network code at all.

Zero dependencies. No build step. Node 18+.

## Quick start

```bash
npx agent-primer scan        # read-only: what's installed + what would change
npx agent-primer integrate   # write/merge configs for every detected tool
```

## How it works

```
Scanner → Inventory → Deriver → Adapters → Plan → Safe writes
```

1. **Scan.** Detects AI CLIs on PATH (with versions), your git identity, and
   the current project's stack (languages, package manager, test command)
   from markers like `package.json`, lockfiles, `go.mod`, `Cargo.toml`.
2. **Derive.** Turns the inventory into a profile — which tools to target,
   global vs. project scope, what the memory files should say. Every field
   comes from evidence; safe fallbacks otherwise.
3. **Integrate.** Adapters render the profile into each tool's native format
   and an executor applies the plan non-destructively.

| Tool | Memory | Settings |
| --- | --- | --- |
| Claude Code | `~/.claude/CLAUDE.md` / `./CLAUDE.md` | `settings.json` permission rules (deep-merged) |
| Codex CLI | `~/.codex/AGENTS.md` / `./AGENTS.md` | `config.toml` approval/sandbox (created only if missing) |
| 30+ other tools | `./AGENTS.md` (shared open convention) | — |

**One source of truth.** At project scope, agent-primer unifies memory onto a
single `AGENTS.md` (the open standard 30+ tools read) and points Claude Code's
`CLAUDE.md` at it with a one-line `@AGENTS.md` import — so your instructions
live in exactly one file instead of drifting across duplicates. If Claude Code
is your only tool, `CLAUDE.md` just holds the content directly.

## Local-first guarantees

- **No network.** There is no network code in this project — a test fails CI
  if any network primitive appears in `src/`.
- **No surprises.** Memory files are edited only inside a marked
  `agent-primer` block; your own notes survive byte-for-byte. JSON settings
  are deep-merged, never replaced. TOML is never rewritten. Every changed
  file is backed up first (`*.bak-<timestamp>`).
- **Idempotent.** Running `integrate` twice reports `unchanged` everywhere.
- **Inspectable.** All state is plain JSON under `~/.agent-primer/`. Delete
  the directory and agent-primer forgets everything.
- **Secrets stay secret.** The scanner never opens `.env`/key files, and the
  permission rules it writes deny AI tools access to them too.

## Commands

| Command | What it does |
| --- | --- |
| `scan` (default) | Detect tools + stack, show the exact integration plan (dry) |
| `integrate` | Apply the plan; `--dry-run` to preview |
| `version`, `help` | The usual |

Flags: `--scope global|project|both`, `--autonomy cautious|balanced|autonomous`
(permission preset; default cautious), `--dry-run`.

## Extending

An adapter is one file: `{ id, name, binary, plan(profile, scope, cwd) }`
returning file actions (`upsert-block`, `merge-json`, `write-if-absent`).
Register it in `src/adapters/index.js` and both `scan` detection and
`integrate` pick it up. See [DESIGN.md](DESIGN.md) for the full architecture,
research notes on each tool's config surface, safety invariants, and roadmap
(Gemini CLI and Cursor adapters, MCP wiring, uninstall).

## Development

```bash
npm test   # node:test suite — pipeline, adapters, safety invariants
```

MIT — see [LICENSE](LICENSE).
