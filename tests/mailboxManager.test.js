/**
 * Tests for MailboxManager.js - Mailbox Management System
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

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
const mockSetNearbyMailbox = vi.fn();
vi.mock('../src/stores/gameStore.js', () => ({
  useGameStore: {
    getState: () => ({
      nearbyMailbox: null,
      setNearbyMailbox: mockSetNearbyMailbox,
    }),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

// Create mock Mailbox class
const mockMailboxes = [];
let mailboxIdCounter = 0;
vi.mock('../src/entities/Mailbox.js', () => {
  const THREE = require('three');
  class MockMailbox {
    constructor(scene, planet, options) {
      this.id = options.id || `mailbox-${mailboxIdCounter++}`;
      this.container = { visible: true };
      this.interactionRadius = options.interactionRadius || 3.0;
      this.hasNewMail = false;
      this.locationName = '';
      this._mockPosition = new THREE.Vector3(options.lat || 0, 0, options.lon || 0);
      mockMailboxes.push(this);
    }
    setLightDirection = vi.fn();
    update = vi.fn();
    getPosition() { return this._mockPosition; }
    spawnMail = vi.fn(function() { this.hasNewMail = true; });
    collectMail = vi.fn(function() {
      if (this.hasNewMail) {
        this.hasNewMail = false;
        return { id: `mail-${Date.now()}`, recipient: 'npc1' };
      }
      return null;
    });
    dispose = vi.fn();
  }
  return { Mailbox: MockMailbox };
});

// Import after mocks
const { MailboxManager } = await import('../src/entities/MailboxManager.js');
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

describe('MailboxManager', () => {
  let manager;
  let scene;
  let planet;

  beforeEach(() => {
    vi.useFakeTimers();
    mockMailboxes.length = 0;
    mailboxIdCounter = 0;
    scene = createMockScene();
    planet = createMockPlanet();
    manager = new MailboxManager(scene, planet);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Constructor', () => {
    it('should initialize with scene and planet', () => {
      expect(manager.scene).toBe(scene);
      expect(manager.planet).toBe(planet);
    });

    it('should be enabled by default', () => {
      expect(manager.enabled).toBe(true);
    });

    it('should initialize mailboxes on creation', () => {
      expect(manager.mailboxes.length).toBeGreaterThan(0);
    });

    it('should respect maxMailboxes option', () => {
      mockMailboxes.length = 0;
      const limitedManager = new MailboxManager(scene, planet, { maxMailboxes: 2 });
      expect(limitedManager.mailboxes.length).toBe(2);
    });

    it('should not initialize when disabled', () => {
      mockMailboxes.length = 0;
      const disabledManager = new MailboxManager(scene, planet, { enabled: false });
      expect(disabledManager.mailboxes.length).toBe(0);
    });
  });

  describe('setLightDirection', () => {
    it('should store light direction', () => {
      const direction = new THREE.Vector3(1, 1, 0);
      manager.setLightDirection(direction);
      expect(manager.lightDirection).toBe(direction);
    });

    it('should update all mailboxes light direction', () => {
      const direction = new THREE.Vector3(1, 1, 0);
      manager.setLightDirection(direction);

      manager.mailboxes.forEach(mailbox => {
        expect(mailbox.setLightDirection).toHaveBeenCalledWith(direction);
      });
    });
  });

  describe('setPlayerPosition', () => {
    it('should store player position', () => {
      const position = new THREE.Vector3(10, 0, 10);
      manager.setPlayerPosition(position);
      expect(manager.playerPosition).toBe(position);
    });
  });

  describe('update', () => {
    it('should update all mailboxes', () => {
      manager.update(0.016);

      manager.mailboxes.forEach(mailbox => {
        expect(mailbox.update).toHaveBeenCalledWith(0.016);
      });
    });

    it('should not update when disabled', () => {
      manager.setEnabled(false);
      manager.mailboxes.forEach(mailbox => mailbox.update.mockClear());

      manager.update(0.016);

      manager.mailboxes.forEach(mailbox => {
        expect(mailbox.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('checkPlayerProximity', () => {
    it('should not check without player position', () => {
      mockSetNearbyMailbox.mockClear();

      manager.checkPlayerProximity();

      expect(mockSetNearbyMailbox).not.toHaveBeenCalled();
    });

    it('should find nearest mailbox in range', () => {
      mockSetNearbyMailbox.mockClear();

      // Position player near first mailbox (lat: 5, lon: 10)
      manager.playerPosition = new THREE.Vector3(5, 0, 10);
      manager.checkPlayerProximity();

      expect(mockSetNearbyMailbox).toHaveBeenCalled();
      expect(manager.nearbyMailbox).toBeDefined();
    });

    it('should set null when no mailbox in range', () => {
      manager.playerPosition = new THREE.Vector3(1000, 0, 1000);
      manager.checkPlayerProximity();

      expect(manager.nearbyMailbox).toBeNull();
    });
  });

  describe('collectMailFromNearby', () => {
    it('should return null if no nearby mailbox', () => {
      manager.nearbyMailbox = null;
      const mail = manager.collectMailFromNearby();
      expect(mail).toBeNull();
    });

    it('should return null if nearby mailbox has no mail', () => {
      manager.nearbyMailbox = manager.mailboxes[0];
      manager.nearbyMailbox.hasNewMail = false;
      const mail = manager.collectMailFromNearby();
      expect(mail).toBeNull();
    });

    it('should collect mail from nearby mailbox', () => {
      manager.nearbyMailbox = manager.mailboxes[0];
      manager.nearbyMailbox.hasNewMail = true;
      const mail = manager.collectMailFromNearby();

      expect(mail).toBeDefined();
      expect(manager.nearbyMailbox.collectMail).toHaveBeenCalled();
    });

    it('should schedule respawn after collection', () => {
      manager.nearbyMailbox = manager.mailboxes[0];
      manager.nearbyMailbox.hasNewMail = true;

      manager.collectMailFromNearby();

      // Check that a respawn timer was scheduled
      expect(manager.respawnTimers.size).toBeGreaterThan(0);
    });
  });

  describe('getMailboxesWithMail', () => {
    it('should return only mailboxes with mail', () => {
      // Reset all mail state first
      manager.mailboxes.forEach(m => m.hasNewMail = false);
      manager.mailboxes[0].hasNewMail = true;
      manager.mailboxes[1].hasNewMail = false;
      manager.mailboxes[2].hasNewMail = true;

      const withMail = manager.getMailboxesWithMail();

      expect(withMail.length).toBe(2);
      expect(withMail).toContain(manager.mailboxes[0]);
      expect(withMail).toContain(manager.mailboxes[2]);
    });

    it('should return empty array if no mailboxes have mail', () => {
      manager.mailboxes.forEach(m => m.hasNewMail = false);

      const withMail = manager.getMailboxesWithMail();

      expect(withMail.length).toBe(0);
    });
  });

  describe('getAvailableMailCount', () => {
    it('should count mailboxes with mail', () => {
      // Reset all mail state first
      manager.mailboxes.forEach(m => m.hasNewMail = false);
      manager.mailboxes[0].hasNewMail = true;
      manager.mailboxes[1].hasNewMail = true;
      manager.mailboxes[2].hasNewMail = false;

      const count = manager.getAvailableMailCount();

      expect(count).toBe(2);
    });

    it('should return 0 when no mail available', () => {
      manager.mailboxes.forEach(m => m.hasNewMail = false);

      const count = manager.getAvailableMailCount();

      expect(count).toBe(0);
    });
  });

  describe('getMailboxById', () => {
    it('should find mailbox by ID', () => {
      const mailbox = manager.getMailboxById('mailbox-towncenter');
      expect(mailbox).toBeDefined();
      expect(mailbox.id).toBe('mailbox-towncenter');
    });

    it('should return undefined for unknown ID', () => {
      const mailbox = manager.getMailboxById('unknown');
      expect(mailbox).toBeUndefined();
    });
  });

  describe('getNearestMailboxWithMail', () => {
    it('should find nearest mailbox that has mail', () => {
      // Set up: only second mailbox has mail
      manager.mailboxes.forEach(m => m.hasNewMail = false);
      manager.mailboxes[1].hasNewMail = true;

      const position = new THREE.Vector3(0, 0, 0);
      const nearest = manager.getNearestMailboxWithMail(position);

      expect(nearest).toBe(manager.mailboxes[1]);
    });

    it('should return null if no mailbox has mail', () => {
      manager.mailboxes.forEach(m => m.hasNewMail = false);

      const position = new THREE.Vector3(0, 0, 0);
      const nearest = manager.getNearestMailboxWithMail(position);

      expect(nearest).toBeNull();
    });
  });

  describe('forceRespawn', () => {
    it('should spawn mail at specified mailbox', () => {
      const mailbox = manager.mailboxes[0];
      mailbox.hasNewMail = false;
      mailbox.spawnMail.mockClear();

      manager.forceRespawn(mailbox.id);

      expect(mailbox.spawnMail).toHaveBeenCalled();
    });

    it('should not spawn if mailbox already has mail', () => {
      const mailbox = manager.mailboxes[0];
      mailbox.hasNewMail = true;
      mailbox.spawnMail.mockClear();

      manager.forceRespawn(mailbox.id);

      expect(mailbox.spawnMail).not.toHaveBeenCalled();
    });

    it('should do nothing for unknown mailbox ID', () => {
      expect(() => manager.forceRespawn('unknown')).not.toThrow();
    });
  });

  describe('scheduleRespawn', () => {
    it('should schedule respawn timer', () => {
      const mailbox = manager.mailboxes[0];
      mailbox.hasNewMail = false;
      mailbox.spawnMail.mockClear();

      manager.scheduleRespawn(mailbox);

      expect(manager.respawnTimers.has(mailbox.id)).toBe(true);
    });

    it('should respawn mail after delay', () => {
      const mailbox = manager.mailboxes[0];
      mailbox.hasNewMail = false;
      mailbox.spawnMail.mockClear();

      manager.scheduleRespawn(mailbox);

      // Fast forward past max respawn delay
      vi.advanceTimersByTime(35000);

      expect(mailbox.spawnMail).toHaveBeenCalled();
    });

    it('should clear timer after respawn', () => {
      const mailbox = manager.mailboxes[0];
      mailbox.hasNewMail = false;

      manager.scheduleRespawn(mailbox);
      vi.advanceTimersByTime(35000);

      expect(manager.respawnTimers.has(mailbox.id)).toBe(false);
    });

    it('should clear existing timer when rescheduling', () => {
      const mailbox = manager.mailboxes[0];
      mailbox.hasNewMail = false;

      manager.scheduleRespawn(mailbox);
      const firstTimer = manager.respawnTimers.get(mailbox.id);

      manager.scheduleRespawn(mailbox);
      const secondTimer = manager.respawnTimers.get(mailbox.id);

      expect(firstTimer).not.toBe(secondTimer);
    });
  });

  describe('setEnabled', () => {
    it('should update enabled state', () => {
      manager.setEnabled(false);
      expect(manager.enabled).toBe(false);
    });

    it('should hide all mailbox containers when disabled', () => {
      manager.setEnabled(false);

      manager.mailboxes.forEach(mailbox => {
        expect(mailbox.container.visible).toBe(false);
      });
    });

    it('should show all mailbox containers when enabled', () => {
      manager.setEnabled(false);
      manager.setEnabled(true);

      manager.mailboxes.forEach(mailbox => {
        expect(mailbox.container.visible).toBe(true);
      });
    });
  });

  describe('dispose', () => {
    it('should dispose all mailboxes', () => {
      manager.dispose();

      mockMailboxes.forEach(mailbox => {
        expect(mailbox.dispose).toHaveBeenCalled();
      });
    });

    it('should clear mailboxes array', () => {
      manager.dispose();
      expect(manager.mailboxes.length).toBe(0);
    });

    it('should clear all respawn timers', () => {
      // Schedule some respawns
      manager.mailboxes.forEach(m => {
        m.hasNewMail = false;
        manager.scheduleRespawn(m);
      });

      expect(manager.respawnTimers.size).toBeGreaterThan(0);

      manager.dispose();

      expect(manager.respawnTimers.size).toBe(0);
    });
  });
});
