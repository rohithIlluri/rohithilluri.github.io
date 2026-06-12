// Renders the profile into the markdown that goes inside the managed block of
// every memory file (CLAUDE.md, AGENTS.md, ...). One renderer for all tools:
// these files are plain-language instructions, so the same text works
// everywhere.

const LEVEL_INTRO = {
  beginner:
    'I am new to professional software development. Assume I may not know common tools, jargon, or workflows.',
  intermediate:
    'I have solid programming fundamentals but appreciate context on unfamiliar tools and patterns.',
  advanced:
    'I am an experienced developer. Be direct and concise; skip basic explanations.',
};

const LEVEL_GUARDRAILS = {
  beginner: [
    'Before running any command that deletes, overwrites, or force-pushes anything, stop and explain what it does and why it is needed.',
    'Make small, focused changes. Prefer several small steps over one big rewrite.',
    'After changing code, briefly explain what you changed and why.',
    'Ask before adding a new dependency, and explain what it is for.',
    'Never read or print files that may contain secrets (.env, key files, credentials).',
    'If something fails, show me the actual error message before trying a fix.',
  ],
  intermediate: [
    'Confirm before destructive or hard-to-reverse operations.',
    'Prefer minimal diffs that match the existing code style.',
    'Never read or print files that may contain secrets (.env, key files, credentials).',
  ],
  advanced: [
    'Confirm before destructive or hard-to-reverse operations.',
    'Never read or print files that may contain secrets (.env, key files, credentials).',
  ],
};

export function renderMemory(profile) {
  const { user, stack, behavior, memory } = profile;
  const lines = [];

  lines.push('# How to work with me');
  lines.push('');
  if (user.name) lines.push(`My name is ${user.name}.`);
  lines.push(LEVEL_INTRO[user.level] ?? LEVEL_INTRO.beginner);
  lines.push('');

  lines.push('## My stack');
  lines.push(`- Languages: ${stack.languages.join(', ')}`);
  if (stack.packageManager) lines.push(`- Package manager: ${stack.packageManager} (use it, not alternatives)`);
  if (stack.testCommand) lines.push(`- Run tests with: \`${stack.testCommand}\``);
  lines.push('');

  lines.push('## Working style');
  if (behavior.explainSteps) {
    lines.push('- Explain your plan in one or two sentences before making changes.');
  }
  if (behavior.alwaysRunTests) {
    lines.push('- Run the tests after every change and show me the result.');
  }
  if (behavior.commitStyle === 'conventional') {
    lines.push('- Write commit messages in Conventional Commits style (feat:, fix:, chore:, ...).');
  } else {
    lines.push('- Write short, plain-language commit messages.');
  }
  lines.push('');

  lines.push('## Guardrails');
  for (const rule of LEVEL_GUARDRAILS[user.level] ?? LEVEL_GUARDRAILS.beginner) {
    lines.push(`- ${rule}`);
  }

  if (memory.facts.length > 0) {
    lines.push('');
    lines.push('## Things to remember about me');
    for (const fact of memory.facts) {
      lines.push(`- ${fact}`);
    }
  }

  return lines.join('\n');
}
