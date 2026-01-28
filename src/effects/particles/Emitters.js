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

/**
 * Flying Birds Emitter
 * Daytime ambient birds flying around the planet in flocking patterns
 * Creates a sense of life and motion in the world
 */
export function createBirdEmitter(scene, planetRadius = 50, count = 12) {
  const birds = [];
  const birdGroup = new THREE.Group();
  scene.add(birdGroup);

  // Create bird geometry (simple V-shape)
  const createBirdMesh = () => {
    const birdShape = new THREE.Group();

    // Body
    const bodyGeo = new THREE.ConeGeometry(0.15, 0.6, 4);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x2A2A2A });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    birdShape.add(body);

    // Left wing
    const wingGeo = new THREE.PlaneGeometry(0.8, 0.25);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x3A3A3A,
      side: THREE.DoubleSide,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.35, 0, 0);
    leftWing.rotation.z = 0.3;
    birdShape.add(leftWing);
    birdShape.userData.leftWing = leftWing;

    // Right wing
    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(0.35, 0, 0);
    rightWing.rotation.z = -0.3;
    birdShape.add(rightWing);
    birdShape.userData.rightWing = rightWing;

    return birdShape;
  };

  // Create flocks (groups of 3-4 birds)
  const flockCount = Math.ceil(count / 3);

  for (let f = 0; f < flockCount; f++) {
    // Flock parameters
    const flockLat = (Math.random() - 0.5) * 60; // -30 to 30 degrees
    const flockLon = Math.random() * 360;
    const flockHeight = planetRadius + 8 + Math.random() * 12; // 8-20 units above surface
    const flockSpeed = 0.3 + Math.random() * 0.2; // Orbital speed
    const flockDirection = Math.random() > 0.5 ? 1 : -1;

    // Birds in this flock
    const birdsInFlock = 2 + Math.floor(Math.random() * 3); // 2-4 birds

    for (let i = 0; i < birdsInFlock; i++) {
      const mesh = createBirdMesh();
      birdGroup.add(mesh);

      birds.push({
        mesh,
        // Orbital parameters
        lat: flockLat + (Math.random() - 0.5) * 5, // Slight variation within flock
        lon: flockLon + (Math.random() - 0.5) * 10,
        height: flockHeight + (Math.random() - 0.5) * 2,
        speed: flockSpeed + (Math.random() - 0.5) * 0.05,
        direction: flockDirection,
        // Wing flap animation
        flapPhase: Math.random() * Math.PI * 2,
        flapSpeed: 8 + Math.random() * 4,
        // Vertical bob
        bobPhase: Math.random() * Math.PI * 2,
        bobAmount: 0.3 + Math.random() * 0.3,
      });
    }
  }

  // Return update function
  return {
    birds,
    group: birdGroup,
    update: (deltaTime, isNight) => {
      // Hide birds at night
      birdGroup.visible = !isNight;
      if (isNight) return;

      birds.forEach((bird) => {
        // Update orbital position
        bird.lon += bird.speed * bird.direction * deltaTime * 10;

        // Convert lat/lon to 3D position
        const latRad = THREE.MathUtils.degToRad(bird.lat);
        const lonRad = THREE.MathUtils.degToRad(bird.lon);

        // Vertical bob
        bird.bobPhase += deltaTime * 2;
        const bob = Math.sin(bird.bobPhase) * bird.bobAmount;

        const r = bird.height + bob;
        const x = r * Math.cos(latRad) * Math.cos(lonRad);
        const y = r * Math.sin(latRad);
        const z = r * Math.cos(latRad) * Math.sin(lonRad);

        bird.mesh.position.set(x, y, z);

        // Orient bird to face movement direction
        const forwardLon = bird.lon + bird.direction * 5;
        const forwardLonRad = THREE.MathUtils.degToRad(forwardLon);
        const fx = r * Math.cos(latRad) * Math.cos(forwardLonRad);
        const fy = r * Math.sin(latRad);
        const fz = r * Math.cos(latRad) * Math.sin(forwardLonRad);

        bird.mesh.lookAt(fx, fy, fz);

        // Wing flap animation
        bird.flapPhase += deltaTime * bird.flapSpeed;
        const flapAngle = Math.sin(bird.flapPhase) * 0.4;

        if (bird.mesh.userData.leftWing) {
          bird.mesh.userData.leftWing.rotation.z = 0.3 + flapAngle;
        }
        if (bird.mesh.userData.rightWing) {
          bird.mesh.userData.rightWing.rotation.z = -0.3 - flapAngle;
        }
      });
    },
    dispose: () => {
      birds.forEach((bird) => {
        bird.mesh.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });
      scene.remove(birdGroup);
    },
  };
}

/**
 * Dust Mote Emitter
 * Creates floating ambient dust particles around the planet
 * Gives a sense of atmosphere and scale
 */
export function createDustMoteEmitter(particleManager, planetCenter, radius, options = {}) {
  const count = options.count || 40;
  const emitters = [];

  for (let i = 0; i < count; i++) {
    // Stagger spawn times for gradual appearance
    setTimeout(() => {
      const id = `dustmote_${i}`;

      particleManager.addEmitter({
        id,
        type: 'sparkle', // Reuse sparkle system for glowing dust
        rate: 4 + Math.random() * 2, // 4-6 seconds between spawns
        position: () => {
          // Random position on sphere surface, slightly above
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const r = radius + 1 + Math.random() * 5; // 1-6 units above surface

          return {
            x: planetCenter.x + r * Math.sin(phi) * Math.cos(theta),
            y: planetCenter.y + r * Math.cos(phi),
            z: planetCenter.z + r * Math.sin(phi) * Math.sin(theta),
          };
        },
        velocity: {
          x: (Math.random() - 0.5) * 0.02,
          y: 0.02 + Math.random() * 0.02, // Slow upward drift
          z: (Math.random() - 0.5) * 0.02,
        },
        life: 5 + Math.random() * 3, // 5-8 second lifespan
        size: 0.015 + Math.random() * 0.01, // Tiny particles
        color: 0xFFFFDD, // Warm white/cream color
      });

      emitters.push(id);
    }, (i / count) * 8000); // Spread spawns over 8 seconds
  }

  return {
    ids: emitters,
    dispose: () => {
      emitters.forEach((id) => particleManager.removeEmitter(id));
    },
  };
}

export { GROUND_COLORS, LEAF_COLORS };
