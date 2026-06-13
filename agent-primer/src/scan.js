// The scanner: reads the machine to learn how the user already works.
// Everything here is strictly local — binaries on PATH, files on disk,
// `git config`. There is no network code anywhere in this project.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { adapters } from './adapters/index.js';

// AI-adjacent tools we report on even without a dedicated adapter yet.
const EXTRA_BINARIES = ['git', 'node', 'gemini', 'ollama', 'cursor'];

function onPath(binary) {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(cmd, [binary], { stdio: 'ignore' }).status === 0;
}

function binaryVersion(binary) {
  const res = spawnSync(binary, ['--version'], {
    encoding: 'utf8',
    timeout: 3000,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (res.error || res.status !== 0 || !res.stdout) return null;
  return res.stdout.trim().split('\n')[0];
}

function gitConfig(key) {
  const res = spawnSync('git', ['config', '--get', key], {
    encoding: 'utf8',
    timeout: 3000,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return res.status === 0 ? res.stdout.trim() : '';
}

/** Detect languages, package manager, and test command from project markers. */
export function scanProject(dir) {
  const has = (f) => fs.existsSync(path.join(dir, f));
  const markers = [];
  const languages = [];
  let packageManager = '';
  let testCommand = '';

  if (has('package.json')) {
    markers.push('package.json');
    languages.push(has('tsconfig.json') ? 'TypeScript' : 'JavaScript');
    packageManager = has('pnpm-lock.yaml')
      ? 'pnpm'
      : has('yarn.lock')
        ? 'yarn'
        : has('bun.lockb') || has('bun.lock')
          ? 'bun'
          : 'npm';
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (typeof pkg.packageManager === 'string') {
        packageManager = pkg.packageManager.split('@')[0];
      }
      const test = pkg.scripts?.test;
      if (test && !test.includes('no test specified')) {
        testCommand = `${packageManager} test`;
      }
    } catch {
      // unreadable package.json — keep lockfile-based detection
    }
  }
  if (has('pyproject.toml') || has('requirements.txt') || has('setup.py')) {
    markers.push('pyproject.toml/requirements.txt');
    languages.push('Python');
  }
  if (has('go.mod')) {
    markers.push('go.mod');
    languages.push('Go');
    testCommand ||= 'go test ./...';
  }
  if (has('Cargo.toml')) {
    markers.push('Cargo.toml');
    languages.push('Rust');
    testCommand ||= 'cargo test';
  }
  if (has('pom.xml') || has('build.gradle') || has('build.gradle.kts')) {
    markers.push('pom.xml/build.gradle');
    languages.push('Java/Kotlin');
  }

  return {
    dir,
    isProject: languages.length > 0,
    markers,
    languages,
    packageManager,
    testCommand,
  };
}

/** Full local scan: binaries, identity, current project. */
export function runScan(cwd = process.cwd()) {
  const names = [
    ...new Set([
      ...adapters.filter((a) => a.binary).map((a) => a.binary),
      ...EXTRA_BINARIES,
    ]),
  ];
  const binaries = {};
  for (const name of names) {
    const found = onPath(name);
    binaries[name] = {
      found,
      version: found ? binaryVersion(name) : null,
    };
  }

  return {
    scannedAt: new Date().toISOString(),
    platform: `${process.platform} ${os.release()}`,
    shell: process.env.SHELL || '',
    binaries,
    identity: { name: gitConfig('user.name') },
    project: scanProject(cwd),
  };
}
