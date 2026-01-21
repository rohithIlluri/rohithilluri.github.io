/**
 * ParticleManager.js - Pooled Particle System
 * GPU-instanced particle system with Float32Array storage
 * Quality-aware with configurable particle counts
 */

import * as THREE from 'three';

// Quality presets for particle counts
const QUALITY_PARTICLE_LIMITS = {
  high: 2000,
  medium: 1000,
  low: 300,
};

// Particle data stride (x, y, z, vx, vy, vz, life, maxLife, size, type)
const PARTICLE_STRIDE = 10;

/**
 * Single Particle System for one type of effect
 */
export class ParticleSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.maxParticles = options.maxParticles || 500;
    this.gravity = options.gravity !== undefined ? options.gravity : -2.0;
    this.drag = options.drag !== undefined ? options.drag : 0.98;

    // Particle data array: [x, y, z, vx, vy, vz, life, maxLife, size, type]
    this.particleData = new Float32Array(this.maxParticles * PARTICLE_STRIDE);
    this.activeCount = 0;

    // Particle color (can be overridden per particle)
    this.baseColor = new THREE.Color(options.color || 0xFFFFFF);

    // Create instanced mesh for GPU rendering
    this.createInstancedMesh(options);
  }

  createInstancedMesh(options) {
    // Simple quad geometry for particles
    const size = options.baseSize || 0.1;
    const geometry = options.geometry || new THREE.PlaneGeometry(size, size);

    // Particle material
    const material = new THREE.MeshBasicMaterial({
      color: this.baseColor,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: options.blending || THREE.NormalBlending,
    });

    // Create instanced mesh
    this.mesh = new THREE.InstancedMesh(geometry, material, this.maxParticles);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;

    // Instance colors
    this.instanceColors = new Float32Array(this.maxParticles * 3);
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
      this.instanceColors,
      3
    );

    // Initialize all as invisible
    const dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    for (let i = 0; i < this.maxParticles; i++) {
      this.mesh.setMatrixAt(i, dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  /**
   * Emit a particle
   * @param {Object} params Particle parameters
   */
  emit(params) {
    if (this.activeCount >= this.maxParticles) {
      // Recycle oldest particle
      this.recycleOldest();
    }

    const index = this.activeCount * PARTICLE_STRIDE;

    // Position
    this.particleData[index] = params.x || 0;
    this.particleData[index + 1] = params.y || 0;
    this.particleData[index + 2] = params.z || 0;

    // Velocity
    this.particleData[index + 3] = params.vx || 0;
    this.particleData[index + 4] = params.vy || 0;
    this.particleData[index + 5] = params.vz || 0;

    // Life
    this.particleData[index + 6] = params.life || 1.0;
    this.particleData[index + 7] = params.life || 1.0; // maxLife

    // Size
    this.particleData[index + 8] = params.size || 0.1;

    // Type (for color lookup)
    this.particleData[index + 9] = params.type || 0;

    // Set color
    if (params.color) {
      const color = new THREE.Color(params.color);
      this.instanceColors[this.activeCount * 3] = color.r;
      this.instanceColors[this.activeCount * 3 + 1] = color.g;
      this.instanceColors[this.activeCount * 3 + 2] = color.b;
      this.mesh.instanceColor.needsUpdate = true;
    }

    this.activeCount++;
  }

  /**
   * Emit multiple particles at once (burst)
   * @param {Object} params Base parameters
   * @param {number} count Number of particles
   * @param {Object} variance Random variance to apply
   */
  burst(params, count, variance = {}) {
    for (let i = 0; i < count; i++) {
      const p = { ...params };

      // Apply variance
      if (variance.position) {
        p.x = (params.x || 0) + (Math.random() - 0.5) * variance.position;
        p.y = (params.y || 0) + (Math.random() - 0.5) * variance.position;
        p.z = (params.z || 0) + (Math.random() - 0.5) * variance.position;
      }

      if (variance.velocity) {
        p.vx = (params.vx || 0) + (Math.random() - 0.5) * variance.velocity;
        p.vy = (params.vy || 0) + (Math.random() - 0.5) * variance.velocity;
        p.vz = (params.vz || 0) + (Math.random() - 0.5) * variance.velocity;
      }

      if (variance.size) {
        p.size = (params.size || 0.1) * (0.5 + Math.random() * variance.size);
      }

      if (variance.life) {
        p.life = (params.life || 1.0) * (0.5 + Math.random() * variance.life);
      }

      this.emit(p);
    }
  }

  recycleOldest() {
    // Shift all particles down, removing the first one
    for (let i = PARTICLE_STRIDE; i < this.activeCount * PARTICLE_STRIDE; i++) {
      this.particleData[i - PARTICLE_STRIDE] = this.particleData[i];
    }
    this.activeCount--;
  }

  /**
   * Update all particles
   * @param {number} deltaTime Time since last frame
   */
  update(deltaTime) {
    const dummy = new THREE.Object3D();
    let i = 0;

    while (i < this.activeCount) {
      const index = i * PARTICLE_STRIDE;

      // Update life
      this.particleData[index + 6] -= deltaTime;

      if (this.particleData[index + 6] <= 0) {
        // Particle is dead, swap with last active
        this.swapWithLast(i);
        continue;
      }

      // Apply gravity
      this.particleData[index + 4] += this.gravity * deltaTime;

      // Apply drag
      this.particleData[index + 3] *= this.drag;
      this.particleData[index + 4] *= this.drag;
      this.particleData[index + 5] *= this.drag;

      // Update position
      this.particleData[index] += this.particleData[index + 3] * deltaTime;
      this.particleData[index + 1] += this.particleData[index + 4] * deltaTime;
      this.particleData[index + 2] += this.particleData[index + 5] * deltaTime;

      // Calculate life ratio for fade/scale
      const lifeRatio = this.particleData[index + 6] / this.particleData[index + 7];
      const size = this.particleData[index + 8] * lifeRatio;

      // Update instance matrix
      dummy.position.set(
        this.particleData[index],
        this.particleData[index + 1],
        this.particleData[index + 2]
      );
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);

      // Fade alpha based on life
      // (Would need custom shader for per-instance alpha)

      i++;
    }

    // Hide inactive particles
    const hiddenDummy = new THREE.Object3D();
    hiddenDummy.scale.set(0, 0, 0);
    hiddenDummy.updateMatrix();
    for (let j = this.activeCount; j < this.maxParticles; j++) {
      this.mesh.setMatrixAt(j, hiddenDummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  swapWithLast(index) {
    const lastIndex = (this.activeCount - 1) * PARTICLE_STRIDE;
    const currentIndex = index * PARTICLE_STRIDE;

    for (let i = 0; i < PARTICLE_STRIDE; i++) {
      this.particleData[currentIndex + i] = this.particleData[lastIndex + i];
    }

    // Swap colors
    const colorIndex = index * 3;
    const lastColorIndex = (this.activeCount - 1) * 3;
    this.instanceColors[colorIndex] = this.instanceColors[lastColorIndex];
    this.instanceColors[colorIndex + 1] = this.instanceColors[lastColorIndex + 1];
    this.instanceColors[colorIndex + 2] = this.instanceColors[lastColorIndex + 2];

    this.activeCount--;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}

/**
 * ParticleManager - Manages multiple particle systems
 */
export class ParticleManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.quality = options.quality || 'high';
    this.maxParticles = QUALITY_PARTICLE_LIMITS[this.quality];

    // Particle systems by type
    this.systems = new Map();

    // Create default systems
    this.createDefaultSystems();

    // Active emitters
    this.emitters = [];
  }

  createDefaultSystems() {
    // Dust particles (footsteps, impacts)
    this.systems.set('dust', new ParticleSystem(this.scene, {
      maxParticles: Math.floor(this.maxParticles * 0.2),
      gravity: -0.5,
      drag: 0.95,
      color: 0xA0A0A0,
      baseSize: 0.08,
    }));

    // Water splash
    this.systems.set('splash', new ParticleSystem(this.scene, {
      maxParticles: Math.floor(this.maxParticles * 0.15),
      gravity: -3.0,
      drag: 0.98,
      color: 0x4FC3F7,
      baseSize: 0.06,
    }));

    // Leaves (ambient)
    this.systems.set('leaves', new ParticleSystem(this.scene, {
      maxParticles: Math.floor(this.maxParticles * 0.15),
      gravity: -0.3,
      drag: 0.99,
      color: 0x7CB342,
      baseSize: 0.1,
    }));

    // Fireflies (night ambient)
    this.systems.set('fireflies', new ParticleSystem(this.scene, {
      maxParticles: Math.floor(this.maxParticles * 0.05),
      gravity: 0,
      drag: 1.0,
      color: 0xFFFF00,
      baseSize: 0.03,
      blending: THREE.AdditiveBlending,
    }));

    // Sparkles (generic magic/highlight)
    this.systems.set('sparkle', new ParticleSystem(this.scene, {
      maxParticles: Math.floor(this.maxParticles * 0.1),
      gravity: -0.2,
      drag: 0.97,
      color: 0xFFD700,
      baseSize: 0.05,
      blending: THREE.AdditiveBlending,
    }));
  }

  /**
   * Get a particle system by type
   * @param {string} type System type
   * @returns {ParticleSystem} The particle system
   */
  getSystem(type) {
    return this.systems.get(type);
  }

  /**
   * Emit particles from a system
   * @param {string} type System type
   * @param {Object} params Particle parameters
   */
  emit(type, params) {
    const system = this.systems.get(type);
    if (system) {
      system.emit(params);
    }
  }

  /**
   * Emit a burst of particles
   * @param {string} type System type
   * @param {Object} params Base parameters
   * @param {number} count Number of particles
   * @param {Object} variance Random variance
   */
  burst(type, params, count, variance) {
    const system = this.systems.get(type);
    if (system) {
      system.burst(params, count, variance);
    }
  }

  /**
   * Add a continuous emitter
   * @param {Object} emitter Emitter configuration
   */
  addEmitter(emitter) {
    this.emitters.push({
      ...emitter,
      timer: 0,
    });
  }

  /**
   * Remove an emitter by id
   * @param {string} id Emitter id
   */
  removeEmitter(id) {
    this.emitters = this.emitters.filter((e) => e.id !== id);
  }

  /**
   * Set quality level
   * @param {string} quality 'low', 'medium', or 'high'
   */
  setQuality(quality) {
    this.quality = quality;
    this.maxParticles = QUALITY_PARTICLE_LIMITS[quality];
    // Note: Would need to recreate systems to change limits
  }

  /**
   * Update all particle systems and emitters
   * @param {number} deltaTime Time since last frame
   */
  update(deltaTime) {
    // Update emitters
    this.emitters.forEach((emitter) => {
      emitter.timer += deltaTime;

      if (emitter.timer >= emitter.rate) {
        emitter.timer = 0;

        // Get position (can be a function for moving emitters)
        let pos = emitter.position;
        if (typeof pos === 'function') {
          pos = pos();
        }

        const params = {
          x: pos.x + (Math.random() - 0.5) * (emitter.spread || 0),
          y: pos.y + (Math.random() - 0.5) * (emitter.spread || 0),
          z: pos.z + (Math.random() - 0.5) * (emitter.spread || 0),
          vx: emitter.velocity?.x || 0,
          vy: emitter.velocity?.y || 0,
          vz: emitter.velocity?.z || 0,
          life: emitter.life || 1.0,
          size: emitter.size || 0.1,
          color: emitter.color,
        };

        this.emit(emitter.type, params);
      }
    });

    // Update all particle systems
    this.systems.forEach((system) => {
      system.update(deltaTime);
    });
  }

  dispose() {
    this.systems.forEach((system) => system.dispose());
    this.systems.clear();
    this.emitters = [];
  }
}

export { QUALITY_PARTICLE_LIMITS };
