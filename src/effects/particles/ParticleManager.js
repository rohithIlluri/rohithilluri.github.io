/**
 * ParticleManager.js - Manages particle systems in the scene
 * Handles creation, updating, and disposal of particle emitters
 */

import * as THREE from 'three';

export class ParticleManager {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.quality = options.quality || 'medium';
    this.emitters = [];
    this.particlePool = [];

    // Quality-based settings
    this.maxParticles = this.quality === 'low' ? 100 : this.quality === 'medium' ? 300 : 500;
  }

  /**
   * Create a particle system
   * @param {Object} config - Particle system configuration
   * @returns {Object} Particle emitter
   */
  createEmitter(config) {
    const {
      count = 50,
      texture = null,
      color = 0xffffff,
      size = 0.1,
      opacity = 1,
      blending = THREE.AdditiveBlending,
      bounds = null,
    } = config;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const ages = new Float32Array(count);

    // Initialize particles
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
      lifetimes[i] = 0;
      ages[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create material
    const material = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      blending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    if (texture) {
      material.map = texture;
    }

    // Create points mesh
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    const emitter = {
      points,
      geometry,
      material,
      positions,
      velocities,
      lifetimes,
      ages,
      count,
      bounds,
      active: true,
      config,
    };

    this.emitters.push(emitter);
    return emitter;
  }

  /**
   * Update all particle emitters
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    for (const emitter of this.emitters) {
      if (!emitter.active) continue;

      // Update particle positions based on their specific update logic
      if (emitter.updateCallback) {
        emitter.updateCallback(emitter, deltaTime);
      }

      // Mark geometry for update
      emitter.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Remove an emitter
   * @param {Object} emitter - Emitter to remove
   */
  removeEmitter(emitter) {
    const index = this.emitters.indexOf(emitter);
    if (index > -1) {
      this.scene.remove(emitter.points);
      emitter.geometry.dispose();
      emitter.material.dispose();
      this.emitters.splice(index, 1);
    }
  }

  /**
   * Clean up all resources
   */
  dispose() {
    for (const emitter of this.emitters) {
      this.scene.remove(emitter.points);
      emitter.geometry.dispose();
      emitter.material.dispose();
    }
    this.emitters = [];
  }
}
