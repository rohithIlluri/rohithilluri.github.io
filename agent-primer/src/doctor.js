// Environment checks: is Node recent enough, which AI CLIs are installed,
// does a profile exist, which config files are present.
import { spawnSync } from 'node:child_process';
import { adapters, buildPlan } from './adapters/index.js';
import { loadProfile, profilePath } from './profile.js';
import { readIfExists } from './fsutil.js';

function binaryOnPath(binary) {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  const res = spawnSync(cmd, [binary], { stdio: 'ignore' });
  return res.status === 0;
}

export function runDoctor() {
  const report = [];
  const major = Number(process.versions.node.split('.')[0]);
  report.push({
    ok: major >= 18,
    label: `Node.js ${process.versions.node}`,
    detail: major >= 18 ? '' : 'agent-primer needs Node 18 or newer',
  });

  const profile = loadProfile();
  report.push({
    ok: profile !== null,
    label: `profile at ${profilePath()}`,
    detail: profile ? `tools: ${profile.tools.join(', ')}` : 'run `agent-primer init`',
  });

  for (const adapter of adapters) {
    if (!adapter.binary) continue;
    const installed = binaryOnPath(adapter.binary);
    report.push({
      ok: installed,
      label: `${adapter.name} (\`${adapter.binary}\`)`,
      detail: installed ? '' : 'not found on PATH',
    });
  }

  if (profile) {
    for (const action of buildPlan(profile)) {
      const exists = readIfExists(action.path) !== null;
      report.push({
        ok: exists,
        label: action.path,
        detail: exists ? '' : 'missing — run `agent-primer apply`',
      });
    }
  }
  return report;
}
