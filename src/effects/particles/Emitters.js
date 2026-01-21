/**
 * Emitters.js - Pre-configured Particle Emitters
 * Footstep dust, water splash, ambient leaves, fireflies
 */

import * as THREE from 'three';

// Ground type colors for footstep dust
const GROUND_COLORS = {
  concrete: 0x8B8B8B,
  asphalt: 0x4A4A4A,
  grass: 0x5D4037,
  sand: 0xD4A574,
  dirt: 0x6D4C41,
  water: 0x4FC3F7,
};

// Leaf colors for autumn variation
const LEAF_COLORS = [
  0x7CB342, // Green
  0xFFA726, // Orange
  0x8D6E63, // Brown
  0xAED581, // Light green
  0xFF7043, // Deep orange
];

/**
 * Footstep Dust Emitter
 * Creates dust puffs when walking
 */
export function emitFootstepDust(particleManager, position, groundType = 'concrete', isRunning = false) {
  const system = particleManager.getSystem('dust');
  if (!system) return;

  const count = isRunning ? 5 : 3;
  const color = GROUND_COLORS[groundType] || GROUND_COLORS.concrete;

  // Emit particles in a small burst
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.3;

    system.emit({
      x: position.x + (Math.random() - 0.5) * 0.2,
      y: position.y + 0.05,
      z: position.z + (Math.random() - 0.5) * 0.2,
      vx: Math.cos(angle) * speed,
      vy: 0.5 + Math.random() * 0.3,
      vz: Math.sin(angle) * speed,
      life: 0.5 + Math.random() * 0.2,
      size: 0.05 + Math.random() * 0.1,
      color: color,
    });
  }
}

/**
 * Water Splash Emitter
 * Creates splash effect when entering water
 */
export function emitWaterSplash(particleManager, position, intensity = 1.0) {
  const system = particleManager.getSystem('splash');
  if (!system) return;

  const count = Math.floor(10 + intensity * 10);

  // Ring of splash particles
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 0.5 + Math.random() * 0.5;
    const speed = 1.5 + Math.random() * 1.5;

    system.emit({
      x: position.x + Math.cos(angle) * 0.1,
      y: position.y,
      z: position.z + Math.sin(angle) * 0.1,
      vx: Math.cos(angle) * speed * radius,
      vy: 3.0 + Math.random() * 1.0,
      vz: Math.sin(angle) * speed * radius,
      life: 0.6 + Math.random() * 0.4,
      size: 0.04 + Math.random() * 0.04,
      color: Math.random() > 0.7 ? 0xFFFFFF : 0x4FC3F7, // Mix foam and water
    });
  }
}

/**
 * Leaf Fall Emitter
 * Continuous ambient falling leaves
 */
export function createLeafEmitter(particleManager, bounds, count = 30) {
  const emitters = [];

  for (let i = 0; i < count; i++) {
    // Staggered spawn times
    const delay = (i / count) * 5; // Spread over 5 seconds

    setTimeout(() => {
      const id = `leaf_${i}`;

      particleManager.addEmitter({
        id,
        type: 'leaves',
        rate: 5 + Math.random() * 3, // 5-8 seconds between spawns
        position: () => ({
          x: bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
          y: bounds.max.y + Math.random() * 2,
          z: bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z),
        }),
        velocity: {
          x: (Math.random() - 0.5) * 0.5, // Slight drift
          y: -0.2,
          z: (Math.random() - 0.5) * 0.5,
        },
        life: 5 + Math.random() * 3,
        size: 0.08 + Math.random() * 0.04,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        spread: 0.5,
      });

      emitters.push(id);
    }, delay * 1000);
  }

  return emitters;
}

/**
 * Firefly Emitter
 * Night-time ambient fireflies with random walk
 */
export function createFireflyEmitter(particleManager, bounds, count = 40) {
  const fireflies = [];

  // Pre-spawn fireflies
  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3(
      bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
      bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y),
      bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
    );

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.5
    );

    fireflies.push({
      position,
      velocity,
      phase: Math.random() * Math.PI * 2, // For pulsing
      wanderTimer: 0,
      bounds,
    });
  }

  // Return update function
  return {
    fireflies,
    update: (deltaTime, isNight) => {
      if (!isNight) return;

      const system = particleManager.getSystem('fireflies');
      if (!system) return;

      fireflies.forEach((firefly) => {
        // Random walk
        firefly.wanderTimer += deltaTime;
        if (firefly.wanderTimer > 0.5) {
          firefly.wanderTimer = 0;
          firefly.velocity.x += (Math.random() - 0.5) * 0.2;
          firefly.velocity.y += (Math.random() - 0.5) * 0.1;
          firefly.velocity.z += (Math.random() - 0.5) * 0.2;

          // Clamp velocity
          firefly.velocity.clampLength(0, 0.5);
        }

        // Update position
        firefly.position.add(firefly.velocity.clone().multiplyScalar(deltaTime));

        // Bounce off bounds
        if (firefly.position.x < firefly.bounds.min.x || firefly.position.x > firefly.bounds.max.x) {
          firefly.velocity.x *= -1;
          firefly.position.x = THREE.MathUtils.clamp(
            firefly.position.x,
            firefly.bounds.min.x,
            firefly.bounds.max.x
          );
        }
        if (firefly.position.y < firefly.bounds.min.y || firefly.position.y > firefly.bounds.max.y) {
          firefly.velocity.y *= -1;
          firefly.position.y = THREE.MathUtils.clamp(
            firefly.position.y,
            firefly.bounds.min.y,
            firefly.bounds.max.y
          );
        }
        if (firefly.position.z < firefly.bounds.min.z || firefly.position.z > firefly.bounds.max.z) {
          firefly.velocity.z *= -1;
          firefly.position.z = THREE.MathUtils.clamp(
            firefly.position.z,
            firefly.bounds.min.z,
            firefly.bounds.max.z
          );
        }

        // Pulsing glow
        firefly.phase += deltaTime * 3;
        const pulse = Math.sin(firefly.phase) * 0.5 + 0.5;

        // Emit firefly particle (very short life, constantly re-emitted)
        if (pulse > 0.3) {
          system.emit({
            x: firefly.position.x,
            y: firefly.position.y,
            z: firefly.position.z,
            vx: 0,
            vy: 0,
            vz: 0,
            life: 0.1,
            size: 0.02 + pulse * 0.02,
            color: 0xFFFF00,
          });
        }
      });
    },
  };
}

/**
 * Steam Emitter
 * For manholes and vents
 */
export function createSteamEmitter(particleManager, position, options = {}) {
  const id = `steam_${position.x}_${position.z}`;

  particleManager.addEmitter({
    id,
    type: 'dust',
    rate: options.rate || 0.1, // Fast emission
    position: () => ({
      x: position.x + (Math.random() - 0.5) * 0.3,
      y: position.y,
      z: position.z + (Math.random() - 0.5) * 0.3,
    }),
    velocity: {
      x: (Math.random() - 0.5) * 0.2,
      y: 1.5 + Math.random() * 0.5,
      z: (Math.random() - 0.5) * 0.2,
    },
    life: 1.5 + Math.random() * 0.5,
    size: 0.15 + Math.random() * 0.1,
    color: 0xCCCCCC,
    spread: 0.2,
  });

  return id;
}

/**
 * Impact Sparkle Emitter
 * For impacts and interactions
 */
export function emitImpactSparkle(particleManager, position, color = 0xFFD700, count = 8) {
  const system = particleManager.getSystem('sparkle');
  if (!system) return;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 1.0 + Math.random() * 1.0;

    system.emit({
      x: position.x,
      y: position.y,
      z: position.z,
      vx: Math.cos(angle) * speed,
      vy: 1.0 + Math.random() * 0.5,
      vz: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.2,
      size: 0.03 + Math.random() * 0.03,
      color: color,
    });
  }
}

/**
 * Confetti Emitter
 * For celebrations and achievements
 */
export function emitConfetti(particleManager, position, count = 50) {
  const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
  const system = particleManager.getSystem('leaves'); // Reuse leaves system

  if (!system) return;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 2;

    system.emit({
      x: position.x + (Math.random() - 0.5) * 2,
      y: position.y + Math.random() * 2,
      z: position.z + (Math.random() - 0.5) * 2,
      vx: Math.cos(angle) * speed,
      vy: 3 + Math.random() * 2,
      vz: Math.sin(angle) * speed,
      life: 2 + Math.random() * 1,
      size: 0.06 + Math.random() * 0.04,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

/**
 * Rain Emitter
 * Weather effect for rain
 */
export function createRainEmitter(particleManager, bounds, intensity = 1.0) {
  const id = 'rain_emitter';
  const count = Math.floor(100 * intensity);

  // Create many emitters spread across the bounds
  const emitterIds = [];

  for (let i = 0; i < count; i++) {
    const emitterId = `${id}_${i}`;

    particleManager.addEmitter({
      id: emitterId,
      type: 'splash',
      rate: 0.05, // Very fast
      position: () => ({
        x: bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
        y: bounds.max.y,
        z: bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z),
      }),
      velocity: {
        x: 0,
        y: -10, // Fast fall
        z: 0,
      },
      life: 0.5,
      size: 0.02,
      color: 0x6FB8DC,
    });

    emitterIds.push(emitterId);
  }

  return {
    ids: emitterIds,
    stop: () => {
      emitterIds.forEach((id) => particleManager.removeEmitter(id));
    },
  };
}

export { GROUND_COLORS, LEAF_COLORS };
