/**
 * MemoryMonitor.js - Memory Leak Detection Utility
 * Tracks object creation/disposal and warns about potential memory leaks
 * Useful for detecting issues during long play sessions
 */

// Track counts by category
const objectCounts = {
  geometries: 0,
  materials: 0,
  textures: 0,
  meshes: 0,
  groups: 0,
  particles: 0,
  audioBuffers: 0,
  eventListeners: 0,
};

// Historical snapshots for trend analysis
const snapshots = [];
const MAX_SNAPSHOTS = 60; // Keep last 60 snapshots (1 hour at 1 min intervals)

// Thresholds for warnings
const THRESHOLDS = {
  geometries: { warn: 500, critical: 1000 },
  materials: { warn: 200, critical: 500 },
  textures: { warn: 100, critical: 200 },
  meshes: { warn: 1000, critical: 2000 },
  groups: { warn: 500, critical: 1000 },
  particles: { warn: 5000, critical: 10000 },
  audioBuffers: { warn: 50, critical: 100 },
  eventListeners: { warn: 100, critical: 200 },
};

// Leak detection config
const LEAK_DETECTION = {
  enabled: true,
  checkIntervalMs: 60000, // Check every minute
  growthRateThreshold: 0.1, // 10% growth per interval is suspicious
};

let intervalId = null;
let isInitialized = false;

/**
 * Initialize the memory monitor
 * @param {Object} options Configuration options
 */
export function initMemoryMonitor(options = {}) {
  if (isInitialized) return;

  const config = {
    enabled: options.enabled !== false,
    checkInterval: options.checkIntervalMs || LEAK_DETECTION.checkIntervalMs,
    onWarning: options.onWarning || defaultWarningHandler,
    onCritical: options.onCritical || defaultCriticalHandler,
  };

  if (!config.enabled) return;

  // Start periodic checks
  intervalId = setInterval(() => {
    takeSnapshot();
    analyzeForLeaks(config);
  }, config.checkInterval);

  isInitialized = true;
  console.log('[MemoryMonitor] Initialized');
}

/**
 * Default warning handler
 */
function defaultWarningHandler(category, count, threshold) {
  console.warn(`[MemoryMonitor] Warning: ${category} count (${count}) exceeds warning threshold (${threshold})`);
}

/**
 * Default critical handler
 */
function defaultCriticalHandler(category, count, threshold) {
  console.error(`[MemoryMonitor] Critical: ${category} count (${count}) exceeds critical threshold (${threshold})`);
}

/**
 * Track object creation
 * @param {string} category Object category
 * @param {number} count Number of objects created (default 1)
 */
export function trackCreate(category, count = 1) {
  if (objectCounts[category] !== undefined) {
    objectCounts[category] += count;
  }
}

/**
 * Track object disposal
 * @param {string} category Object category
 * @param {number} count Number of objects disposed (default 1)
 */
export function trackDispose(category, count = 1) {
  if (objectCounts[category] !== undefined) {
    objectCounts[category] = Math.max(0, objectCounts[category] - count);
  }
}

/**
 * Get current object counts
 * @returns {Object} Current counts by category
 */
export function getCounts() {
  return { ...objectCounts };
}

/**
 * Get all snapshots
 * @returns {Array} Array of historical snapshots
 */
export function getSnapshots() {
  return [...snapshots];
}

/**
 * Take a snapshot of current counts
 */
export function takeSnapshot() {
  const snapshot = {
    timestamp: Date.now(),
    counts: { ...objectCounts },
  };

  snapshots.push(snapshot);

  // Keep only last MAX_SNAPSHOTS
  while (snapshots.length > MAX_SNAPSHOTS) {
    snapshots.shift();
  }
}

/**
 * Analyze snapshots for potential memory leaks
 * @param {Object} config Monitor configuration
 */
function analyzeForLeaks(config) {
  // Check absolute thresholds
  for (const [category, count] of Object.entries(objectCounts)) {
    const threshold = THRESHOLDS[category];
    if (!threshold) continue;

    if (count >= threshold.critical) {
      config.onCritical(category, count, threshold.critical);
    } else if (count >= threshold.warn) {
      config.onWarning(category, count, threshold.warn);
    }
  }

  // Check growth rate (need at least 2 snapshots)
  if (snapshots.length < 2) return;

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];

  for (const [category, currentCount] of Object.entries(latest.counts)) {
    const previousCount = previous.counts[category] || 0;

    if (previousCount === 0) continue;

    const growthRate = (currentCount - previousCount) / previousCount;

    if (growthRate > LEAK_DETECTION.growthRateThreshold) {
      console.warn(
        `[MemoryMonitor] Potential leak: ${category} grew by ${Math.round(growthRate * 100)}% ` +
        `(${previousCount} -> ${currentCount})`
      );
    }
  }
}

/**
 * Get memory statistics from the browser
 * @returns {Object|null} Memory info or null if not available
 */
export function getBrowserMemoryInfo() {
  if (performance && performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usedMB: Math.round(performance.memory.usedJSHeapSize / 1048576),
      totalMB: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
    };
  }
  return null;
}

/**
 * Get a formatted memory report
 * @returns {string} Human-readable memory report
 */
export function getMemoryReport() {
  const lines = ['=== Memory Monitor Report ===', ''];

  // Object counts
  lines.push('Object Counts:');
  for (const [category, count] of Object.entries(objectCounts)) {
    const threshold = THRESHOLDS[category];
    let status = '✓';
    if (threshold) {
      if (count >= threshold.critical) status = '❌ CRITICAL';
      else if (count >= threshold.warn) status = '⚠️ WARNING';
    }
    lines.push(`  ${category}: ${count} ${status}`);
  }
  lines.push('');

  // Browser memory (if available)
  const memInfo = getBrowserMemoryInfo();
  if (memInfo) {
    lines.push('Browser Memory:');
    lines.push(`  Used: ${memInfo.usedMB} MB`);
    lines.push(`  Total: ${memInfo.totalMB} MB`);
    lines.push(`  Limit: ${memInfo.limitMB} MB`);
    lines.push(`  Usage: ${Math.round((memInfo.usedMB / memInfo.limitMB) * 100)}%`);
    lines.push('');
  }

  // Snapshot trend (if available)
  if (snapshots.length >= 2) {
    lines.push('Trend (last 2 snapshots):');
    const latest = snapshots[snapshots.length - 1];
    const previous = snapshots[snapshots.length - 2];

    for (const [category, currentCount] of Object.entries(latest.counts)) {
      const previousCount = previous.counts[category] || 0;
      const diff = currentCount - previousCount;
      const sign = diff >= 0 ? '+' : '';
      lines.push(`  ${category}: ${sign}${diff}`);
    }
  }

  return lines.join('\n');
}

/**
 * Reset all counters (useful for testing)
 */
export function resetCounts() {
  for (const key of Object.keys(objectCounts)) {
    objectCounts[key] = 0;
  }
  snapshots.length = 0;
}

/**
 * Stop the memory monitor
 */
export function stopMemoryMonitor() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  isInitialized = false;
  console.log('[MemoryMonitor] Stopped');
}

/**
 * Create a disposal tracker for a Three.js object
 * Automatically tracks creation and provides dispose wrapper
 * @param {Object} object The object to track
 * @param {string} category The category for tracking
 * @returns {Function} Wrapped dispose function
 */
export function createDisposeTracker(object, category) {
  trackCreate(category);

  const originalDispose = object.dispose?.bind(object);

  return function trackedDispose() {
    trackDispose(category);
    if (originalDispose) {
      originalDispose();
    }
  };
}

// Export default instance for convenience
export default {
  init: initMemoryMonitor,
  stop: stopMemoryMonitor,
  trackCreate,
  trackDispose,
  getCounts,
  getSnapshots,
  takeSnapshot,
  getMemoryReport,
  getBrowserMemoryInfo,
  resetCounts,
  createDisposeTracker,
};
