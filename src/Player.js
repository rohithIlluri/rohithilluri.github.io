/**
 * Player.js - Spherical Planet Player Controller
 * Handles player movement on a tiny planet sphere with proper orientation
 * Player always stands perpendicular to the sphere surface (local "up")
 * With enhanced toon material, outline mesh, and character model support
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useGameStore } from './stores/gameStore.js';
import {
  createEnhancedToonMaterial,
  createOutlineMesh,
  TOON_CONSTANTS,
} from './shaders/toon.js';
import { getAudioManager } from './audio/AudioManager.js';
import { MESSENGER_PALETTE, CHARACTER_COLORS } from './constants/colors.js';

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
  constructor(scene, inputManager, spawnPosition, planet = null) {
    this.scene = scene;
    this.inputManager = inputManager;
    this.planet = planet; // TinyPlanet instance (null for flat world fallback)

    // Player settings (tuned for messenger.abeto.co floaty feel)
    this.walkSpeed = 4;
    this.runSpeed = 8;
    this.turnSpeed = 3.5; // Reduced from 8 for gradual turning
    this.currentSpeed = 0; // For velocity smoothing
    this.speedAcceleration = 8; // How fast speed changes

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
   * Create the player mesh - Messenger-style anime proportioned character
   * Based on messenger.abeto.co analysis
   *
   * PROPORTIONS (6 heads tall, 1.8 units total):
   * - Head: 0.3 units
   * - Neck: 0.05 units
   * - Torso: 0.55 units (upper + lower)
   * - Legs: 0.9 units (thigh + shin + foot)
   */
  createMesh() {
    // Create procedural character (no external model needed)
    this.characterGroup = new THREE.Group();

    // Messenger-style character colors from the palette (matching messenger.abeto.co)
    const skinColor = CHARACTER_COLORS.skin;        // Warm peach skin tone
    const shirtColor = CHARACTER_COLORS.shirt;      // Black/dark shirt
    const collarColor = CHARACTER_COLORS.shirtCollar; // Cream collar accent
    const skirtColor = CHARACTER_COLORS.skirt;      // Red/maroon skirt
    const hairColor = CHARACTER_COLORS.hair;        // Black hair
    const sockColor = CHARACTER_COLORS.socks;       // White socks
    const shoeColor = CHARACTER_COLORS.shoes;       // Black shoes
    const bagColor = CHARACTER_COLORS.bag;          // Dark messenger bag
    const strapColor = CHARACTER_COLORS.strap;      // Dark bag strap

    // Create materials with messenger blue-gray shadows
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

    const collarMaterial = createEnhancedToonMaterial({
      color: collarColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const skirtMaterial = createEnhancedToonMaterial({
      color: skirtColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const hairMaterial = createEnhancedToonMaterial({
      color: hairColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const bagMaterial = createEnhancedToonMaterial({
      color: bagColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const strapMaterial = createEnhancedToonMaterial({
      color: strapColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const sockMaterial = createEnhancedToonMaterial({
      color: sockColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const shoeMaterial = createEnhancedToonMaterial({
      color: shoeColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    // =====================================================
    // HEAD (0.3 units height, positioned at top)
    // =====================================================
    // Rounded head, slightly wider at cheeks
    const headGeo = new THREE.SphereGeometry(0.125, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.65; // Near top of 1.8 unit height
    head.scale.set(1, 1.2, 1.0); // Taller head shape
    head.castShadow = true;
    this.characterGroup.add(head);

    const headOutline = createOutlineMesh(head, 0.015);
    headOutline.position.copy(head.position);
    headOutline.scale.copy(head.scale);
    this.characterGroup.add(headOutline);

    // =====================================================
    // HAIR - Messy anime style
    // =====================================================
    // Main hair volume
    const hairGeo = new THREE.SphereGeometry(0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.y = 1.72;
    hair.scale.set(1.05, 1.0, 1.05);
    hair.castShadow = true;
    this.characterGroup.add(hair);

    // Hair bangs (messy front fringe)
    const bangsGeo = new THREE.BoxGeometry(0.22, 0.06, 0.08);
    const bangs = new THREE.Mesh(bangsGeo, hairMaterial);
    bangs.position.set(0, 1.72, 0.1);
    bangs.rotation.x = -0.2;
    this.characterGroup.add(bangs);

    // Side strands (messy look)
    const strandGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const leftStrand = new THREE.Mesh(strandGeo, hairMaterial);
    leftStrand.position.set(-0.12, 1.58, 0.06);
    leftStrand.scale.set(1, 1.5, 0.8);
    this.characterGroup.add(leftStrand);

    const rightStrand = new THREE.Mesh(strandGeo, hairMaterial);
    rightStrand.position.set(0.12, 1.58, 0.06);
    rightStrand.scale.set(1, 1.5, 0.8);
    this.characterGroup.add(rightStrand);

    // Back of hair
    const backHairGeo = new THREE.SphereGeometry(0.13, 12, 12, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5);
    const backHair = new THREE.Mesh(backHairGeo, hairMaterial);
    backHair.position.set(0, 1.58, -0.06);
    backHair.rotation.x = Math.PI;
    this.characterGroup.add(backHair);

    const hairOutline = createOutlineMesh(hair, 0.012);
    hairOutline.position.copy(hair.position);
    hairOutline.scale.copy(hair.scale);
    this.characterGroup.add(hairOutline);

    // =====================================================
    // FACE - Simple dots (messenger.abeto.co style)
    // =====================================================
    // Eyes - simple black dots (CRITICAL for authentic look)
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: MESSENGER_PALETTE.OUTLINE_PRIMARY });
    const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.04, 1.64, 0.11);
    this.characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.04, 1.64, 0.11);
    this.characterGroup.add(rightEye);

    // Eye highlights (tiny white dots - anime style)
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const highlightGeo = new THREE.SphereGeometry(0.005, 6, 6);

    const leftHighlight = new THREE.Mesh(highlightGeo, highlightMaterial);
    leftHighlight.position.set(-0.035, 1.65, 0.125);
    this.characterGroup.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(highlightGeo, highlightMaterial);
    rightHighlight.position.set(0.045, 1.65, 0.125);
    this.characterGroup.add(rightHighlight);

    // Eyebrows (thin lines)
    const browMaterial = new THREE.MeshBasicMaterial({ color: hairColor });
    const browGeo = new THREE.BoxGeometry(0.03, 0.004, 0.004);

    const leftBrow = new THREE.Mesh(browGeo, browMaterial);
    leftBrow.position.set(-0.04, 1.68, 0.11);
    leftBrow.rotation.z = 0.1;
    this.characterGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMaterial);
    rightBrow.position.set(0.04, 1.68, 0.11);
    rightBrow.rotation.z = -0.1;
    this.characterGroup.add(rightBrow);

    // =====================================================
    // NECK (0.05 units)
    // =====================================================
    const neckGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.05, 8);
    const neck = new THREE.Mesh(neckGeo, skinMaterial);
    neck.position.y = 1.475;
    neck.castShadow = true;
    this.characterGroup.add(neck);

    // =====================================================
    // TORSO - Upper (0.35 units) + Skirt (0.25 units)
    // =====================================================
    // Upper torso (black shirt)
    const upperTorsoGeo = new THREE.BoxGeometry(0.28, 0.35, 0.14);
    const upperTorso = new THREE.Mesh(upperTorsoGeo, shirtMaterial);
    upperTorso.position.y = 1.275;
    upperTorso.castShadow = true;
    this.characterGroup.add(upperTorso);

    // Shirt collar (cream/white accent)
    const collarGeo = new THREE.BoxGeometry(0.18, 0.05, 0.15);
    const collar = new THREE.Mesh(collarGeo, collarMaterial);
    collar.position.set(0, 1.43, 0.01);
    this.characterGroup.add(collar);

    const torsoOutline = createOutlineMesh(upperTorso, 0.015);
    torsoOutline.position.copy(upperTorso.position);
    this.characterGroup.add(torsoOutline);

    // RED SKIRT (signature messenger.abeto.co look)
    // A-line shape using a tapered cylinder
    const skirtGeo = new THREE.CylinderGeometry(0.08, 0.18, 0.25, 8);
    const skirt = new THREE.Mesh(skirtGeo, skirtMaterial);
    skirt.position.y = 0.98;
    skirt.castShadow = true;
    this.characterGroup.add(skirt);

    const skirtOutline = createOutlineMesh(skirt, 0.012);
    skirtOutline.position.copy(skirt.position);
    this.characterGroup.add(skirtOutline);

    // =====================================================
    // MESSENGER BAG (iconic yellow bag)
    // =====================================================
    // Strap (orange, diagonal across body)
    const strapGeo = new THREE.BoxGeometry(0.03, 0.5, 0.015);
    const strap = new THREE.Mesh(strapGeo, strapMaterial);
    strap.position.set(0.04, 1.25, 0.04);
    strap.rotation.z = Math.PI / 5;
    strap.rotation.x = 0.1;
    this.characterGroup.add(strap);

    // Bag body (on right hip)
    const bagBodyGeo = new THREE.BoxGeometry(0.15, 0.12, 0.05);
    const bagBody = new THREE.Mesh(bagBodyGeo, bagMaterial);
    bagBody.position.set(0.16, 0.95, 0.08);
    bagBody.rotation.y = -0.15;
    bagBody.castShadow = true;
    this.characterGroup.add(bagBody);

    const bagOutline = createOutlineMesh(bagBody, 0.01);
    bagOutline.position.copy(bagBody.position);
    bagOutline.rotation.copy(bagBody.rotation);
    this.characterGroup.add(bagOutline);

    // Bag flap
    const flapGeo = new THREE.BoxGeometry(0.15, 0.04, 0.055);
    const flap = new THREE.Mesh(flapGeo, bagMaterial);
    flap.position.set(0.16, 1.0, 0.1);
    flap.rotation.y = -0.15;
    flap.rotation.x = 0.05;
    this.characterGroup.add(flap);

    // =====================================================
    // ARMS (skin colored, hang naturally)
    // =====================================================
    // Upper arm
    const upperArmGeo = new THREE.CylinderGeometry(0.035, 0.03, 0.2, 8);

    this.leftUpperArm = new THREE.Mesh(upperArmGeo, skinMaterial);
    this.leftUpperArm.position.set(-0.17, 1.3, 0);
    this.leftUpperArm.rotation.z = 0.15;
    this.leftUpperArm.castShadow = true;
    this.characterGroup.add(this.leftUpperArm);

    this.rightUpperArm = new THREE.Mesh(upperArmGeo, skinMaterial);
    this.rightUpperArm.position.set(0.17, 1.3, 0);
    this.rightUpperArm.rotation.z = -0.15;
    this.rightUpperArm.castShadow = true;
    this.characterGroup.add(this.rightUpperArm);

    // Forearm
    const forearmGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.18, 8);

    this.leftForearm = new THREE.Mesh(forearmGeo, skinMaterial);
    this.leftForearm.position.set(-0.2, 1.12, 0);
    this.leftForearm.rotation.z = 0.1;
    this.leftForearm.castShadow = true;
    this.characterGroup.add(this.leftForearm);

    this.rightForearm = new THREE.Mesh(forearmGeo, skinMaterial);
    this.rightForearm.position.set(0.2, 1.12, 0);
    this.rightForearm.rotation.z = -0.1;
    this.rightForearm.castShadow = true;
    this.characterGroup.add(this.rightForearm);

    // Hands (simplified box)
    const handGeo = new THREE.BoxGeometry(0.05, 0.06, 0.025);

    const leftHand = new THREE.Mesh(handGeo, skinMaterial);
    leftHand.position.set(-0.21, 1.0, 0);
    this.characterGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMaterial);
    rightHand.position.set(0.21, 1.0, 0);
    this.characterGroup.add(rightHand);

    // Store arm references for animation
    this.leftArm = this.leftUpperArm;
    this.rightArm = this.rightUpperArm;

    // =====================================================
    // LEGS (0.9 units total: thigh 0.35 + shin 0.35 + foot 0.2)
    // =====================================================
    // Thigh (skin - visible below skirt)
    const thighGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.3, 8);

    this.leftThigh = new THREE.Mesh(thighGeo, skinMaterial);
    this.leftThigh.position.set(-0.07, 0.75, 0);
    this.leftThigh.castShadow = true;
    this.characterGroup.add(this.leftThigh);

    this.rightThigh = new THREE.Mesh(thighGeo, skinMaterial);
    this.rightThigh.position.set(0.07, 0.75, 0);
    this.rightThigh.castShadow = true;
    this.characterGroup.add(this.rightThigh);

    // Lower leg (skin)
    const shinGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.35, 8);

    this.leftShin = new THREE.Mesh(shinGeo, skinMaterial);
    this.leftShin.position.set(-0.07, 0.42, 0);
    this.leftShin.castShadow = true;
    this.characterGroup.add(this.leftShin);

    this.rightShin = new THREE.Mesh(shinGeo, skinMaterial);
    this.rightShin.position.set(0.07, 0.42, 0);
    this.rightShin.castShadow = true;
    this.characterGroup.add(this.rightShin);

    // Store leg references for animation
    this.leftLeg = this.leftThigh;
    this.rightLeg = this.rightThigh;

    // Ankle socks (black)
    const sockGeo = new THREE.CylinderGeometry(0.042, 0.045, 0.04, 8);

    const leftSock = new THREE.Mesh(sockGeo, sockMaterial);
    leftSock.position.set(-0.07, 0.23, 0);
    this.characterGroup.add(leftSock);

    const rightSock = new THREE.Mesh(sockGeo, sockMaterial);
    rightSock.position.set(0.07, 0.23, 0);
    this.characterGroup.add(rightSock);

    // =====================================================
    // FEET/SHOES (yellow chunky sneakers)
    // =====================================================
    const footGeo = new THREE.BoxGeometry(0.08, 0.06, 0.14);

    const leftFoot = new THREE.Mesh(footGeo, shoeMaterial);
    leftFoot.position.set(-0.07, 0.17, 0.02);
    leftFoot.castShadow = true;
    this.characterGroup.add(leftFoot);

    const leftFootOutline = createOutlineMesh(leftFoot, 0.008);
    leftFootOutline.position.copy(leftFoot.position);
    this.characterGroup.add(leftFootOutline);

    const rightFoot = new THREE.Mesh(footGeo, shoeMaterial);
    rightFoot.position.set(0.07, 0.17, 0.02);
    rightFoot.castShadow = true;
    this.characterGroup.add(rightFoot);

    const rightFootOutline = createOutlineMesh(rightFoot, 0.008);
    rightFootOutline.position.copy(rightFoot.position);
    this.characterGroup.add(rightFootOutline);

    // Shoe details (black accents)
    const shoeAccentMaterial = createEnhancedToonMaterial({
      color: MESSENGER_PALETTE.OUTLINE_PRIMARY,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const accentGeo = new THREE.BoxGeometry(0.082, 0.015, 0.142);
    const leftAccent = new THREE.Mesh(accentGeo, shoeAccentMaterial);
    leftAccent.position.set(-0.07, 0.13, 0.02);
    this.characterGroup.add(leftAccent);

    const rightAccent = new THREE.Mesh(accentGeo, shoeAccentMaterial);
    rightAccent.position.set(0.07, 0.13, 0.02);
    this.characterGroup.add(rightAccent);

    // =====================================================
    // SHADOW BLOB (soft blue-gray, not black)
    // =====================================================
    const shadowGeo = new THREE.CircleGeometry(0.22, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: MESSENGER_PALETTE.SHADOW_TINT, // Blue-gray shadow
      transparent: true,
      opacity: 0.25,
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.01;
    this.characterGroup.add(this.shadowBlob);

    // Animation state
    this.idleTime = 0;
    this.walkCycle = 0;

    // Store references for legacy compatibility
    this.mesh = upperTorso; // Main mesh reference
    this.outlineMesh = torsoOutline;

    // Add character group to container
    // Offset down so feet are at origin
    this.characterGroup.position.y = -0.14;
    this.container.add(this.characterGroup);

    // Position the container
    this.container.position.copy(this.position);
  }

  /**
   * Placeholder for loading external character models (uses procedural character by default)
   * Can be extended in the future to load custom GLB models
   */
  async loadCharacterModel() {
    console.log('Using procedural character (no external model needed)');
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

    // Calculate target speed with smooth acceleration/deceleration
    const targetSpeed = isMoving ? (isRunning ? this.runSpeed : this.walkSpeed) : 0;
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, this.speedAcceleration * deltaTime);
    const speed = this.currentSpeed;

    // Update animation state based on movement
    if (isMoving) {
      this.setAnimationState(isRunning ? ANIM_STATES.RUN : ANIM_STATES.WALK);

      // Play footstep sounds
      const audioManager = getAudioManager();
      if (audioManager && audioManager.initialized) {
        audioManager.playFootstep(isRunning, 'grass');
      }
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
   * Natural human movement with proper arm/leg swing
   */
  updateProceduralAnimation(deltaTime, isMoving, isRunning) {
    if (!this.characterGroup) return;

    // Base offset for character group (keep feet at ground)
    const baseY = -0.14;

    if (isMoving) {
      // Walk/run cycle timing
      const cycleSpeed = isRunning ? 14 : 9;
      this.walkCycle += deltaTime * cycleSpeed;

      // Leg swing amplitude (larger for running)
      const legSwingAmp = isRunning ? 0.5 : 0.35;
      const legSwing = Math.sin(this.walkCycle) * legSwingAmp;

      // Apply to thighs (main leg movement)
      if (this.leftThigh) {
        this.leftThigh.rotation.x = legSwing;
      }
      if (this.rightThigh) {
        this.rightThigh.rotation.x = -legSwing;
      }

      // Shins follow with slight delay
      if (this.leftShin) {
        this.leftShin.rotation.x = Math.sin(this.walkCycle - 0.3) * legSwingAmp * 0.5;
      }
      if (this.rightShin) {
        this.rightShin.rotation.x = -Math.sin(this.walkCycle - 0.3) * legSwingAmp * 0.5;
      }

      // Arm swing (opposite to legs)
      const armSwingAmp = isRunning ? 0.4 : 0.25;
      const armSwing = Math.sin(this.walkCycle) * armSwingAmp;

      if (this.leftUpperArm) {
        this.leftUpperArm.rotation.x = -armSwing;
      }
      if (this.rightUpperArm) {
        this.rightUpperArm.rotation.x = armSwing;
      }

      if (this.leftForearm) {
        this.leftForearm.rotation.x = -Math.sin(this.walkCycle + 0.2) * armSwingAmp * 0.6;
      }
      if (this.rightForearm) {
        this.rightForearm.rotation.x = Math.sin(this.walkCycle + 0.2) * armSwingAmp * 0.6;
      }

      // Body bob (vertical bounce)
      const bobAmount = isRunning ? 0.04 : 0.02;
      const bob = Math.abs(Math.sin(this.walkCycle * 2)) * bobAmount;
      this.characterGroup.position.y = baseY + bob;

      // Slight forward lean when running
      if (isRunning) {
        this.characterGroup.rotation.x = 0.08;
      } else {
        this.characterGroup.rotation.x *= 0.9;
      }

      // Reset idle time
      this.idleTime = 0;
    } else {
      // Idle animation - breathing and subtle sway
      this.idleTime += deltaTime;

      // Breathing (chest rises and falls)
      const breathe = Math.sin(this.idleTime * 2) * 0.008;

      // Subtle body sway (weight shift)
      const sway = Math.sin(this.idleTime * 0.7) * 0.008;

      // Apply breathing and sway
      this.characterGroup.position.y = baseY + breathe;
      this.characterGroup.rotation.z = sway;
      this.characterGroup.rotation.x *= 0.95; // Reset forward lean

      // Smoothly reset limbs to rest position
      const resetSpeed = 0.92;

      if (this.leftThigh) this.leftThigh.rotation.x *= resetSpeed;
      if (this.rightThigh) this.rightThigh.rotation.x *= resetSpeed;
      if (this.leftShin) this.leftShin.rotation.x *= resetSpeed;
      if (this.rightShin) this.rightShin.rotation.x *= resetSpeed;
      if (this.leftUpperArm) this.leftUpperArm.rotation.x *= resetSpeed;
      if (this.rightUpperArm) this.rightUpperArm.rotation.x *= resetSpeed;
      if (this.leftForearm) this.leftForearm.rotation.x *= resetSpeed;
      if (this.rightForearm) this.rightForearm.rotation.x *= resetSpeed;

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
