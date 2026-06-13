# agent-primer — Decentralized Product Vision

**Status:** vision draft · **Pairs with:** DESIGN.md (current implementation)

This document answers one question: *what does agent-primer look like as a
decentralized, community-owned product with the structural properties of
Linux* — an open core, no central authority, competing distributions, and
reproducible state — *rather than a single vendor CLI?*

It is deliberately staged. The early milestones are shippable increments of
the code that exists today (and happen to fix the correctness bugs found in
the backend analysis); the later ones describe the decentralized end state.
Each milestone is independently viable — you could stop at any of them and
have a real product.

---

## 1. The Linux analogy, mapped to concrete mechanics

Linux is "decentralized" in specific, copyable ways. Each maps to a concrete
agent-primer mechanism:

| Linux property | Mechanism | agent-primer equivalent |
| --- | --- | --- |
| Stable kernel ABI | syscalls don't break userland | Frozen **Adapter ABI** + **FileAction/Profile schemas** — the contract third-party packages compile against |
| Userland is separate from kernel | packages, not built-ins | **Adapters, presets, MCP bundles are packages**, not baked into core |
| No central app store | apt/pacman point at *any* mirror | **Content-addressed packages** fetched over *any* transport; no canonical server |
| Distributions | Debian, Arch, Fedora curate | **Distros**: forkable manifests bundling core + packages for a persona |
| Reproducible systems (NixOS) | declarative config + lockfile | **Manifest + lockfile** pin exact package hashes → same inputs, same machine state |
| Rollback / generations (NixOS) | boot into previous generation | **Generations**: every apply is immutable + reversible (`rollback`) |
| POSIX | a spec, many implementations | The schemas become an **open spec**; the JS engine is the *reference* kernel, reimplementable in Rust/Go |

The throughline: **trust and authority live in artifacts the user holds (a
hash, a signature, a manifest), never in a server the project operates.** That
is what "completely decentralized" means here, and it is *stronger* than the
current "highly local" property, not in tension with it.

---

## 2. Reconciling "decentralized" with "no network code"

The current engine has a hard invariant — no network primitives in `src/`,
enforced by a test. A package ecosystem seems to need fetching. These are
reconciled by splitting two planes that today are one:

- **Apply plane (the kernel).** Operates only on packages already present in
  the local store. Stays 100% network-free; the invariant test stays green.
  This is the part that touches your machine.
- **Fetch plane (a channel).** A separate, optional, clearly-bounded component
  that *acquires* packages. Because packages are content-addressed and signed,
  the fetch can use **any transport** — `git clone`, a tarball URL, a LAN
  mirror, IPFS, or a USB stick — and the apply plane verifies the hash offline
  before trusting a byte. You can run the entire product air-gapped by placing
  packages in the store yourself.

So decentralization *reinforces* locality: the root of trust is a hash you
pin, verified on your disk, not a call to anyone's API.

---

## 3. Core primitives (the "kernel")

These harden the existing `scan → derive → plan → execute` pipeline into a
stable foundation. Two of them are the fixes for the backend-analysis findings.

1. **Profile / Manifest.** Today the profile is *derived* from a scan. It
   becomes a first-class **manifest** (`agent-primer.toml`) describing desired
   state declaratively: which packages, which scope, which presets. Scan-first
   stays the default (zero-input onboarding generates the manifest for you);
   power users hand-edit it. This is the NixOS "configuration.nix" role.

2. **Content-addressed store.** Packages live immutably at
   `~/.agent-primer/store/<sha256>/`. Immutable + hashed = reproducible and
   cache-safe, exactly like `/nix/store`.

3. **Lockfile.** `agent-primer.lock` records the resolved hash of every
   package so a manifest reproduces the same configuration on any machine.

4. **Generations + atomic apply.** *(Fixes analysis finding #2 — no
   transactional safety.)* Each `apply` computes all file contents first
   (the pure stage cannot half-fail), then commits them as one immutable
   **generation**: a manifest of every path written, its prior content, and
   the package set that produced it. `rollback` restores the previous
   generation wholesale. This turns the current best-effort, mid-plan-abortable
   writer into an all-or-nothing switch with history — and gives the product
   its killer feature.

5. **Authoritative managed regions.** *(Fixes analysis finding #1 — the
   permissions ratchet.)* The engine must *own* its slice of every config file
   so it can tighten and remove, not only add. Memory files already do this
   (managed block). JSON settings get the same treatment: agent-primer writes
   an authoritative managed subtree (replacing what it manages, preserving
   everything else), instead of a blind union that can never shrink. A package
   declares which keys/regions it owns; the rest of the file is untouched.

6. **Adapter ABI (frozen).** `{ id, name, binary, detect(), plan(profile,
   scope, ctx) }` plus the FileAction kinds become a versioned, documented
   contract. This is the kernel/userland boundary: freeze it and third parties
   can ship adapters forever without coordinating with core.

---

## 4. Packages

A package is a directory (or git repo / tarball) with a small `package.toml`
and code/data. Four kinds, all distributed the same way:

- **Adapter** — teaches the engine a new tool (Cursor, Windsurf, Zed, JetBrains
  AI, Aider…). Implements the Adapter ABI.
- **Preset** — a named bundle of permission rules / autonomy policy (e.g.
  "security-hardened", "data-science").
- **Module** — memory content fragments (house style, language conventions)
  that compose into the managed block.
- **MCP bundle** — declarative MCP server wiring rendered into each tool's
  native MCP config (Claude `~/.claude.json`, Codex `mcp_servers`, Cursor
  `.cursor/mcp.json`). Local-stdio servers only, consistent with §2.

Packages declare a `for-abi` version and are verified by hash + optional
signature before the store accepts them. Core ships a *reference* set only;
everything else is community-published.

---

## 5. Decentralized distribution

- **No registry.** A "source" is any URL, git ref, or local path. There is no
  server agent-primer must run, no namespace it owns, no gatekeeper. Competing
  indexes can exist, but none is canonical — like apt mirrors or AUR vs. a
  curated repo.
- **Trust by artifact.** Integrity = content hash (always). Authenticity =
  detached signature (minisign/ssh-sig) the user pins per source. Both verified
  offline. A malicious mirror cannot alter a pinned package without failing the
  hash.
- **Distros.** A distro is just a published manifest + lockfile: "agent-primer
  beginner", "agent-primer hardened", "agent-primer polyglot". Anyone forks and
  republishes. The reference distro is one option, not the option.
- **Governance as spec.** The Profile/FileAction/Adapter/package schemas become
  an open specification (the way AGENTS.md itself is an open convention). The JS
  engine is the reference implementation; a Rust or Go kernel that passes the
  conformance suite is equally legitimate. Decentralized governance, not a
  vendor roadmap.

---

## 6. Why this is genuinely viable (not a fantasy)

- It is **incremental**: every milestone below ships value on its own, and the
  first two are just hardening of code that already runs.
- It **reuses the existing seams**: the adapter/plan/executor split already
  separates "what to write" from "how to write it"; packages are that split
  taken to its conclusion.
- It **converges with the bug fixes**: generations (§3.4) and authoritative
  regions (§3.5) are the analysis findings #2 and #1. We were going to build
  them anyway; the vision just reframes them as the foundation.
- The **no-server** stance removes the hardest part of most "platform" plays —
  there's no backend to operate, fund, or secure, and nothing to shut down.

### Honest risks
- **Third-party packages execute/write config.** An adapter is code; a bad one
  can write hostile permission rules. Mitigations: signatures, a capability
  declaration in `package.toml` (which files/scopes it may touch), a dry-run
  diff before every apply, and generations for instant rollback. This must be
  designed in from MVP, not bolted on.
- **ABI churn.** If the adapter contract isn't stable, the ecosystem can't
  form. Freezing it early (even with a small surface) matters more than feature
  breadth.
- **Spec/implementation drift** if multiple kernels appear — needs a
  conformance test suite as the source of truth.

---

## 7. Milestones

- **M-A — Hardened kernel *(next; also fixes analysis #1, #2, #4)***
  Atomic generations + `rollback`; authoritative managed regions for JSON;
  project-root resolution; freeze the Adapter ABI v1. Single repo, no fetch,
  no store yet. Shippable, and makes the safety claims true.
- **M-B — Local store + declarative manifest**
  `agent-primer.toml` + `agent-primer.lock`; content-addressed store; load
  adapters/presets from local store paths. Reproducible. Still network-free —
  you place packages yourself.
- **M-C — Decentralized channels**
  Fetch packages from git/URL by hash + signature, verified offline; isolated
  in the fetch plane so the apply core stays network-free. Distros as forkable
  manifests. This is the "completely decentralized" milestone.
- **M-D — Open spec + conformance suite**
  Publish the schemas as a versioned spec; ship a conformance test so alternate
  kernels (Rust/Go) and third-party packages can self-certify.

---

## 8. Recommendation

Build **M-A next.** It is the highest-leverage step: it makes the product's
current promises true (authoritative permissions, all-or-nothing applies with
rollback), it is bounded and testable, and it lays the kernel foundation every
later milestone depends on — without committing to any network, registry, or
governance machinery before the core earns it.
