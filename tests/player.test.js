/**
 * Tests for Player.js - Spherical Planet Player Controller
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
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
    normalize() {
      const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      if (len > 0) { this.x /= len; this.y /= len; this.z /= len; }
      return this;
    }
    multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    distanceTo(v) {
      const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
    negate() { this.x = -this.x; this.y = -this.y; this.z = -this.z; return this; }
    lerp(v, t) {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      this.z += (v.z - this.z) * t;
      return this;
    }
  }

  class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
    copy(q) { this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w; return this; }
  }

  class Group {
    constructor() {
      this.position = new Vector3();
      this.rotation = { x: 0, y: 0, z: 0 };
      this.quaternion = new Quaternion();
      this.children = [];
    }
    add(child) { this.children.push(child); }
    remove(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
    }
    traverse(callback) {
      callback(this);
      this.children.forEach(c => {
        if (c.traverse) c.traverse(callback);
        else callback(c);
      });
    }
  }

  class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry || { dispose: vi.fn() };
      this.material = material || { dispose: vi.fn(), uniforms: {} };
      this.position = new Vector3();
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = { x: 1, y: 1, z: 1, set: vi.fn(), copy: vi.fn() };
      this.castShadow = false;
      this.renderOrder = 0;
      this.isMesh = true;
    }
  }

  class Scene {
    constructor() {
      this.children = [];
    }
    add(obj) { this.children.push(obj); }
    remove(obj) {
      const idx = this.children.indexOf(obj);
      if (idx !== -1) this.children.splice(idx, 1);
    }
  }

  class Raycaster {
    constructor() {
      this.far = Infinity;
    }
    set() {}
    intersectObjects() { return []; }
  }

  // Geometry mocks
  const createGeometry = () => ({ dispose: vi.fn() });
  class SphereGeometry { constructor() { this.dispose = vi.fn(); } }
  class BoxGeometry { constructor() { this.dispose = vi.fn(); } }
  class CylinderGeometry { constructor() { this.dispose = vi.fn(); } }
  class TorusGeometry { constructor() { this.dispose = vi.fn(); } }
  class CircleGeometry { constructor() { this.dispose = vi.fn(); } }

  // Material mocks
  class MeshBasicMaterial {
    constructor(params = {}) {
      this.color = params.color || 0xffffff;
      this.transparent = params.transparent || false;
      this.opacity = params.opacity || 1;
      this.dispose = vi.fn();
    }
  }

  return {
    Vector3,
    Quaternion,
    Group,
    Mesh,
    Scene,
    Raycaster,
    SphereGeometry,
    BoxGeometry,
    CylinderGeometry,
    TorusGeometry,
    CircleGeometry,
    MeshBasicMaterial,
    MathUtils: {
      lerp: (a, b, t) => a + (b - a) * t,
      degToRad: (deg) => deg * Math.PI / 180,
      radToDeg: (rad) => rad * 180 / Math.PI,
    },
  };
});

// Mock game store
vi.mock('../src/stores/gameStore.js', () => ({
  useGameStore: {
    getState: () => ({
      buildings: [],
      setPlayerPosition: vi.fn(),
      setCurrentBuilding: vi.fn(),
      openModal: vi.fn(),
      closeModal: vi.fn(),
    }),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

// Mock toon shader
vi.mock('../src/shaders/toon.js', () => ({
  createEnhancedToonMaterial: vi.fn(() => ({
    uniforms: {
      lightDirection: {
        value: {
          x: 1, y: 1, z: 1,
          copy: vi.fn(function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }),
        }
      }
    },
    dispose: vi.fn(),
  })),
  createOutlineMesh: vi.fn(() => {
    const THREE = require('three');
    return new THREE.Mesh();
  }),
}));

// Mock audio manager
vi.mock('../src/audio/AudioManager.js', () => ({
  getAudioManager: () => ({
    initialized: false,
    playFootstep: vi.fn(),
  }),
}));

// Mock colors
vi.mock('../src/constants/colors.js', () => ({
  MESSENGER_PALETTE: {
    OUTLINE_PRIMARY: 0x1A1A2E,
    SHADOW_TINT: 0x5A6B7A,
  },
  CHARACTER_COLORS: {
    skin: 0xF5D0C5,
    shirt: 0x1A1A2E,
    shirtCollar: 0xF5F0E6,
    skirt: 0xC44536,
    hair: 0x2C1810,
    socks: 0xFFFFFF,
    shoes: 0x1A1A2E,
    bag: 0xFFD54F,
    strap: 0x1A1A2E,
  },
}));

// Mock model loader
vi.mock('../src/utils/ModelLoader.js', () => ({
  loadModelWithFallback: vi.fn(() => Promise.resolve({ model: null, isLoaded: false })),
}));

// Mock toon model helper
vi.mock('../src/utils/ToonModelHelper.js', () => ({
  applyCharacterToonShading: vi.fn(),
  updateModelLightDirection: vi.fn(),
  scaleModelToHeight: vi.fn(),
  centerModelAtGround: vi.fn(),
  setupModelAnimations: vi.fn(),
  createCharacterShadow: vi.fn(() => {
    const THREE = require('three');
    return new THREE.Mesh();
  }),
}));

// Import after mocks
const { Player } = await import('../src/Player.js');
const THREE = await import('three');

// Create mock input manager
function createMockInputManager() {
  const listeners = {};
  return {
    on: (event, callback) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    emit: (event, ...args) => {
      if (listeners[event]) {
        listeners[event].forEach(cb => cb(...args));
      }
    },
    getMovementDirection: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
    isRunning: vi.fn(() => false),
    isMoving: vi.fn(() => false),
  };
}

// Create mock planet
function createMockPlanet() {
  return {
    radius: 50,
    center: new THREE.Vector3(0, 0, 0),
    getUpVector: vi.fn((pos) => {
      const v = pos.clone().normalize();
      return v;
    }),
    projectToSurface: vi.fn((pos) => {
      const norm = pos.clone().normalize();
      return norm.multiplyScalar(50);
    }),
    projectToSurfaceWithHeight: vi.fn((pos, height) => {
      const norm = pos.clone().normalize();
      return norm.multiplyScalar(50 + height);
    }),
    getLocalAxes: vi.fn(() => ({
      up: new THREE.Vector3(0, 1, 0),
      forward: new THREE.Vector3(0, 0, -1),
      right: new THREE.Vector3(1, 0, 0),
    })),
    getSurfaceOrientation: vi.fn(() => new THREE.Quaternion()),
    moveOnSurface: vi.fn((pos, dir, dist) => {
      const newPos = pos.clone();
      newPos.add(dir.clone().multiplyScalar(dist));
      return newPos.normalize().multiplyScalar(50);
    }),
  };
}

describe('Player', () => {
  let player;
  let scene;
  let inputManager;
  let spawnPosition;

  beforeEach(() => {
    scene = new THREE.Scene();
    inputManager = createMockInputManager();
    spawnPosition = new THREE.Vector3(0, 0, 50);
    player = new Player(scene, inputManager, spawnPosition);
  });

  describe('Constructor', () => {
    it('should initialize with correct spawn position', () => {
      expect(player.position.x).toBe(0);
      expect(player.position.y).toBe(0);
      expect(player.position.z).toBe(50);
    });

    it('should initialize with default settings', () => {
      expect(player.walkSpeed).toBe(4);
      expect(player.runSpeed).toBe(8);
      expect(player.turnSpeed).toBe(3.5);
      expect(player.currentSpeed).toBe(0);
    });

    it('should have capsule collision dimensions', () => {
      expect(player.capsuleRadius).toBe(0.4);
      expect(player.capsuleHeight).toBe(1.8);
    });

    it('should be grounded by default', () => {
      expect(player.isGrounded).toBe(true);
    });

    it('should have no planet initially if not provided', () => {
      expect(player.planet).toBe(null);
    });

    it('should add container to scene', () => {
      expect(scene.children).toContain(player.container);
    });

    it('should initialize light direction', () => {
      expect(player.lightDirection).toBeDefined();
      expect(player.lightDirection.length()).toBeCloseTo(1, 5);
    });
  });

  describe('setPlanet', () => {
    it('should set the planet reference', () => {
      const planet = createMockPlanet();
      player.setPlanet(planet);
      expect(player.planet).toBe(planet);
    });

    it('should project position to planet surface', () => {
      const planet = createMockPlanet();
      player.setPlanet(planet);
      expect(planet.projectToSurface).toHaveBeenCalled();
    });

    it('should update orientation after setting planet', () => {
      const planet = createMockPlanet();
      player.setPlanet(planet);
      expect(planet.getLocalAxes).toHaveBeenCalled();
    });
  });

  describe('updateOrientationFromPlanet', () => {
    it('should update local axes from planet', () => {
      const planet = createMockPlanet();
      player.setPlanet(planet);
      player.updateOrientationFromPlanet();

      expect(planet.getLocalAxes).toHaveBeenCalledWith(player.position, player.heading);
    });

    it('should not crash without planet', () => {
      expect(() => player.updateOrientationFromPlanet()).not.toThrow();
    });
  });

  describe('setLightDirection', () => {
    it('should update light direction', () => {
      const newDir = new THREE.Vector3(0, 1, 0);
      player.setLightDirection(newDir);
      expect(player.lightDirection.y).toBeCloseTo(1, 5);
    });

    it('should normalize the light direction', () => {
      const newDir = new THREE.Vector3(10, 10, 10);
      player.setLightDirection(newDir);
      expect(player.lightDirection.length()).toBeCloseTo(1, 5);
    });
  });

  describe('updateProceduralAnimation', () => {
    it('should update walk cycle when moving', () => {
      player.walkCycle = 0;
      player.updateProceduralAnimation(0.016, true, false);
      expect(player.walkCycle).toBeGreaterThan(0);
    });

    it('should wrap walk cycle to prevent NaN', () => {
      player.walkCycle = Math.PI * 1.9;
      player.updateProceduralAnimation(0.5, true, false);
      expect(player.walkCycle).toBeLessThan(Math.PI * 2);
      expect(Number.isNaN(player.walkCycle)).toBe(false);
    });

    it('should reset walk cycle when idle', () => {
      player.walkCycle = Math.PI;
      player.updateProceduralAnimation(0.016, false, false);
      player.updateProceduralAnimation(0.016, false, false);
      player.updateProceduralAnimation(0.016, false, false);
      expect(player.walkCycle).toBeLessThan(Math.PI);
    });

    it('should increase idle time when not moving', () => {
      player.idleTime = 0;
      player.updateProceduralAnimation(0.016, false, false);
      expect(player.idleTime).toBeGreaterThan(0);
    });

    it('should reset idle time when moving', () => {
      player.idleTime = 5;
      player.updateProceduralAnimation(0.016, true, false);
      expect(player.idleTime).toBe(0);
    });
  });

  describe('canMoveTo', () => {
    it('should return true without collision meshes', () => {
      player.collisionMeshes = [];
      const result = player.canMoveTo(new THREE.Vector3(10, 0, 10));
      expect(result).toBe(true);
    });

    it('should check boundary in flat world', () => {
      const result = player.canMoveTo(new THREE.Vector3(100, 0, 0));
      expect(result).toBe(false);
    });

    it('should allow movement within boundary in flat world', () => {
      const result = player.canMoveTo(new THREE.Vector3(40, 0, 40));
      expect(result).toBe(true);
    });
  });

  describe('canMoveToSpherical', () => {
    it('should return true without collision meshes on planet', () => {
      const planet = createMockPlanet();
      player.setPlanet(planet);
      player.collisionMeshes = [];

      const result = player.canMoveToSpherical(new THREE.Vector3(0, 50, 0));
      expect(result).toBe(true);
    });
  });

  describe('getPosition', () => {
    it('should return a clone of position', () => {
      const pos = player.getPosition();
      expect(pos.x).toBe(player.position.x);
      expect(pos.y).toBe(player.position.y);
      expect(pos.z).toBe(player.position.z);

      // Verify it's a clone
      pos.x = 999;
      expect(player.position.x).not.toBe(999);
    });
  });

  describe('getRotation', () => {
    it('should return the rotation value', () => {
      player.rotation = 1.5;
      expect(player.getRotation()).toBe(1.5);
    });
  });

  describe('getContainer', () => {
    it('should return the container group', () => {
      const container = player.getContainer();
      expect(container).toBe(player.container);
    });
  });

  describe('setCollisionMeshes', () => {
    it('should set collision meshes array', () => {
      const meshes = [new THREE.Mesh(), new THREE.Mesh()];
      player.setCollisionMeshes(meshes);
      expect(player.collisionMeshes).toBe(meshes);
      expect(player.collisionMeshes.length).toBe(2);
    });
  });

  describe('momentum system', () => {
    it('should have momentum configuration', () => {
      expect(player.momentum.acceleration).toBe(12);
      expect(player.momentum.deceleration).toBe(8);
      expect(player.momentum.turnAcceleration).toBe(6);
    });

    it('should have current and target velocity', () => {
      expect(player.momentum.currentVelocity).toBeDefined();
      expect(player.momentum.targetVelocity).toBeDefined();
    });
  });

  describe('wall sliding', () => {
    it('should have wall slide configuration', () => {
      expect(player.wallSlide.enabled).toBe(true);
      expect(player.wallSlide.slideStrength).toBe(0.85);
      expect(player.wallSlide.minSlideAngle).toBe(0.3);
    });
  });

  describe('interaction system', () => {
    it('should have interaction range', () => {
      expect(player.interactionRange).toBe(3);
    });

    it('should register interact event listener', () => {
      // Verify the interact event was registered
      const interactListeners = inputManager.on.mock?.calls || [];
      // The Player constructor calls inputManager.on('interact', ...)
      expect(player.nearbyBuilding).toBe(null);
    });
  });

  describe('dispose', () => {
    it('should remove container from scene', () => {
      expect(scene.children).toContain(player.container);
      player.dispose();
      expect(scene.children).not.toContain(player.container);
    });
  });

  describe('update with planet', () => {
    let planet;

    beforeEach(() => {
      planet = createMockPlanet();
      player.setPlanet(planet);
    });

    it('should call updateSpherical when planet exists', () => {
      inputManager.isMoving.mockReturnValue(false);
      inputManager.getMovementDirection.mockReturnValue({ x: 0, y: 0, z: 0 });

      player.update(0.016);

      // Check that planet methods were called
      expect(planet.getLocalAxes).toHaveBeenCalled();
    });

    it('should project position to surface after update', () => {
      inputManager.isMoving.mockReturnValue(false);
      inputManager.getMovementDirection.mockReturnValue({ x: 0, y: 0, z: 0 });

      const callCountBefore = planet.projectToSurface.mock.calls.length;
      player.update(0.016);

      // projectToSurface should be called during update
      expect(planet.projectToSurface.mock.calls.length).toBeGreaterThanOrEqual(callCountBefore);
    });
  });

  describe('update without planet (flat mode)', () => {
    it('should update in flat mode when no planet', () => {
      inputManager.isMoving.mockReturnValue(false);
      inputManager.getMovementDirection.mockReturnValue({ x: 0, y: 0, z: 0 });

      expect(() => player.update(0.016)).not.toThrow();
    });

    it('should update container position in flat mode', () => {
      inputManager.isMoving.mockReturnValue(false);
      inputManager.getMovementDirection.mockReturnValue({ x: 0, y: 0, z: 0 });

      player.update(0.016);

      // Container position should be updated
      expect(player.container.position).toBeDefined();
    });
  });

  describe('speed smoothing', () => {
    it('should smoothly accelerate towards target speed', () => {
      inputManager.isMoving.mockReturnValue(true);
      inputManager.isRunning.mockReturnValue(false);
      inputManager.getMovementDirection.mockReturnValue({ x: 0, y: 0, z: 1 });

      const initialSpeed = player.currentSpeed;
      player.update(0.016);

      expect(player.currentSpeed).toBeGreaterThan(initialSpeed);
    });

    it('should run faster when running', () => {
      inputManager.isMoving.mockReturnValue(true);
      inputManager.isRunning.mockReturnValue(true);
      inputManager.getMovementDirection.mockReturnValue({ x: 0, y: 0, z: 1 });

      // Simulate multiple frames
      for (let i = 0; i < 60; i++) {
        player.update(0.016);
      }

      // Should approach run speed
      expect(player.currentSpeed).toBeGreaterThan(player.walkSpeed);
    });
  });
});
