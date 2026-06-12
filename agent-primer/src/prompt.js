// Zero-dependency interactive prompts built on node:readline.
import readline from 'node:readline/promises';

let rl = null;

export function open() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function close() {
  rl?.close();
  rl = null;
}

export async function ask(question, def = '') {
  const suffix = def ? ` (${def})` : '';
  const answer = (await rl.question(`${question}${suffix}: `)).trim();
  return answer || def;
}

export async function confirm(question, def = true) {
  const hint = def ? 'Y/n' : 'y/N';
  const answer = (await rl.question(`${question} [${hint}]: `)).trim().toLowerCase();
  if (answer === '') return def;
  return answer === 'y' || answer === 'yes';
}

/**
 * Single choice from a numbered list.
 * options: [{ value, label, hint? }]
 */
export async function select(question, options, defIndex = 0) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    const mark = i === defIndex ? '*' : ' ';
    const hint = opt.hint ? ` — ${opt.hint}` : '';
    console.log(`  ${mark} ${i + 1}. ${opt.label}${hint}`);
  });
  for (;;) {
    const answer = (await rl.question(`Choose 1-${options.length} (${defIndex + 1}): `)).trim();
    if (answer === '') return options[defIndex].value;
    const n = Number(answer);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) {
      return options[n - 1].value;
    }
    console.log('  Please enter a number from the list.');
  }
}

/**
 * Multiple choice; comma-separated numbers, empty input keeps the defaults.
 */
export async function multiselect(question, options, defIndices = [0]) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => {
    const mark = defIndices.includes(i) ? '*' : ' ';
    const hint = opt.hint ? ` — ${opt.hint}` : '';
    console.log(`  ${mark} ${i + 1}. ${opt.label}${hint}`);
  });
  for (;;) {
    const answer = (await rl.question('Choose numbers, comma-separated (defaults marked *): ')).trim();
    if (answer === '') return defIndices.map((i) => options[i].value);
    const picks = answer.split(',').map((s) => Number(s.trim()));
    if (picks.every((n) => Number.isInteger(n) && n >= 1 && n <= options.length)) {
      return [...new Set(picks)].map((n) => options[n - 1].value);
    }
    console.log('  Please enter numbers from the list, e.g. "1,3".');
  }
}
