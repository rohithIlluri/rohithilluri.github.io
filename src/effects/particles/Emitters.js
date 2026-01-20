/**
 * Emitters.js - Particle emitter factories
 * Creates firefly and leaf particle effects
 */

import * as THREE from 'three';

/**
 * Create a firefly emitter for nighttime ambient effect
 * @param {ParticleManager} particleManager - The particle manager instance
 * @param {Object} bounds - Spawn bounds { min: Vector3, max: Vector3 }
 * @param {number} count - Number of fireflies
 * @returns {Object} Firefly emitter with update method
 */
export function createFireflyEmitter(particleManager, bounds, count = 30) {
  const emitter = particleManager.createEmitter({
    count,
    color: 0xFFFF88,
    size: 0.15,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    bounds,
  });

  // Initialize firefly positions within bounds
  const positions = emitter.positions;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x);
    positions[i * 3 + 1] = THREE.MathUtils.randFloat(bounds.min.y, bounds.max.y);
    positions[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z);

    // Random phase for flickering
    emitter.ages[i] = Math.random() * Math.PI * 2;
    // Random speed multiplier
    emitter.lifetimes[i] = 0.5 + Math.random() * 1.5;
  }

  emitter.geometry.attributes.position.needsUpdate = true;

  // Firefly-specific state
  let currentOpacity = 0;
  let targetOpacity = 0;

  return {
    emitter,
    update(deltaTime, isNight) {
      // Fade in/out based on night state
      targetOpacity = isNight ? 0.8 : 0;
      currentOpacity = THREE.MathUtils.lerp(currentOpacity, targetOpacity, deltaTime * 2);
      emitter.material.opacity = currentOpacity;

      if (!isNight && currentOpacity < 0.01) return;

      // Animate fireflies
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const phase = emitter.ages[i];
        const speed = emitter.lifetimes[i];

        // Gentle floating motion
        emitter.ages[i] += deltaTime * speed;

        // Circular wandering pattern
        positions[idx] += Math.sin(phase) * deltaTime * 0.5;
        positions[idx + 1] += Math.sin(phase * 0.7) * deltaTime * 0.3;
        positions[idx + 2] += Math.cos(phase) * deltaTime * 0.5;

        // Keep within bounds
        if (positions[idx] < bounds.min.x || positions[idx] > bounds.max.x) {
          positions[idx] = THREE.MathUtils.clamp(positions[idx], bounds.min.x, bounds.max.x);
        }
        if (positions[idx + 1] < bounds.min.y || positions[idx + 1] > bounds.max.y) {
          positions[idx + 1] = THREE.MathUtils.clamp(positions[idx + 1], bounds.min.y, bounds.max.y);
        }
        if (positions[idx + 2] < bounds.min.z || positions[idx + 2] > bounds.max.z) {
          positions[idx + 2] = THREE.MathUtils.clamp(positions[idx + 2], bounds.min.z, bounds.max.z);
        }
      }

      emitter.geometry.attributes.position.needsUpdate = true;
    },
  };
}

/**
 * Create leaf particle emitters for ambient falling leaves
 * @param {ParticleManager} particleManager - The particle manager instance
 * @param {Object} bounds - Spawn bounds { min: {x,y,z}, max: {x,y,z} }
 * @param {number} count - Number of leaves
 * @returns {Array} Array of leaf emitters
 */
export function createLeafEmitter(particleManager, bounds, count = 20) {
  const emitter = particleManager.createEmitter({
    count,
    color: 0xCC8844,
    size: 0.2,
    opacity: 0.7,
    blending: THREE.NormalBlending,
    bounds,
  });

  // Initialize leaf positions
  const positions = emitter.positions;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x);
    positions[i * 3 + 1] = THREE.MathUtils.randFloat(bounds.min.y, bounds.max.y);
    positions[i * 3 + 2] = THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z);

    // Random phase for swaying
    emitter.ages[i] = Math.random() * Math.PI * 2;
    // Fall speed
    emitter.lifetimes[i] = 0.3 + Math.random() * 0.5;
  }

  emitter.geometry.attributes.position.needsUpdate = true;

  // Set up update callback
  emitter.updateCallback = (em, deltaTime) => {
    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // Update phase
      em.ages[i] += deltaTime * 2;

      // Falling with horizontal sway
      positions[idx] += Math.sin(em.ages[i]) * deltaTime * 0.8;
      positions[idx + 1] -= em.lifetimes[i] * deltaTime;
      positions[idx + 2] += Math.cos(em.ages[i] * 0.7) * deltaTime * 0.5;

      // Reset leaf when it falls below ground
      if (positions[idx + 1] < bounds.min.y) {
        positions[idx] = THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x);
        positions[idx + 1] = bounds.max.y;
        positions[idx + 2] = THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z);
        em.ages[i] = Math.random() * Math.PI * 2;
      }
    }
  };

  return [emitter];
}
