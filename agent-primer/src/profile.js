// Local state store. agent-primer keeps what it learned and what it derived
// in plain JSON under ~/.agent-primer so the user can inspect (or delete)
// every byte. Nothing is ever sent anywhere.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function stateDir() {
  return (
    process.env.AGENT_PRIMER_HOME || path.join(os.homedir(), '.agent-primer')
  );
}

export function saveState(name, data) {
  const file = path.join(stateDir(), `${name}.json`);
  fs.mkdirSync(stateDir(), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  return file;
}
