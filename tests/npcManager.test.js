/**
 * Tests for NPCManager.js - NPC Management System
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE.js
vi.mock('three', () => {
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    clone() { return new Vector3(this.x, this.y, this.z); }
    copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
    distanceTo(v) {
      const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }

  class Group {
    constructor() {
      this.position = new Vector3();
      this.visible = true;
    }
  }

  return { Vector3, Group };
});

// Mock game store
const mockSetNearbyNPC = vi.fn();
vi.mock('../src/stores/gameStore.js', () => ({
  useGameStore: {
    getState: () => ({
      nearbyNPC: null,
      setNearbyNPC: mockSetNearbyNPC,
    }),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

// Create mock NPC class
const mockNPCs = [];
vi.mock('../src/entities/NPC.js', () => {
  const THREE = require('three');
  class MockNPC {
    constructor(scene, planet, definition) {
      this.definition = definition;
      this.container = { visible: true };
      this.position = new THREE.Vector3(definition.lat || 0, 0, definition.lon || 0);
      this._mockPosition = new THREE.Vector3(definition.lat || 0, 0, definition.lon || 0);
      mockNPCs.push(this);
    }
    setLightDirection = vi.fn();
    setPlayerPosition = vi.fn();
    update = vi.fn();
    getPosition() { return this._mockPosition; }
    dispose = vi.fn();
  }
  return { NPC: MockNPC };
});

// Mock NPC data
vi.mock('../src/entities/NPCData.js', () => ({
  NPC_DEFINITIONS: [
    { id: 'npc1', name: 'Baker', lat: 0, lon: 10 },
    { id: 'npc2', name: 'Fisherman', lat: 20, lon: -15 },
    { id: 'npc3', name: 'Farmer', lat: -10, lon: 30 },
  ],
}));

// Import after mocks
const { NPCManager } = await import('../src/entities/NPCManager.js');
const THREE = await import('three');

// Mock scene and planet
function createMockScene() {
  return {
    add: vi.fn(),
    remove: vi.fn(),
  };
}

function createMockPlanet() {
  return {
    radius: 50,
    latLonToPosition: vi.fn((lat, lon) => new THREE.Vector3(lat, 0, lon)),
  };
}

describe('NPCManager', () => {
  let manager;
  let scene;
  let planet;

  beforeEach(() => {
    mockNPCs.length = 0; // Clear mock NPCs
    scene = createMockScene();
    planet = createMockPlanet();
    manager = new NPCManager(scene, planet);
  });

  describe('Constructor', () => {
    it('should initialize with scene and planet', () => {
      expect(manager.scene).toBe(scene);
      expect(manager.planet).toBe(planet);
    });

    it('should be enabled by default', () => {
      expect(manager.enabled).toBe(true);
    });

    it('should initialize NPCs on creation', () => {
      expect(manager.npcs.length).toBeGreaterThan(0);
    });

    it('should respect maxNPCs option', () => {
      const limitedManager = new NPCManager(scene, planet, { maxNPCs: 1 });
      expect(limitedManager.npcs.length).toBe(1);
    });

    it('should not initialize when disabled', () => {
      mockNPCs.length = 0;
      const disabledManager = new NPCManager(scene, planet, { enabled: false });
      expect(disabledManager.npcs.length).toBe(0);
    });
  });

  describe('setLightDirection', () => {
    it('should store light direction', () => {
      const direction = new THREE.Vector3(1, 1, 0);
      manager.setLightDirection(direction);
      expect(manager.lightDirection).toBe(direction);
    });

    it('should update all NPCs light direction', () => {
      const direction = new THREE.Vector3(1, 1, 0);
      manager.setLightDirection(direction);

      manager.npcs.forEach(npc => {
        expect(npc.setLightDirection).toHaveBeenCalledWith(direction);
      });
    });
  });

  describe('setPlayerPosition', () => {
    it('should store player position', () => {
      const position = new THREE.Vector3(10, 0, 10);
      manager.setPlayerPosition(position);
      expect(manager.playerPosition).toBe(position);
    });

    it('should update all NPCs with player position', () => {
      const position = new THREE.Vector3(10, 0, 10);
      manager.setPlayerPosition(position);

      manager.npcs.forEach(npc => {
        expect(npc.setPlayerPosition).toHaveBeenCalledWith(position);
      });
    });
  });

  describe('update', () => {
    it('should update all NPCs', () => {
      manager.update(0.016);

      manager.npcs.forEach(npc => {
        expect(npc.update).toHaveBeenCalledWith(0.016);
      });
    });

    it('should not update when disabled', () => {
      manager.setEnabled(false);
      manager.npcs.forEach(npc => npc.update.mockClear());

      manager.update(0.016);

      manager.npcs.forEach(npc => {
        expect(npc.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('getNPCs', () => {
    it('should return all NPCs', () => {
      const npcs = manager.getNPCs();
      expect(npcs).toBe(manager.npcs);
      expect(npcs.length).toBe(3);
    });
  });

  describe('getNPCById', () => {
    it('should find NPC by ID', () => {
      const npc = manager.getNPCById('npc1');
      expect(npc).toBeDefined();
      expect(npc.definition.id).toBe('npc1');
    });

    it('should return undefined for unknown ID', () => {
      const npc = manager.getNPCById('unknown');
      expect(npc).toBeUndefined();
    });
  });

  describe('getNearestNPC', () => {
    it('should find nearest NPC to position', () => {
      const position = new THREE.Vector3(0, 0, 10);
      const nearest = manager.getNearestNPC(position);

      expect(nearest).toBeDefined();
      expect(nearest.definition.id).toBe('npc1'); // Closest to (0, 0, 10)
    });

    it('should return null if no NPC within range', () => {
      const position = new THREE.Vector3(1000, 0, 1000);
      const nearest = manager.getNearestNPC(position, 1);

      expect(nearest).toBeNull();
    });

    it('should respect maxDistance parameter', () => {
      const position = new THREE.Vector3(100, 0, 100);
      const nearest = manager.getNearestNPC(position, 10);

      expect(nearest).toBeNull();
    });
  });

  describe('hasNPCInRange', () => {
    it('should return true if NPC in range', () => {
      const position = new THREE.Vector3(0, 0, 10);
      const inRange = manager.hasNPCInRange(position, 5);

      expect(inRange).toBe(true);
    });

    it('should return false if no NPC in range', () => {
      const position = new THREE.Vector3(1000, 0, 1000);
      const inRange = manager.hasNPCInRange(position, 5);

      expect(inRange).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('should update enabled state', () => {
      manager.setEnabled(false);
      expect(manager.enabled).toBe(false);
    });

    it('should hide all NPC containers when disabled', () => {
      manager.setEnabled(false);

      manager.npcs.forEach(npc => {
        expect(npc.container.visible).toBe(false);
      });
    });

    it('should show all NPC containers when enabled', () => {
      manager.setEnabled(false);
      manager.setEnabled(true);

      manager.npcs.forEach(npc => {
        expect(npc.container.visible).toBe(true);
      });
    });
  });

  describe('setTimeOfDay', () => {
    it('should not throw when called', () => {
      expect(() => manager.setTimeOfDay(12)).not.toThrow();
    });
  });

  describe('dispose', () => {
    it('should dispose all NPCs', () => {
      manager.dispose();

      mockNPCs.forEach(npc => {
        expect(npc.dispose).toHaveBeenCalled();
      });
    });

    it('should clear NPCs array', () => {
      manager.dispose();
      expect(manager.npcs.length).toBe(0);
    });
  });

  describe('updateNearbyNPC', () => {
    it('should not update store without player position', () => {
      mockSetNearbyNPC.mockClear();

      manager.updateNearbyNPC();

      expect(mockSetNearbyNPC).not.toHaveBeenCalled();
    });

    it('should update store with nearest NPC in range', () => {
      mockSetNearbyNPC.mockClear();

      manager.playerPosition = new THREE.Vector3(0, 0, 10);
      manager.updateNearbyNPC();

      expect(mockSetNearbyNPC).toHaveBeenCalled();
    });
  });
});
