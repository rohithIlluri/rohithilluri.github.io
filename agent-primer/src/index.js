// Public API for using agent-primer as a library.
export { runScan, scanProject } from './scan.js';
export { deriveProfile } from './derive.js';
export { buildPlan, adapters, getAdapter } from './adapters/index.js';
export { applyActions, upsertManagedBlock, deepMerge } from './fsutil.js';
export { stateDir, saveState } from './profile.js';
export { renderMemory } from './templates/memory.js';
export { claudeSettings, codexConfigToml } from './templates/permissions.js';
