// Renders a derived profile into the markdown that goes inside the managed
// block of every memory file (CLAUDE.md, AGENTS.md, ...). One renderer for
// all tools: these files are plain-language instructions, so the same text
// works everywhere.

const GUARDRAILS = [
  'Before running any command that deletes, overwrites, or force-pushes anything, stop and explain what it does and why it is needed.',
  'Make small, focused changes. Prefer several small steps over one big rewrite.',
  'Ask before adding a new dependency, and explain what it is for.',
  'Never read or print files that may contain secrets (.env, key files, credentials).',
  'If something fails, show the actual error message before trying a fix.',
];

export function renderMemory(profile) {
  const { identity, stack } = profile;
  const lines = [];

  lines.push('# How to work with me');
  lines.push('');
  if (identity.name) lines.push(`My name is ${identity.name}.`);
  lines.push(
    'This file was generated locally by agent-primer from a scan of my machine and project.',
  );
  lines.push('');

  if (stack.languages.length > 0) {
    lines.push('## My stack (detected)');
    lines.push(`- Languages: ${stack.languages.join(', ')}`);
    if (stack.packageManager) {
      lines.push(`- Package manager: ${stack.packageManager} (use it, not alternatives)`);
    }
    if (stack.testCommand) {
      lines.push(`- Run tests with: \`${stack.testCommand}\``);
    }
    lines.push('');
  }

  lines.push('## Working style');
  lines.push('- Briefly explain your plan before changing code.');
  if (stack.testCommand) {
    lines.push(`- Run \`${stack.testCommand}\` after changes and show the result.`);
  }
  lines.push('');

  lines.push('## Guardrails');
  for (const rule of GUARDRAILS) {
    lines.push(`- ${rule}`);
  }

  return lines.join('\n');
}

// At project scope, AGENTS.md is the single source of truth (it is read by
// 30+ tools). Tools that don't read it natively but support file imports —
// Claude Code via `@path` — get a thin stub that points at it, so the
// instructions live in exactly one place. `target` is the import path
// relative to the file holding this stub (usually "AGENTS.md").
export function renderImportStub(target) {
  return [
    '# How to work with me',
    '',
    `My instructions live in \`${target}\`, the shared agent guide most AI tools`,
    'read. This file imports it so Claude Code uses the same instructions —',
    `edit \`${target}\`, not this block.`,
    '',
    `@${target}`,
  ].join('\n');
}
