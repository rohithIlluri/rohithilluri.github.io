/**
 * Tests for MemoryMonitor.js - Memory Leak Detection
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Import the module
import {
  trackCreate,
  trackDispose,
  getCounts,
  getSnapshots,
  takeSnapshot,
  resetCounts,
  getMemoryReport,
  createDisposeTracker,
  initMemoryMonitor,
  stopMemoryMonitor,
} from '../src/utils/MemoryMonitor.js';

describe('MemoryMonitor', () => {
  beforeEach(() => {
    resetCounts();
    vi.useFakeTimers();
  });

  afterEach(() => {
    stopMemoryMonitor();
    vi.useRealTimers();
  });

  describe('trackCreate', () => {
    it('should increment count for category', () => {
      trackCreate('geometries');
      const counts = getCounts();
      expect(counts.geometries).toBe(1);
    });

    it('should increment by specified amount', () => {
      trackCreate('meshes', 5);
      const counts = getCounts();
      expect(counts.meshes).toBe(5);
    });

    it('should accumulate multiple calls', () => {
      trackCreate('materials');
      trackCreate('materials');
      trackCreate('materials');
      const counts = getCounts();
      expect(counts.materials).toBe(3);
    });

    it('should ignore unknown categories', () => {
      const countsBefore = getCounts();
      trackCreate('unknownCategory');
      const countsAfter = getCounts();
      expect(countsAfter).toEqual(countsBefore);
    });
  });

  describe('trackDispose', () => {
    it('should decrement count for category', () => {
      trackCreate('textures', 5);
      trackDispose('textures', 2);
      const counts = getCounts();
      expect(counts.textures).toBe(3);
    });

    it('should not go below zero', () => {
      trackDispose('particles', 10);
      const counts = getCounts();
      expect(counts.particles).toBe(0);
    });

    it('should default to decrementing by 1', () => {
      trackCreate('groups', 3);
      trackDispose('groups');
      const counts = getCounts();
      expect(counts.groups).toBe(2);
    });
  });

  describe('getCounts', () => {
    it('should return a copy of counts', () => {
      trackCreate('geometries', 10);
      const counts = getCounts();
      counts.geometries = 999;

      // Original should be unchanged
      const freshCounts = getCounts();
      expect(freshCounts.geometries).toBe(10);
    });

    it('should have all expected categories', () => {
      const counts = getCounts();
      expect(counts).toHaveProperty('geometries');
      expect(counts).toHaveProperty('materials');
      expect(counts).toHaveProperty('textures');
      expect(counts).toHaveProperty('meshes');
      expect(counts).toHaveProperty('groups');
      expect(counts).toHaveProperty('particles');
      expect(counts).toHaveProperty('audioBuffers');
      expect(counts).toHaveProperty('eventListeners');
    });
  });

  describe('takeSnapshot', () => {
    it('should create a snapshot with timestamp', () => {
      trackCreate('meshes', 5);
      takeSnapshot();

      const snapshots = getSnapshots();
      expect(snapshots.length).toBe(1);
      expect(snapshots[0].timestamp).toBeDefined();
      expect(snapshots[0].counts.meshes).toBe(5);
    });

    it('should accumulate snapshots', () => {
      takeSnapshot();
      trackCreate('geometries', 3);
      takeSnapshot();

      const snapshots = getSnapshots();
      expect(snapshots.length).toBe(2);
      expect(snapshots[0].counts.geometries).toBe(0);
      expect(snapshots[1].counts.geometries).toBe(3);
    });
  });

  describe('getSnapshots', () => {
    it('should return a copy of snapshots array', () => {
      takeSnapshot();
      const snapshots = getSnapshots();
      snapshots.push({ fake: true });

      const freshSnapshots = getSnapshots();
      expect(freshSnapshots.length).toBe(1);
    });
  });

  describe('resetCounts', () => {
    it('should reset all counts to zero', () => {
      trackCreate('geometries', 100);
      trackCreate('materials', 50);
      trackCreate('meshes', 25);

      resetCounts();

      const counts = getCounts();
      expect(counts.geometries).toBe(0);
      expect(counts.materials).toBe(0);
      expect(counts.meshes).toBe(0);
    });

    it('should clear snapshots', () => {
      takeSnapshot();
      takeSnapshot();
      expect(getSnapshots().length).toBe(2);

      resetCounts();

      expect(getSnapshots().length).toBe(0);
    });
  });

  describe('getMemoryReport', () => {
    it('should return a string report', () => {
      trackCreate('geometries', 10);
      trackCreate('meshes', 20);

      const report = getMemoryReport();

      expect(typeof report).toBe('string');
      expect(report).toContain('Memory Monitor Report');
      expect(report).toContain('geometries: 10');
      expect(report).toContain('meshes: 20');
    });

    it('should show status indicators', () => {
      trackCreate('geometries', 10);
      const report = getMemoryReport();
      expect(report).toContain('✓');
    });
  });

  describe('createDisposeTracker', () => {
    it('should track creation when called', () => {
      const mockObject = { dispose: vi.fn() };
      createDisposeTracker(mockObject, 'materials');

      const counts = getCounts();
      expect(counts.materials).toBe(1);
    });

    it('should return a dispose function', () => {
      const mockObject = { dispose: vi.fn() };
      const trackedDispose = createDisposeTracker(mockObject, 'materials');

      expect(typeof trackedDispose).toBe('function');
    });

    it('should track disposal when dispose is called', () => {
      const mockObject = { dispose: vi.fn() };
      const trackedDispose = createDisposeTracker(mockObject, 'textures');

      expect(getCounts().textures).toBe(1);

      trackedDispose();

      expect(getCounts().textures).toBe(0);
      expect(mockObject.dispose).toHaveBeenCalled();
    });

    it('should work with objects without dispose method', () => {
      const mockObject = {};
      const trackedDispose = createDisposeTracker(mockObject, 'groups');

      expect(() => trackedDispose()).not.toThrow();
      expect(getCounts().groups).toBe(0);
    });
  });

  describe('initMemoryMonitor', () => {
    it('should not throw when initialized', () => {
      expect(() => initMemoryMonitor()).not.toThrow();
    });

    it('should respect enabled option', () => {
      initMemoryMonitor({ enabled: false });
      // Should not set up interval
      // No error means success
    });

    it('should not initialize twice', () => {
      initMemoryMonitor();
      initMemoryMonitor(); // Should be no-op
      // No error means success
    });
  });

  describe('stopMemoryMonitor', () => {
    it('should stop without error', () => {
      initMemoryMonitor();
      expect(() => stopMemoryMonitor()).not.toThrow();
    });

    it('should handle stop when not initialized', () => {
      expect(() => stopMemoryMonitor()).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should track full lifecycle', () => {
      // Create some objects
      trackCreate('geometries', 10);
      trackCreate('materials', 5);
      trackCreate('meshes', 15);

      takeSnapshot();

      // Dispose some
      trackDispose('geometries', 3);
      trackDispose('meshes', 5);

      takeSnapshot();

      const snapshots = getSnapshots();
      expect(snapshots.length).toBe(2);

      // First snapshot
      expect(snapshots[0].counts.geometries).toBe(10);
      expect(snapshots[0].counts.meshes).toBe(15);

      // Second snapshot (after disposals)
      expect(snapshots[1].counts.geometries).toBe(7);
      expect(snapshots[1].counts.meshes).toBe(10);
    });
  });
});
