// The interview: turns a short conversation into a Profile. Defaults are
// tuned for beginners — every question has a sensible answer pre-selected so
// mashing Enter produces a safe, useful setup.
import * as p from './prompt.js';
import { defaultProfile } from './profile.js';
import { adapters } from './adapters/index.js';

export async function runWizard(existing = null) {
  const profile = existing ?? defaultProfile();
  p.open();
  try {
    console.log('\nagent-primer — let\'s set up your AI coding tools.\n');

    profile.user.name = await p.ask('Your name (optional)', profile.user.name);

    profile.user.level = await p.select(
      'How experienced are you with software development?',
      [
        { value: 'beginner', label: 'Beginner', hint: 'tools will explain everything and ask before risky actions' },
        { value: 'intermediate', label: 'Intermediate', hint: 'context where helpful, fewer interruptions' },
        { value: 'advanced', label: 'Advanced', hint: 'direct and concise' },
      ],
      ['beginner', 'intermediate', 'advanced'].indexOf(profile.user.level),
    );

    profile.tools = await p.multiselect(
      'Which AI coding tools do you use?',
      adapters.map((a) => ({ value: a.id, label: a.name })),
      profile.tools.map((id) => adapters.findIndex((a) => a.id === id)).filter((i) => i >= 0),
    );

    profile.stack.languages = await p.multiselect(
      'Which languages do you mainly work in?',
      [
        { value: 'JavaScript/TypeScript', label: 'JavaScript / TypeScript' },
        { value: 'Python', label: 'Python' },
        { value: 'Go', label: 'Go' },
        { value: 'Rust', label: 'Rust' },
        { value: 'Java/Kotlin', label: 'Java / Kotlin' },
        { value: 'Other', label: 'Other' },
      ],
      profile.stack.languages.includes('Python') ? [1] : [0],
    );

    if (profile.stack.languages.includes('JavaScript/TypeScript')) {
      profile.stack.packageManager = await p.select(
        'Preferred package manager?',
        [
          { value: 'npm', label: 'npm' },
          { value: 'pnpm', label: 'pnpm' },
          { value: 'yarn', label: 'yarn' },
          { value: 'bun', label: 'bun' },
        ],
        ['npm', 'pnpm', 'yarn', 'bun'].indexOf(profile.stack.packageManager) || 0,
      );
    } else {
      profile.stack.packageManager = '';
    }

    profile.stack.testCommand = await p.ask(
      'Command to run your tests (leave empty if none yet)',
      profile.stack.testCommand,
    );

    const recommended = profile.user.level === 'beginner' ? 0 : 1;
    profile.behavior.autonomy = await p.select(
      'How much should AI tools do without asking?',
      [
        { value: 'cautious', label: 'Cautious', hint: 'ask before edits and commands — recommended for beginners' },
        { value: 'balanced', label: 'Balanced', hint: 'auto-accept edits, pre-approve common safe commands' },
        { value: 'autonomous', label: 'Autonomous', hint: 'broad permissions; you review diffs afterwards' },
      ],
      ['cautious', 'balanced', 'autonomous'].indexOf(profile.behavior.autonomy) >= 0 &&
      existing
        ? ['cautious', 'balanced', 'autonomous'].indexOf(profile.behavior.autonomy)
        : recommended,
    );

    profile.behavior.explainSteps = await p.confirm(
      'Should tools explain their plan before changing code?',
      profile.behavior.explainSteps,
    );
    profile.behavior.alwaysRunTests = await p.confirm(
      'Should tools run your tests after every change?',
      profile.behavior.alwaysRunTests,
    );
    profile.behavior.commitStyle = await p.select(
      'Commit message style?',
      [
        { value: 'conventional', label: 'Conventional Commits', hint: 'feat: ..., fix: ...' },
        { value: 'plain', label: 'Plain language' },
      ],
      profile.behavior.commitStyle === 'plain' ? 1 : 0,
    );

    profile.scope = await p.select(
      'Where should configs be written?',
      [
        { value: 'global', label: 'Globally', hint: 'applies to every project on this machine' },
        { value: 'project', label: 'This project only', hint: `writes into ${process.cwd()}` },
        { value: 'both', label: 'Both' },
      ],
      ['global', 'project', 'both'].indexOf(profile.scope) || 0,
    );

    const facts = await p.ask(
      'Anything the AI should always remember about you? (comma-separated, optional)',
    );
    if (facts) {
      profile.memory.facts.push(
        ...facts.split(',').map((s) => s.trim()).filter(Boolean),
      );
    }

    return profile;
  } finally {
    p.close();
  }
}
