/**
 * Player.js - Spherical Planet Player Controller
 * Handles player movement on a tiny planet sphere with proper orientation
 * Player always stands perpendicular to the sphere surface (local "up")
 * With enhanced toon material, outline mesh, and character model support
 *
 * Supports loading animated 3D models from Three.js examples:
 * - RobotExpressive (default)
 * - Soldier
 * - Fox
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGameStore } from './stores/gameStore.js';
import {
  createEnhancedToonMaterial,
  createOutlineMesh,
  TOON_CONSTANTS,
} from './shaders/toon.js';

// Available character models (from Three.js examples - free to use)
const CHARACTER_MODELS = {
  robot: {
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    scale: 0.5,
    yOffset: 0,
    animations: { idle: 'Idle', walk: 'Walking', run: 'Running', jump: 'Jump' },
  },
  soldier: {
    url: 'https://threejs.org/examples/models/gltf/Soldier.glb',
    scale: 1.0,
    yOffset: 0,
    animations: { idle: 'Idle', walk: 'Walk', run: 'Run' },
  },
  fox: {
    url: 'https://threejs.org/examples/models/gltf/Fox/glTF/Fox.gltf',
    scale: 0.015,
    yOffset: 0,
    animations: { idle: 'Survey', walk: 'Walk', run: 'Run' },
  },
};

// Animation states
const ANIM_STATES = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
};

// Animation blend times
const BLEND_TIMES = {
  [ANIM_STATES.IDLE]: 0.25,
  [ANIM_STATES.WALK]: 0.15,
  [ANIM_STATES.RUN]: 0.15,
};

export class Player {
  constructor(scene, inputManager, spawnPosition, planet = null, options = {}) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.planet = planet; // TinyPlanet instance (null for flat world fallback)

    // Character model options
    this.characterType = options.characterType || 'robot'; // 'robot', 'soldier', 'fox', or 'procedural'
    this.useExternalModel = this.characterType !== 'procedural';

    // Player settings
    this.walkSpeed = 5;
    this.runSpeed = 10;
    this.turnSpeed = 8;

    // Capsule collision dimensions
    this.capsuleRadius = 0.4;
    this.capsuleHeight = 1.8;

    // Position and physics
    this.position = spawnPosition.clone();
    this.velocity = new THREE.Vector3();
    this.heading = 0; // Heading angle in radians (rotation around local up)

    // For spherical movement
    this.localUp = new THREE.Vector3(0, 1, 0);
    this.localForward = new THREE.Vector3(0, 0, -1);
    this.localRight = new THREE.Vector3(1, 0, 0);

    // Legacy rotation support (for flat world)
    this.rotation = 0;

    // Collision
    this.collisionMeshes = [];
    this.raycaster = new THREE.Raycaster();
    this.groundRay = new THREE.Vector3(0, -1, 0);

    // State
    this.isGrounded = true;
    this.currentBuilding = null;

    // Visual representation
    this.mesh = null;
    this.outlineMesh = null;
    this.characterModel = null;
    this.mixer = null;
    this.animations = {};
    this.currentAnimState = ANIM_STATES.IDLE;

    // Container for player (mesh + outline)
    this.container = new THREE.Group();
    this.scene.add(this.container);

    // Light direction for enhanced toon material (synced with sun)
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();

    // Create visual representation
    this.createMesh();

    // Try to load character model
    this.loadCharacterModel();

    // Interaction
    this.interactionRange = 3;
    this.nearbyBuilding = null;

    // Listen for interactions
    this.inputManager.on('interact', () => this.onInteract());

    // Initialize orientation if on planet
    if (this.planet) {
      this.updateOrientationFromPlanet();
    }
  }

  /**
   * Set the planet for spherical movement
   * @param {TinyPlanet} planet
   */
  setPlanet(planet) {
    this.planet = planet;
    if (planet) {
      // Project current position onto planet surface
      this.position = planet.projectToSurface(this.position);
      this.updateOrientationFromPlanet();
    }
  }

  /**
   * Update local orientation vectors from planet
   */
  updateOrientationFromPlanet() {
    if (!this.planet) return;

    const axes = this.planet.getLocalAxes(this.position, this.heading);
    this.localUp = axes.up;
    this.localForward = axes.forward;
    this.localRight = axes.right;
  }

  /**
   * Create the player mesh - stylized procedural character
   */
  createMesh() {
    // Create procedural character (no external model needed)
    this.characterGroup = new THREE.Group();

    // Character colors
    const skinColor = 0xFFD1AA; // Warm skin tone
    const shirtColor = 0x4FC3F7; // Light blue shirt
    const pantsColor = 0x3D5A80; // Dark blue pants
    const hairColor = 0x5D4037; // Brown hair

    // Create materials
    const skinMaterial = createEnhancedToonMaterial({
      color: skinColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const shirtMaterial = createEnhancedToonMaterial({
      color: shirtColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const pantsMaterial = createEnhancedToonMaterial({
      color: pantsColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const hairMaterial = createEnhancedToonMaterial({
      color: hairColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    // HEAD
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.45;
    head.castShadow = true;
    this.characterGroup.add(head);

    // Head outline
    const headOutline = createOutlineMesh(head, 0.015);
    headOutline.position.copy(head.position);
    this.characterGroup.add(headOutline);

    // HAIR (half-sphere on top of head)
    const hairGeo = new THREE.SphereGeometry(0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.y = 1.5;
    hair.castShadow = true;
    this.characterGroup.add(hair);

    const hairOutline = createOutlineMesh(hair, 0.012);
    hairOutline.position.copy(hair.position);
    this.characterGroup.add(hairOutline);

    // EYES (black dots)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1A1A2E });
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.08, 1.48, 0.2);
    this.characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.08, 1.48, 0.2);
    this.characterGroup.add(rightEye);

    // EYE WHITES (slightly larger, behind black dots)
    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const eyeWhiteGeo = new THREE.SphereGeometry(0.055, 8, 8);

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.08, 1.48, 0.18);
    this.characterGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.08, 1.48, 0.18);
    this.characterGroup.add(rightEyeWhite);

    // BODY (torso)
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.5, 0.22);
    const body = new THREE.Mesh(bodyGeo, shirtMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    this.characterGroup.add(body);

    const bodyOutline = createOutlineMesh(body, 0.015);
    bodyOutline.position.copy(body.position);
    this.characterGroup.add(bodyOutline);

    // ARMS
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);

    // Left arm
    this.leftArm = new THREE.Mesh(armGeo, skinMaterial);
    this.leftArm.position.set(-0.28, 1.0, 0);
    this.leftArm.rotation.z = Math.PI / 12;
    this.leftArm.castShadow = true;
    this.characterGroup.add(this.leftArm);

    const leftArmOutline = createOutlineMesh(this.leftArm, 0.012);
    leftArmOutline.position.copy(this.leftArm.position);
    leftArmOutline.rotation.copy(this.leftArm.rotation);
    this.characterGroup.add(leftArmOutline);

    // Right arm
    this.rightArm = new THREE.Mesh(armGeo, skinMaterial);
    this.rightArm.position.set(0.28, 1.0, 0);
    this.rightArm.rotation.z = -Math.PI / 12;
    this.rightArm.castShadow = true;
    this.characterGroup.add(this.rightArm);

    const rightArmOutline = createOutlineMesh(this.rightArm, 0.012);
    rightArmOutline.position.copy(this.rightArm.position);
    rightArmOutline.rotation.copy(this.rightArm.rotation);
    this.characterGroup.add(rightArmOutline);

    // LEGS
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);

    // Left leg
    this.leftLeg = new THREE.Mesh(legGeo, pantsMaterial);
    this.leftLeg.position.set(-0.1, 0.5, 0);
    this.leftLeg.castShadow = true;
    this.characterGroup.add(this.leftLeg);

    const leftLegOutline = createOutlineMesh(this.leftLeg, 0.012);
    leftLegOutline.position.copy(this.leftLeg.position);
    this.characterGroup.add(leftLegOutline);

    // Right leg
    this.rightLeg = new THREE.Mesh(legGeo, pantsMaterial);
    this.rightLeg.position.set(0.1, 0.5, 0);
    this.rightLeg.castShadow = true;
    this.characterGroup.add(this.rightLeg);

    const rightLegOutline = createOutlineMesh(this.rightLeg, 0.012);
    rightLegOutline.position.copy(this.rightLeg.position);
    this.characterGroup.add(rightLegOutline);

    // FEET (small boxes)
    const footGeo = new THREE.BoxGeometry(0.1, 0.08, 0.16);
    const footMaterial = createEnhancedToonMaterial({
      color: 0x3D3D3D, // Dark shoes
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const leftFoot = new THREE.Mesh(footGeo, footMaterial);
    leftFoot.position.set(-0.1, 0.2, 0.02);
    leftFoot.castShadow = true;
    this.characterGroup.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, footMaterial);
    rightFoot.position.set(0.1, 0.2, 0.02);
    rightFoot.castShadow = true;
    this.characterGroup.add(rightFoot);

    // SHADOW BLOB (circle under character)
    const shadowGeo = new THREE.CircleGeometry(0.3, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.02;
    this.characterGroup.add(this.shadowBlob);

    // Animation state
    this.idleTime = 0;
    this.walkCycle = 0;

    // Store references for legacy compatibility
    this.mesh = body; // Main mesh reference
    this.outlineMesh = bodyOutline;

    // Add character group to container
    this.container.add(this.characterGroup);

    // Position the container
    this.container.position.copy(this.position);
  }

  /**
   * Attempt to load a character model from Three.js examples
   * Falls back to procedural character if loading fails
   */
  async loadCharacterModel() {
    // Skip if explicitly using procedural
    if (!this.useExternalModel) {
      console.log('[Player] Using procedural character');
      return;
    }

    const modelConfig = CHARACTER_MODELS[this.characterType];
    if (!modelConfig) {
      console.warn(`[Player] Unknown character type: ${this.characterType}, using procedural`);
      return;
    }

    console.log(`[Player] Loading ${this.characterType} model from Three.js examples...`);

    const loader = new GLTFLoader();

    try {
      const gltf = await loader.loadAsync(modelConfig.url);
      this.characterModel = gltf.scene;

      // Apply scale and offset
      this.characterModel.scale.setScalar(modelConfig.scale);
      this.characterModel.position.y = modelConfig.yOffset;

      // Apply enhanced toon material to all meshes
      this.characterModel.traverse((child) => {
        if (child.isMesh) {
          // Get the original color if available
          const originalColor = child.material.color
            ? child.material.color.getHex()
            : 0x4A90D9;

          // Replace with enhanced toon material
          child.material = createEnhancedToonMaterial({
            color: originalColor,
            isCharacter: true,
            lightDirection: this.lightDirection,
          });

          child.castShadow = true;
          child.receiveShadow = false;

          // Create and add outline for this mesh
          const outline = createOutlineMesh(child, 0.015);
          if (outline) {
            child.parent.add(outline);
          }
        }
      });

      // Setup animation mixer if animations exist
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.characterModel);

        // Map animations based on config
        gltf.animations.forEach((clip) => {
          const clipName = clip.name;

          if (clipName === modelConfig.animations.idle) {
            this.animations[ANIM_STATES.IDLE] = this.mixer.clipAction(clip);
          } else if (clipName === modelConfig.animations.walk) {
            this.animations[ANIM_STATES.WALK] = this.mixer.clipAction(clip);
          } else if (clipName === modelConfig.animations.run) {
            this.animations[ANIM_STATES.RUN] = this.mixer.clipAction(clip);
          }

          // Store all animations for debugging
          console.log(`[Player] Found animation: ${clipName}`);
        });

        // Start with idle animation
        if (this.animations[ANIM_STATES.IDLE]) {
          this.animations[ANIM_STATES.IDLE].play();
        }
      }

      // Hide procedural character and show loaded model
      if (this.characterGroup) {
        this.characterGroup.visible = false;
      }
      this.container.add(this.characterModel);

      console.log(`[Player] ${this.characterType} model loaded successfully!`);
    } catch (error) {
      console.warn('[Player] Failed to load character model:', error.message);
      console.log('[Player] Falling back to procedural character');
      // Keep using the procedural character (already created)
    }
  }

  /**
   * Set the light direction (synced with sun position)
   * @param {THREE.Vector3} direction
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();

    // Update material uniform if using enhanced toon material
    if (this.mesh && this.mesh.material.uniforms) {
      this.mesh.material.uniforms.lightDirection.value = this.lightDirection;
    }

    // Update character model materials
    if (this.characterModel) {
      this.characterModel.traverse((child) => {
        if (child.isMesh && child.material.uniforms) {
          child.material.uniforms.lightDirection.value = this.lightDirection;
        }
      });
    }
  }

  /**
   * Transition to a new animation state
   * @param {string} newState
   */
  setAnimationState(newState) {
    if (newState === this.currentAnimState) return;
    if (!this.mixer || !this.animations[newState]) return;

    const currentAnim = this.animations[this.currentAnimState];
    const newAnim = this.animations[newState];
    const blendTime = BLEND_TIMES[newState] || 0.2;

    if (currentAnim) {
      currentAnim.fadeOut(blendTime);
    }

    newAnim.reset().fadeIn(blendTime).play();
    this.currentAnimState = newState;
  }

  setCollisionMeshes(meshes) {
    this.collisionMeshes = meshes;
  }

  update(deltaTime) {
    // Update animation mixer (for loaded models)
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Get movement input
    const movement = this.inputManager.getMovementDirection();
    const isRunning = this.inputManager.isRunning();
    const isMoving = this.inputManager.isMoving();

    // Calculate speed
    const speed = isRunning ? this.runSpeed : this.walkSpeed;

    // Update animation state based on movement
    if (isMoving) {
      this.setAnimationState(isRunning ? ANIM_STATES.RUN : ANIM_STATES.WALK);
    } else {
      this.setAnimationState(ANIM_STATES.IDLE);
    }

    // Update procedural character animation
    this.updateProceduralAnimation(deltaTime, isMoving, isRunning);

    // Use spherical movement if planet exists, otherwise flat movement
    if (this.planet) {
      this.updateSpherical(deltaTime, movement, speed, isMoving);
    } else {
      this.updateFlat(deltaTime, movement, speed, isMoving);
    }

    // Update game store with player position
    useGameStore.getState().setPlayerPosition(this.position.clone());

    // Check for nearby buildings
    this.checkNearbyBuildings();
  }

  /**
   * Update procedural character animation (no external animation files needed)
   */
  updateProceduralAnimation(deltaTime, isMoving, isRunning) {
    if (!this.characterGroup) return;

    if (isMoving) {
      // Walk/run cycle
      const cycleSpeed = isRunning ? 12 : 8;
      this.walkCycle += deltaTime * cycleSpeed;

      // Leg swing
      const legSwing = Math.sin(this.walkCycle) * 0.4;
      if (this.leftLeg) {
        this.leftLeg.rotation.x = legSwing;
        this.leftLeg.position.z = Math.sin(this.walkCycle) * 0.05;
      }
      if (this.rightLeg) {
        this.rightLeg.rotation.x = -legSwing;
        this.rightLeg.position.z = -Math.sin(this.walkCycle) * 0.05;
      }

      // Arm swing (opposite to legs)
      const armSwing = Math.sin(this.walkCycle) * 0.3;
      if (this.leftArm) {
        this.leftArm.rotation.x = -armSwing;
      }
      if (this.rightArm) {
        this.rightArm.rotation.x = armSwing;
      }

      // Body bob
      const bobAmount = isRunning ? 0.03 : 0.015;
      this.characterGroup.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * bobAmount;

      // Reset idle time
      this.idleTime = 0;
    } else {
      // Idle animation (gentle breathing)
      this.idleTime += deltaTime;
      const breathe = Math.sin(this.idleTime * 2) * 0.01;

      // Slight body movement
      this.characterGroup.position.y = breathe;

      // Reset limbs to rest position
      if (this.leftLeg) {
        this.leftLeg.rotation.x *= 0.9;
        this.leftLeg.position.z *= 0.9;
      }
      if (this.rightLeg) {
        this.rightLeg.rotation.x *= 0.9;
        this.rightLeg.position.z *= 0.9;
      }
      if (this.leftArm) {
        this.leftArm.rotation.x *= 0.9;
      }
      if (this.rightArm) {
        this.rightArm.rotation.x *= 0.9;
      }

      // Gradually reset walk cycle
      this.walkCycle *= 0.95;
    }
  }

  /**
   * Update movement on spherical planet
   */
  updateSpherical(deltaTime, movement, speed, isMoving) {
    if (isMoving) {
      // Update orientation from planet
      this.updateOrientationFromPlanet();

      // Calculate target heading based on movement direction
      const targetHeading = Math.atan2(movement.x, movement.z);

      // Smoothly rotate towards target heading
      let headingDiff = targetHeading - this.heading;
      while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
      while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
      this.heading += headingDiff * this.turnSpeed * deltaTime;

      // Update local axes with new heading
      this.updateOrientationFromPlanet();

      // Calculate movement direction in world space
      // Forward is into the screen (negative Z in input), so we invert
      const moveDir = new THREE.Vector3()
        .addScaledVector(this.localForward, movement.z)
        .addScaledVector(this.localRight, movement.x)
        .normalize();

      // Move on sphere surface
      const distance = speed * deltaTime;
      const newPosition = this.planet.moveOnSurface(this.position, moveDir, distance);

      // Check collision
      if (this.canMoveTo(newPosition)) {
        this.position.copy(newPosition);
      }
    }

    // Project position to surface to ensure we stay on the sphere
    this.position = this.planet.projectToSurface(this.position);

    // Update container position (at height above surface)
    this.container.position.copy(
      this.planet.projectToSurfaceWithHeight(this.position, this.capsuleHeight / 2)
    );

    // Update container orientation to match planet surface
    const orientation = this.planet.getSurfaceOrientation(this.position, this.heading);
    this.container.quaternion.copy(orientation);

    // Keep legacy rotation in sync
    this.rotation = this.heading;
  }

  /**
   * Update movement on flat surface (legacy)
   */
  updateFlat(deltaTime, movement, speed, isMoving) {
    if (isMoving) {
      // Calculate target rotation based on movement direction
      const targetRotation = Math.atan2(movement.x, movement.z);

      // Smoothly rotate towards target
      let rotationDiff = targetRotation - this.rotation;

      // Normalize rotation difference to [-PI, PI]
      while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
      while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;

      this.rotation += rotationDiff * this.turnSpeed * deltaTime;

      // Calculate forward movement in world space
      const forward = new THREE.Vector3(
        Math.sin(this.rotation),
        0,
        Math.cos(this.rotation)
      );

      // Apply movement
      this.velocity.x = forward.x * speed;
      this.velocity.z = forward.z * speed;
    } else {
      // Decelerate
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }

    // Apply velocity
    const newPosition = this.position.clone();
    newPosition.x += this.velocity.x * deltaTime;
    newPosition.z += this.velocity.z * deltaTime;

    // Check collision
    if (this.canMoveTo(newPosition)) {
      this.position.copy(newPosition);
    } else {
      // Try sliding along obstacles
      const slideX = this.position.clone();
      slideX.x = newPosition.x;
      if (this.canMoveTo(slideX)) {
        this.position.x = slideX.x;
      }

      const slideZ = this.position.clone();
      slideZ.z = newPosition.z;
      if (this.canMoveTo(slideZ)) {
        this.position.z = slideZ.z;
      }

      // Stop velocity on collision
      this.velocity.set(0, 0, 0);
    }

    // Update container position and rotation
    this.container.position.copy(this.position);
    this.container.position.y += this.capsuleHeight / 2;
    this.container.rotation.y = this.rotation;

    // Keep heading in sync
    this.heading = this.rotation;
  }

  canMoveTo(position) {
    // For spherical movement on planet
    if (this.planet) {
      return this.canMoveToSpherical(position);
    }

    // Flat world boundary check
    const boundary = 50;
    if (Math.abs(position.x) > boundary || Math.abs(position.z) > boundary) {
      return false;
    }

    // Check collision with meshes using raycasting
    return this.checkCollisionWithMeshes(position);
  }

  /**
   * Check if can move to position on spherical planet
   */
  canMoveToSpherical(position) {
    // On a sphere, there's no boundary - you can walk all the way around

    // Check collision with buildings/props on the planet
    if (this.collisionMeshes.length === 0) {
      return true;
    }

    // Get the "up" direction at the target position
    const up = this.planet.getUpVector(position);

    // Create origin point at player height above surface
    const origin = this.planet.projectToSurfaceWithHeight(
      position,
      this.capsuleHeight / 2
    );

    // Cast rays in multiple directions to check for obstacles
    const directions = [
      this.localForward.clone(),
      this.localRight.clone(),
      this.localForward.clone().negate(),
      this.localRight.clone().negate(),
    ];

    for (const dir of directions) {
      this.raycaster.set(origin, dir);
      this.raycaster.far = this.capsuleRadius + 0.1;

      const intersects = this.raycaster.intersectObjects(this.collisionMeshes, true);
      if (intersects.length > 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check collision with meshes (shared between flat and spherical)
   */
  checkCollisionWithMeshes(position) {
    if (this.collisionMeshes.length === 0) {
      return true;
    }

    const origin = new THREE.Vector3(
      position.x,
      position.y + this.capsuleHeight / 2,
      position.z
    );

    // Check in movement direction
    const direction = new THREE.Vector3()
      .subVectors(position, this.position)
      .normalize();

    if (direction.length() > 0) {
      this.raycaster.set(origin, direction);
      this.raycaster.far = this.capsuleRadius + 0.1;

      const intersects = this.raycaster.intersectObjects(
        this.collisionMeshes,
        true
      );

      if (intersects.length > 0) {
        return false;
      }
    }

    return true;
  }

  checkNearbyBuildings() {
    const store = useGameStore.getState();
    const buildings = store.buildings;

    let nearestBuilding = null;
    let nearestDistance = this.interactionRange;

    buildings.forEach((building) => {
      const distance = this.position.distanceTo(building.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBuilding = building;
      }
    });

    if (nearestBuilding !== this.nearbyBuilding) {
      this.nearbyBuilding = nearestBuilding;

      // Update UI prompt
      const promptEl = document.getElementById('interaction-prompt');
      const promptText = document.getElementById('prompt-text');

      if (nearestBuilding && promptEl && promptText) {
        promptEl.classList.remove('hidden');
        promptText.textContent = `Enter ${nearestBuilding.name}`;
      } else if (promptEl) {
        promptEl.classList.add('hidden');
      }
    }
  }

  onInteract() {
    if (this.nearbyBuilding) {
      // Open building modal
      const store = useGameStore.getState();
      store.setCurrentBuilding(this.nearbyBuilding);
      store.openModal();

      // Update UI
      this.showBuildingModal(this.nearbyBuilding);
    }
  }

  showBuildingModal(building) {
    const modal = document.getElementById('building-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');

    if (modal && title && body) {
      modal.classList.remove('hidden');
      title.textContent = building.name;
      body.innerHTML = building.content || '<p>Loading content...</p>';

      // Close button handler
      const closeModal = () => {
        modal.classList.add('hidden');
        useGameStore.getState().closeModal();
        closeBtn.removeEventListener('click', closeModal);
      };

      closeBtn.addEventListener('click', closeModal);

      // Also close on escape
      const escapeHandler = (e) => {
        if (e.code === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', escapeHandler);
        }
      };
      document.addEventListener('keydown', escapeHandler);
    }
  }

  getPosition() {
    return this.position.clone();
  }

  getRotation() {
    return this.rotation;
  }

  /**
   * Get the player container (for camera targeting)
   */
  getContainer() {
    return this.container;
  }

  dispose() {
    // Dispose mesh and material
    if (this.mesh) {
      this.mesh.geometry.dispose();
      if (this.mesh.material.dispose) {
        this.mesh.material.dispose();
      }
    }

    // Dispose outline mesh
    if (this.outlineMesh) {
      this.outlineMesh.geometry.dispose();
      this.outlineMesh.material.dispose();
    }

    // Dispose character model
    if (this.characterModel) {
      this.characterModel.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) {
            child.material.dispose();
          }
        }
      });
    }

    // Remove container from scene
    this.scene.remove(this.container);
  }
}
