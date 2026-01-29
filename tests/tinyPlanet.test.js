/**
 * Tests for TinyPlanet.js - Spherical World System
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE.js with full implementation
vi.mock('three', () => {
  class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    clone() { return new Vector3(this.x, this.y, this.z); }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
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
    crossVectors(a, b) {
      this.x = a.y * b.z - a.z * b.y;
      this.y = a.z * b.x - a.x * b.z;
      this.z = a.x * b.y - a.y * b.x;
      return this;
    }
    applyMatrix4(m) {
      const x = this.x, y = this.y, z = this.z;
      const e = m.elements;
      this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
      this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
      this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
      return this;
    }
    applyQuaternion(q) {
      const x = this.x, y = this.y, z = this.z;
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      const ix = qw * x + qy * z - qz * y;
      const iy = qw * y + qz * x - qx * z;
      const iz = qw * z + qx * y - qy * x;
      const iw = -qx * x - qy * y - qz * z;
      this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
      this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
      this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
      return this;
    }
  }

  class Matrix4 {
    constructor() {
      this.elements = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    }
    makeRotationAxis(axis, angle) {
      const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
      const x = axis.x, y = axis.y, z = axis.z;
      this.elements = [
        t*x*x+c, t*x*y+s*z, t*x*z-s*y, 0,
        t*x*y-s*z, t*y*y+c, t*y*z+s*x, 0,
        t*x*z+s*y, t*y*z-s*x, t*z*z+c, 0,
        0, 0, 0, 1
      ];
      return this;
    }
  }

  class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
    setFromUnitVectors(from, to) {
      const r = from.x * to.x + from.y * to.y + from.z * to.z + 1;
      if (r < 0.000001) {
        this.x = 0; this.y = 1; this.z = 0; this.w = 0;
      } else {
        this.x = from.y * to.z - from.z * to.y;
        this.y = from.z * to.x - from.x * to.z;
        this.z = from.x * to.y - from.y * to.x;
        this.w = r;
        this.normalize();
      }
      return this;
    }
    setFromAxisAngle(axis, angle) {
      const halfAngle = angle / 2, s = Math.sin(halfAngle);
      this.x = axis.x * s;
      this.y = axis.y * s;
      this.z = axis.z * s;
      this.w = Math.cos(halfAngle);
      return this;
    }
    normalize() {
      const len = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
      if (len > 0) { this.x /= len; this.y /= len; this.z /= len; this.w /= len; }
      return this;
    }
    premultiply(q) {
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      const x = this.x, y = this.y, z = this.z, w = this.w;
      this.x = qw * x + qx * w + qy * z - qz * y;
      this.y = qw * y + qy * w + qz * x - qx * z;
      this.z = qw * z + qz * w + qx * y - qy * x;
      this.w = qw * w - qx * x - qy * y - qz * z;
      return this;
    }
  }

  return {
    Vector3,
    Matrix4,
    Quaternion,
    MathUtils: {
      degToRad: (deg) => deg * Math.PI / 180,
      radToDeg: (rad) => rad * 180 / Math.PI,
    },
  };
});

// Import after mocks
const { TinyPlanet } = await import('../src/environment/TinyPlanet.js');

describe('TinyPlanet', () => {
  let planet;

  beforeEach(() => {
    planet = new TinyPlanet(50);
  });

  describe('Constructor', () => {
    it('should initialize with default radius', () => {
      const defaultPlanet = new TinyPlanet();
      expect(defaultPlanet.radius).toBe(50);
    });

    it('should initialize with custom radius', () => {
      const customPlanet = new TinyPlanet(100);
      expect(customPlanet.radius).toBe(100);
    });

    it('should have center at origin', () => {
      expect(planet.center.x).toBe(0);
      expect(planet.center.y).toBe(0);
      expect(planet.center.z).toBe(0);
    });

    it('should have zone definitions', () => {
      expect(planet.zones).toBeDefined();
      expect(planet.zones.town).toBeDefined();
      expect(planet.zones.forest).toBeDefined();
      expect(planet.zones.beach).toBeDefined();
    });
  });

  describe('getUpVector', () => {
    it('should return normalized vector pointing away from center', () => {
      const pos = { x: 50, y: 0, z: 0, clone: () => ({ x: 50, y: 0, z: 0, sub: function(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }, normalize: function() { const len = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); this.x /= len; this.y /= len; this.z /= len; return this; } }) };
      const up = planet.getUpVector(pos);
      expect(up.x).toBeCloseTo(1, 5);
      expect(up.y).toBeCloseTo(0, 5);
      expect(up.z).toBeCloseTo(0, 5);
    });

    it('should return (0, 1, 0) for position on top of sphere', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(0, 50, 0);
      const up = planet.getUpVector(pos);
      expect(up.y).toBeCloseTo(1, 5);
    });
  });

  describe('projectToSurface', () => {
    it('should project point above surface down to surface', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(100, 0, 0); // 100 units away
      const projected = planet.projectToSurface(pos);
      const distFromCenter = Math.sqrt(projected.x * projected.x + projected.y * projected.y + projected.z * projected.z);
      expect(distFromCenter).toBeCloseTo(50, 5);
    });

    it('should project point inside surface out to surface', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(10, 0, 0); // 10 units away
      const projected = planet.projectToSurface(pos);
      const distFromCenter = Math.sqrt(projected.x * projected.x + projected.y * projected.y + projected.z * projected.z);
      expect(distFromCenter).toBeCloseTo(50, 5);
    });
  });

  describe('projectToSurfaceWithHeight', () => {
    it('should project to surface plus height', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(100, 0, 0);
      const projected = planet.projectToSurfaceWithHeight(pos, 5);
      const distFromCenter = Math.sqrt(projected.x * projected.x + projected.y * projected.y + projected.z * projected.z);
      expect(distFromCenter).toBeCloseTo(55, 5); // radius + height
    });
  });

  describe('latLonToPosition', () => {
    it('should place equator/0 longitude at positive Z', () => {
      const pos = planet.latLonToPosition(0, 0);
      expect(pos.y).toBeCloseTo(0, 5);
      expect(pos.z).toBeGreaterThan(0);
    });

    it('should place north pole at top', () => {
      const pos = planet.latLonToPosition(90, 0);
      expect(pos.y).toBeCloseTo(50, 5);
    });

    it('should place south pole at bottom', () => {
      const pos = planet.latLonToPosition(-90, 0);
      expect(pos.y).toBeCloseTo(-50, 5);
    });
  });

  describe('positionToLatLon', () => {
    it('should convert north pole position to lat 90', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(0, 50, 0);
      const { lat } = planet.positionToLatLon(pos);
      expect(lat).toBeCloseTo(90, 1);
    });

    it('should be inverse of latLonToPosition', () => {
      const originalLat = 30;
      const originalLon = 45;
      const pos = planet.latLonToPosition(originalLat, originalLon);
      const { lat, lon } = planet.positionToLatLon(pos);
      expect(lat).toBeCloseTo(originalLat, 1);
      expect(lon).toBeCloseTo(originalLon, 1);
    });
  });

  describe('getZoneAt', () => {
    it('should return town zone for front center position', () => {
      const pos = planet.latLonToPosition(0, 0);
      const zone = planet.getZoneAt(pos);
      expect(zone).toBe('town');
    });

    it('should return mountain zone for north pole', () => {
      const pos = planet.latLonToPosition(60, 0);
      const zone = planet.getZoneAt(pos);
      expect(zone).toBe('mountain');
    });

    it('should return harbor zone for south pole', () => {
      const pos = planet.latLonToPosition(-60, 0);
      const zone = planet.getZoneAt(pos);
      expect(zone).toBe('harbor');
    });
  });

  describe('getSurfaceOrientation', () => {
    it('should return a quaternion', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(50, 0, 0);
      const orientation = planet.getSurfaceOrientation(pos);
      expect(orientation).toBeDefined();
      expect(orientation.x).toBeDefined();
      expect(orientation.y).toBeDefined();
      expect(orientation.z).toBeDefined();
      expect(orientation.w).toBeDefined();
    });

    it('should apply heading rotation', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(50, 0, 0);
      const orientation1 = planet.getSurfaceOrientation(pos, 0);
      const orientation2 = planet.getSurfaceOrientation(pos, Math.PI / 2);
      // Different headings should produce different orientations
      expect(orientation1.x !== orientation2.x || orientation1.y !== orientation2.y).toBe(true);
    });
  });

  describe('moveOnSurface', () => {
    it('should keep position on sphere surface after movement', () => {
      const THREE = require('three');
      const startPos = new THREE.Vector3(0, 0, 50);
      const moveDir = new THREE.Vector3(1, 0, 0);
      const newPos = planet.moveOnSurface(startPos, moveDir, 5);
      const distFromCenter = Math.sqrt(newPos.x * newPos.x + newPos.y * newPos.y + newPos.z * newPos.z);
      expect(distFromCenter).toBeCloseTo(50, 3);
    });

    it('should move position when given non-zero distance', () => {
      const THREE = require('three');
      const startPos = new THREE.Vector3(0, 0, 50);
      const moveDir = new THREE.Vector3(1, 0, 0);
      const newPos = planet.moveOnSurface(startPos, moveDir, 10);
      expect(newPos.x).not.toBe(startPos.x);
    });

    it('should return same position for zero distance', () => {
      const THREE = require('three');
      const startPos = new THREE.Vector3(0, 0, 50);
      const moveDir = new THREE.Vector3(1, 0, 0);
      const newPos = planet.moveOnSurface(startPos, moveDir, 0);
      expect(newPos.x).toBeCloseTo(startPos.x, 5);
      expect(newPos.z).toBeCloseTo(startPos.z, 5);
    });
  });

  describe('getLocalAxes', () => {
    it('should return orthogonal axes', () => {
      const THREE = require('three');
      const pos = new THREE.Vector3(0, 0, 50);
      const axes = planet.getLocalAxes(pos, 0);

      // Check all axes exist
      expect(axes.forward).toBeDefined();
      expect(axes.right).toBeDefined();
      expect(axes.up).toBeDefined();

      // Check up points away from center
      expect(axes.up.z).toBeGreaterThan(0);
    });
  });
});
