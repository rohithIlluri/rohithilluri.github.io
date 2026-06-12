// Public API for using agent-primer as a library.
export { buildPlan, adapters, getAdapter } from './adapters/index.js';
export { applyActions, upsertManagedBlock, deepMerge } from './fsutil.js';
export {
  defaultProfile,
  loadProfile,
  saveProfile,
  profilePath,
} from './profile.js';
export { renderMemory } from './templates/memory.js';
export { claudeSettings, codexConfigToml } from './templates/permissions.js';
export { runDoctor } from './doctor.js';
