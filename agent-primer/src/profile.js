// The profile is agent-primer's memory store: a single JSON file describing
// who the user is and how they want AI tools to behave. Adapters render it
// into each tool's native config, so editing the profile (or `remember`-ing
// a new fact) updates every tool on the next `apply`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readIfExists } from './fsutil.js';

export const LEVELS = ['beginner', 'intermediate', 'advanced'];
export const AUTONOMY = ['cautious', 'balanced', 'autonomous'];

export function profilePath() {
  const base =
    process.env.AGENT_PRIMER_HOME || path.join(os.homedir(), '.agent-primer');
  return path.join(base, 'profile.json');
}

export function defaultProfile() {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    user: { name: '', level: 'beginner' },
    tools: ['claude-code'],
    scope: 'global',
    stack: {
      languages: ['JavaScript/TypeScript'],
      packageManager: 'npm',
      testCommand: 'npm test',
    },
    behavior: {
      autonomy: 'cautious',
      explainSteps: true,
      alwaysRunTests: true,
      commitStyle: 'conventional',
    },
    memory: { facts: [] },
  };
}

export function loadProfile() {
  const raw = readIfExists(profilePath());
  if (raw === null) return null;
  const profile = JSON.parse(raw);
  if (profile.version !== 1) {
    throw new Error(
      `profile version ${profile.version} is newer than this agent-primer understands`,
    );
  }
  return profile;
}

export function saveProfile(profile) {
  profile.updatedAt = new Date().toISOString();
  const file = profilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(profile, null, 2) + '\n');
  return file;
}

export function requireProfile() {
  const profile = loadProfile();
  if (!profile) {
    throw new Error('no profile found — run `agent-primer init` first');
  }
  return profile;
}
