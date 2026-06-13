# agent-primer — Design Document

**Status:** v0.2 draft · **License:** MIT · **Last updated:** 2026-06-13

agent-primer is a fully local, zero-telemetry, open-source framework that
installs on a developer's machine, **scans** it to learn how they already
work, and **integrates** into their AI coding workflows — generating and
merging memory files, permission settings, and (later) MCP wiring for every
AI tool it detects. No interview, no cloud, no account.

---

## 1. Goals and non-goals

### Goals
1. **Zero-input onboarding.** A new user runs one command and every AI CLI on
   their machine is configured with sane, safe, personalized defaults.
2. **Scan-first.** Everything is derived from local evidence: binaries on
   PATH, project markers, git config, existing config files. Questions are a
   last resort, not the interface.
3. **Strictly local.** No network code exists in the codebase — greppable and
   enforceable by test. State lives in `~/.agent-primer/` as plain JSON the
   user can read or delete.
4. **Never destructive.** A user's hand-written config must survive every
   run. (Prior art motivates this: JetBrains tracked a bug where the Codex
   agent overwrote users' custom `config.toml`, breaking their setups.)
5. **Tool-agnostic core, per-tool adapters.** Supporting a new AI tool must
   require only one new adapter file.

### Non-goals
- Not a cloud sync service, registry, or account system.
- Not a prompt library or "awesome rules" content pack.
- Not a wrapper that launches/proxies the AI tools themselves.
- Does not manage API keys or credentials (explicitly out of scope: we never
  read or write secrets).

---

## 2. Research summary: the integration surface (June 2026)

### 2.1 Claude Code (verified against code.claude.com/docs)
| Surface | Path | Strategy |
| --- | --- | --- |
| User settings | `~/.claude/settings.json` | deep-merge JSON |
| Project settings | `.claude/settings.json`; personal: `.claude/settings.local.json` | deep-merge JSON |
| User memory | `~/.claude/CLAUDE.md` | managed block |
| Project memory | `./CLAUDE.md` (also `.claude/CLAUDE.md`, `CLAUDE.local.md`) | managed block |
| Rules | `.claude/rules/*.md` (+ YAML `paths:` frontmatter, lazy-loaded) | future |
| MCP | user: `~/.claude.json` top-level `mcpServers`; project: `.mcp.json` | future (M3) |
| Skills/hooks | `~/.claude/skills/`, `.claude/skills/`; hooks in settings.json | future |

Key facts that shape the design:
- Settings precedence: managed > CLI > local > project > user; **permission
  rules merge across scopes; deny always wins** — so we can safely add rules
  at user scope without fighting project config.
- Permission rule syntax: `Bash(npm run test *)` (prefix, space-star),
  `Bash(git:*)` (colon form), `Read(./.env)` (gitignore semantics, `//` =
  absolute, `~/` = home), `WebFetch(domain:x.com)`, `mcp__server__tool`.
  `defaultMode`: `default | acceptEdits | plan | auto | dontAsk | bypassPermissions`.
- Memory imports: `@path/to/file` (max 4 hops) — **Claude Code does not read
  AGENTS.md natively**; the documented bridge is a `CLAUDE.md` containing
  `@AGENTS.md`, or a symlink.
- Detection: binary `claude`, `claude --version`, native install at
  `~/.local/bin/claude`; config dir overridable via `CLAUDE_CONFIG_DIR`.
- Claude Code itself treats `.claude/`, `.mcp.json`, shell rc files as
  protected paths — reinforcing that we write conservatively there.

### 2.2 Codex CLI (OpenAI)
- Config: `~/.codex/config.toml`; per-project `.codex/config.toml` resolved
  root-down. Keys: `model`, `approval_policy` (`untrusted | on-request |
  never`, plus granular forms), `sandbox_mode` (`read-only | workspace-write |
  danger-full-access`), `profiles`, `mcp_servers` (TOML tables).
- Memory: global `~/.codex/AGENTS.md`; project `AGENTS.md` with nested
  nearest-file precedence.
- Detection: binary `codex`, `codex --version`.
- TOML cannot be merged as safely as JSON → we only create `config.toml`
  when absent (current behavior), and in M2 gain a TOML managed-comment
  block for appending `mcp_servers` tables.

### 2.3 Gemini CLI (Google)
- Config: `~/.gemini/settings.json` (user), `.gemini/settings.json`
  (project); precedence: defaults < user < project < env < CLI flags. Values
  may reference `$ENV_VARS`. MCP via `mcpServers` object.
- Memory: `GEMINI.md` context files (global `~/.gemini/GEMINI.md`, project,
  nested); the `contextFileName` setting can point at `AGENTS.md` instead.
- Detection: binary `gemini`, `gemini --version`.
- Planned adapter (M2): managed block in `GEMINI.md` + JSON-merge of
  `~/.gemini/settings.json`. We do **not** flip `contextFileName` on users —
  changing what files their tool reads is a surprising side effect.

### 2.4 AGENTS.md convention
- Open, schema-free markdown standard (agents.md); read by 30+ tools
  including Codex, Copilot, Cursor, Gemini (via setting), Jules, Aider, Zed,
  Windsurf, Devin. Nearest file in the directory tree wins.
- This makes a project-level `AGENTS.md` the single highest-leverage
  integration: one managed block covers every tool without a dedicated
  adapter. Our generic adapter exists for exactly this.

### 2.5 Cursor (future adapter)
- Rules: `.cursor/rules/*.mdc` with frontmatter (alwaysApply / globs /
  description); legacy `.cursorrules` deprecated. Reads AGENTS.md. MCP:
  `.cursor/mcp.json`, `~/.cursor/mcp.json` (same `mcpServers` JSON shape).

### 2.6 Prior art and differentiation
| Tool | Approach | Gap we fill |
| --- | --- | --- |
| dyoshikawa/rulesync | CLI; converts a manual source-of-truth into per-tool rule files | project-rules only; no machine scan; no permissions |
| intellectronica/ruler | `.ruler/` dir distributed to agent configs; nested rules | same: user authors content; nothing derived |
| jpcaparas/rulesync | PHP rule-file syncer | same |
| mcpm / mcp-get / Smithery | MCP server installers/registries | MCP only; often cloud-backed registries |

**Nobody does scan-first, machine-level, zero-input integration.** Every
existing tool starts from content the user must write. agent-primer starts
from the machine itself and is useful with zero authored content. Pitfalls
observed in this space that we design against: destructive writes (Codex
config.toml incident), format churn (`.cursorrules` → `.mdc`; commands →
skills), and config drift between tools (solved by single derived profile).

---

## 3. Architecture

```
                ┌───────────┐   ┌──────────┐   ┌──────────────┐
  machine ───▶  │  Scanner   │──▶│ Inventory │──▶│   Deriver    │
  (PATH, git,   └───────────┘   │  (JSON)   │   └──────┬───────┘
   project           local read  └──────────┘          │ Profile (JSON)
   markers,                                            ▼
   existing                                     ┌──────────────┐
   configs)                                     │  Adapters    │  one per tool
                                                └──────┬───────┘
                                                       │ FileAction[]  (plan)
                                                       ▼
                                                ┌──────────────┐
                                                │  Executor    │  managed blocks,
                                                └──────────────┘  JSON merge,
                                                                  backups, dry-run
```

Every stage is a pure function over plain data, so each is independently
testable and the plan is fully previewable (`scan` runs the entire pipeline
in dry-run mode).

### 3.1 Data model
- **Inventory v1** (`~/.agent-primer/inventory.json`): `scannedAt, platform,
  shell, binaries{name → {found, version}}, identity{name}, project{dir,
  isProject, markers, languages, packageManager, testCommand}`.
- **Profile v2** (`~/.agent-primer/profile.json`): `identity, tools[],
  scope, autonomy, stack` — derived, never interviewed. Deleting the
  directory fully resets the tool.
- **FileAction**: `{adapter, scope, kind, path, content|data, description}`
  with kinds `upsert-block | merge-json | write-if-absent` (M2 adds
  `upsert-toml-block`).

### 3.2 Adapter contract
```js
{ id, name, binary, plan(profile, scope, cwd) -> FileAction[] }
```
Adapters own *where* and *in what format*; templates own *what* (one memory
renderer for all tools, permission presets per tool format). Registry in
`src/adapters/index.js`.

### 3.3 Derivation rules
- `tools` = adapters whose binary is on PATH; fallback `agents-md` so the
  tool is useful even before any AI CLI is installed.
- `scope` = `both` when cwd has project markers and a tool was detected;
  `project` for markers only; `global` otherwise.
- `stack` from markers: `package.json` (+`tsconfig.json` → TypeScript),
  lockfiles → package manager (`packageManager` field wins), scripts.test →
  test command; `go.mod`/`Cargo.toml`/`pyproject.toml`/`pom.xml` similarly.
- `autonomy` defaults to `cautious`; flag-overridable, never guessed upward.

### 3.4 Safety model (invariants, enforced by tests)
1. Managed blocks: we only ever edit between
   `<!-- agent-primer:begin -->` / `<!-- agent-primer:end -->`; user content
   outside survives byte-for-byte.
2. JSON is deep-merged (arrays union, scalars ours-win inside our own keys);
   never replaced.
3. TOML is never rewritten — create-if-absent only (until the comment-block
   strategy lands with tests).
4. Any changed file is first copied to `<file>.bak-<timestamp>`.
5. Re-running is idempotent: second `integrate` reports `unchanged` for all.
6. Secrets: deny-rules for `.env`/keys are emitted into tool permissions, and
   the scanner itself never opens such files.
7. No network: CI greps `src/` for `fetch|http|net|dns|tls` imports and fails
   if any appear.

---

## 4. CLI surface

| Command | Behavior |
| --- | --- |
| `agent-primer` / `scan` | full pipeline, dry-run; prints detected tools, stack, identity, and the exact integration plan; saves inventory locally |
| `integrate` | scan + write; `--dry-run` previews; saves inventory + profile |
| `help`, `version` | usual |

Flags: `--scope global|project|both`, `--autonomy cautious|balanced|autonomous`,
`--dry-run`. Distribution: `npx agent-primer` (zero-dep, no build, Node ≥ 18).

---

## 5. Roadmap

- **M1 (now):** scanner, deriver, executor; adapters: claude-code, codex,
  agents-md; permission presets; tests for all invariants in §3.4.
- **M2:** gemini adapter; `upsert-toml-block` for Codex `mcp_servers`;
  `uninstall` command (remove managed blocks, restore from backups); shell
  completion.
- **M3 (MCP wiring):** detect locally-runnable MCP servers (e.g. a project's
  own server, filesystem/git servers) and offer them per tool in their native
  config shape (`mcpServers` JSON for Claude/Gemini/Cursor, TOML for Codex)
  — local stdio servers only, consistent with the no-network rule.
- **M4:** cursor adapter (`.cursor/rules/*.mdc`); watch mode (`integrate
  --watch`) re-syncing when project markers change; `doctor`-style drift
  report (diff between plan and disk).

## 6. Open questions
1. Should the project-scope Claude memory be a `CLAUDE.md` containing
   `@AGENTS.md` (single source, Claude-official bridge) instead of a parallel
   managed block? Leaning yes for M2 — eliminates duplication.
2. Codex `approval_policy` granular forms — adopt once stabilized upstream.
3. Per-OS managed/system scopes (e.g. `/etc/claude-code/`) are intentionally
   untouched — org territory, not ours.

## 7. Sources
- Claude Code docs: code.claude.com/docs (settings, memory, permissions,
  permission-modes, mcp, hooks, skills, claude-directory, setup, env-vars)
- Codex: developers.openai.com/codex (config-basic, config-reference,
  guides/agents-md); github.com/openai/codex
- Gemini CLI: github.com/google-gemini/gemini-cli docs;
  google-gemini.github.io/gemini-cli
- AGENTS.md: agents.md; developers.openai.com/codex/guides/agents-md
- Prior art: github.com/dyoshikawa/rulesync, github.com/intellectronica/ruler,
  github.com/jpcaparas/rulesync; mcpm/mcp-get/Smithery
- Pitfall evidence: youtrack.jetbrains.com LLM-24906 (Codex overwrites
  config.toml)
