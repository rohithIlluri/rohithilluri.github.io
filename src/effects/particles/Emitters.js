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
 * Flying Birds Emitter - Enhanced with Toon Shading and Boids Flocking
 * Daytime ambient birds flying around the planet with flocking behavior
 * Creates a sense of life and motion in the world
 */
export function createBirdEmitter(scene, planetRadius = 50, count = 20) {
  const birds = [];
  const birdGroup = new THREE.Group();
  scene.add(birdGroup);

  // Flocking parameters (Boids algorithm)
  const BOIDS = {
    VISUAL_RANGE: 15,         // How far birds can see each other
    SEPARATION_DIST: 3,       // Minimum distance between birds
    COHESION_FACTOR: 0.005,   // Strength of move toward center
    ALIGNMENT_FACTOR: 0.05,   // Strength of matching velocity
    SEPARATION_FACTOR: 0.08,  // Strength of avoiding crowding
    WANDER_FACTOR: 0.02,      // Random direction change strength
    MAX_SPEED: 0.8,           // Maximum bird speed
    MIN_SPEED: 0.3,           // Minimum bird speed
    TURN_FACTOR: 0.03,        // How fast birds turn back from boundaries
  };

  // Bird colors (toon-style, slightly varied)
  const BIRD_COLORS = [
    0x2A2A2A, // Dark gray (crow-like)
    0x3A3A4A, // Blue-gray
    0x4A3A3A, // Brown-gray
    0x2A3A3A, // Teal-gray
    0x3A2A3A, // Purple-gray
  ];

  // Create toon material for birds
  const createBirdToonMaterial = (color) => {
    // Simple 3-band toon shader for birds
    return new THREE.ShaderMaterial({
      uniforms: {
        baseColor: { value: new THREE.Color(color) },
        lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 baseColor;
        uniform vec3 lightDirection;
        varying vec3 vNormal;
        varying vec3 vViewPosition;

        void main() {
          // Calculate light intensity
          float intensity = dot(vNormal, lightDirection);

          // 3-band cel shading
          vec3 color;
          if (intensity > 0.6) {
            color = baseColor * 1.1;
          } else if (intensity > 0.2) {
            color = baseColor;
          } else {
            color = baseColor * 0.6;
          }

          // Rim lighting for silhouette
          vec3 viewDir = normalize(vViewPosition);
          float rim = 1.0 - abs(dot(vNormal, viewDir));
          rim = pow(rim, 3.0) * 0.3;
          color += vec3(rim);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    });
  };

  // Create bird geometry with toon materials
  const createBirdMesh = (sizeScale = 1.0) => {
    const birdShape = new THREE.Group();
    const birdColor = BIRD_COLORS[Math.floor(Math.random() * BIRD_COLORS.length)];

    // Body - streamlined
    const bodyGeo = new THREE.ConeGeometry(0.12 * sizeScale, 0.5 * sizeScale, 6);
    const bodyMat = createBirdToonMaterial(birdColor);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    birdShape.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.08 * sizeScale, 6, 6);
    const headMat = createBirdToonMaterial(birdColor);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0, 0.28 * sizeScale);
    birdShape.add(head);

    // Beak
    const beakGeo = new THREE.ConeGeometry(0.03 * sizeScale, 0.1 * sizeScale, 4);
    const beakMat = createBirdToonMaterial(0xE8A84A); // Orange beak
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.position.set(0, 0, 0.35 * sizeScale);
    beak.rotation.x = Math.PI / 2;
    birdShape.add(beak);

    // Wings - more detailed
    const wingGeo = new THREE.BufferGeometry();
    const wingVertices = new Float32Array([
      0, 0, 0,                              // Base
      -0.6 * sizeScale, 0.1, 0.1 * sizeScale,  // Tip front
      -0.5 * sizeScale, 0, -0.15 * sizeScale,  // Tip back
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
    wingGeo.computeVertexNormals();

    const wingMat = createBirdToonMaterial(birdColor * 0.9);

    // Left wing
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-0.05 * sizeScale, 0.05 * sizeScale, 0);
    birdShape.add(leftWing);
    birdShape.userData.leftWing = leftWing;

    // Right wing (mirrored)
    const rightWingGeo = new THREE.BufferGeometry();
    const rightWingVertices = new Float32Array([
      0, 0, 0,
      0.6 * sizeScale, 0.1, 0.1 * sizeScale,
      0.5 * sizeScale, 0, -0.15 * sizeScale,
    ]);
    rightWingGeo.setAttribute('position', new THREE.BufferAttribute(rightWingVertices, 3));
    rightWingGeo.computeVertexNormals();

    const rightWing = new THREE.Mesh(rightWingGeo, wingMat);
    rightWing.position.set(0.05 * sizeScale, 0.05 * sizeScale, 0);
    birdShape.add(rightWing);
    birdShape.userData.rightWing = rightWing;

    // Tail
    const tailGeo = new THREE.ConeGeometry(0.06 * sizeScale, 0.2 * sizeScale, 3);
    const tailMat = createBirdToonMaterial(birdColor);
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0, 0, -0.3 * sizeScale);
    tail.rotation.x = -Math.PI / 2;
    birdShape.add(tail);

    return birdShape;
  };

  // Create flocks with varied sizes
  const flockCount = Math.ceil(count / 4);

  for (let f = 0; f < flockCount; f++) {
    // Flock center parameters
    const flockLat = (Math.random() - 0.5) * 80; // -40 to 40 degrees
    const flockLon = Math.random() * 360;
    const flockHeight = planetRadius + 6 + Math.random() * 15; // 6-21 units above surface

    // Birds in this flock
    const birdsInFlock = 3 + Math.floor(Math.random() * 4); // 3-6 birds

    for (let i = 0; i < birdsInFlock; i++) {
      // Size variation (0.8x to 1.2x)
      const sizeScale = 0.8 + Math.random() * 0.4;
      const mesh = createBirdMesh(sizeScale);
      birdGroup.add(mesh);

      // Initial velocity
      const angle = Math.random() * Math.PI * 2;
      const speed = BOIDS.MIN_SPEED + Math.random() * (BOIDS.MAX_SPEED - BOIDS.MIN_SPEED);

      birds.push({
        mesh,
        sizeScale,
        // 3D position (will be converted to spherical for rendering)
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 10 + flockLon,  // Initial spread in lon
          flockLat + (Math.random() - 0.5) * 8,   // Initial spread in lat
          flockHeight + (Math.random() - 0.5) * 3 // Initial spread in height
        ),
        // Velocity in lat/lon/height space
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed * 0.3,
          (Math.random() - 0.5) * 0.1
        ),
        // Animation
        flapPhase: Math.random() * Math.PI * 2,
        flapSpeed: 10 + Math.random() * 5,
        // Glide timer (birds sometimes glide without flapping)
        glideTimer: 0,
        isGliding: false,
      });
    }
  }

  // Boids flocking behavior
  const applyFlocking = (bird, deltaTime) => {
    let cohesion = new THREE.Vector3();
    let alignment = new THREE.Vector3();
    let separation = new THREE.Vector3();
    let neighborCount = 0;

    birds.forEach(other => {
      if (other === bird) return;

      const dist = bird.position.distanceTo(other.position);

      if (dist < BOIDS.VISUAL_RANGE) {
        // Cohesion: steer toward center of nearby birds
        cohesion.add(other.position);

        // Alignment: match velocity of nearby birds
        alignment.add(other.velocity);

        neighborCount++;

        // Separation: avoid crowding
        if (dist < BOIDS.SEPARATION_DIST) {
          const diff = bird.position.clone().sub(other.position);
          diff.divideScalar(dist); // Weight by distance
          separation.add(diff);
        }
      }
    });

    if (neighborCount > 0) {
      // Cohesion
      cohesion.divideScalar(neighborCount);
      cohesion.sub(bird.position);
      cohesion.multiplyScalar(BOIDS.COHESION_FACTOR);
      bird.velocity.add(cohesion);

      // Alignment
      alignment.divideScalar(neighborCount);
      alignment.sub(bird.velocity);
      alignment.multiplyScalar(BOIDS.ALIGNMENT_FACTOR);
      bird.velocity.add(alignment);

      // Separation
      separation.multiplyScalar(BOIDS.SEPARATION_FACTOR);
      bird.velocity.add(separation);
    }

    // Wander: small random changes
    bird.velocity.x += (Math.random() - 0.5) * BOIDS.WANDER_FACTOR;
    bird.velocity.y += (Math.random() - 0.5) * BOIDS.WANDER_FACTOR * 0.5;
    bird.velocity.z += (Math.random() - 0.5) * BOIDS.WANDER_FACTOR * 0.3;

    // Keep birds within bounds
    // Latitude bounds (-60 to 60)
    if (bird.position.y < -50) bird.velocity.y += BOIDS.TURN_FACTOR;
    if (bird.position.y > 50) bird.velocity.y -= BOIDS.TURN_FACTOR;

    // Height bounds
    const minHeight = planetRadius + 5;
    const maxHeight = planetRadius + 25;
    if (bird.position.z < minHeight) bird.velocity.z += BOIDS.TURN_FACTOR;
    if (bird.position.z > maxHeight) bird.velocity.z -= BOIDS.TURN_FACTOR;

    // Clamp velocity
    const speed = bird.velocity.length();
    if (speed > BOIDS.MAX_SPEED) {
      bird.velocity.multiplyScalar(BOIDS.MAX_SPEED / speed);
    } else if (speed < BOIDS.MIN_SPEED) {
      bird.velocity.multiplyScalar(BOIDS.MIN_SPEED / speed);
    }

    // Update position
    bird.position.add(bird.velocity.clone().multiplyScalar(deltaTime * 10));

    // Wrap longitude
    if (bird.position.x > 180) bird.position.x -= 360;
    if (bird.position.x < -180) bird.position.x += 360;
  };

  // Return update function
  return {
    birds,
    group: birdGroup,
    update: (deltaTime, isNight) => {
      // Hide birds at night
      birdGroup.visible = !isNight;
      if (isNight) return;

      birds.forEach((bird) => {
        // Apply flocking behavior
        applyFlocking(bird, deltaTime);

        // Convert position (lon, lat, height) to 3D
        const lat = bird.position.y;
        const lon = bird.position.x;
        const height = bird.position.z;

        const latRad = THREE.MathUtils.degToRad(lat);
        const lonRad = THREE.MathUtils.degToRad(lon);

        const x = height * Math.cos(latRad) * Math.cos(lonRad);
        const y = height * Math.sin(latRad);
        const z = height * Math.cos(latRad) * Math.sin(lonRad);

        bird.mesh.position.set(x, y, z);

        // Orient bird to face movement direction
        const forwardLon = lon + bird.velocity.x * 5;
        const forwardLat = lat + bird.velocity.y * 5;
        const forwardLatRad = THREE.MathUtils.degToRad(forwardLat);
        const forwardLonRad = THREE.MathUtils.degToRad(forwardLon);

        const fx = height * Math.cos(forwardLatRad) * Math.cos(forwardLonRad);
        const fy = height * Math.sin(forwardLatRad);
        const fz = height * Math.cos(forwardLatRad) * Math.sin(forwardLonRad);

        bird.mesh.lookAt(fx, fy, fz);

        // Gliding behavior (sometimes stop flapping)
        bird.glideTimer += deltaTime;
        if (bird.glideTimer > 2 + Math.random() * 3) {
          bird.isGliding = !bird.isGliding;
          bird.glideTimer = 0;
        }

        // Wing flap animation
        if (!bird.isGliding) {
          bird.flapPhase += deltaTime * bird.flapSpeed;
          const flapAngle = Math.sin(bird.flapPhase) * 0.5;

          if (bird.mesh.userData.leftWing) {
            bird.mesh.userData.leftWing.rotation.y = -0.3 - flapAngle;
          }
          if (bird.mesh.userData.rightWing) {
            bird.mesh.userData.rightWing.rotation.y = 0.3 + flapAngle;
          }
        } else {
          // Gliding - wings slightly up
          if (bird.mesh.userData.leftWing) {
            bird.mesh.userData.leftWing.rotation.y = -0.15;
          }
          if (bird.mesh.userData.rightWing) {
            bird.mesh.userData.rightWing.rotation.y = 0.15;
          }
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
    update: () => {
      // Dust motes are managed by particleManager, no per-frame update needed
    },
    dispose: () => {
      emitters.forEach((id) => particleManager.removeEmitter(id));
    },
  };
}

export { GROUND_COLORS, LEAF_COLORS };
