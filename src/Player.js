/**
 * Player.js - Spherical Planet Player Controller
 * Handles player movement on a tiny planet sphere with proper orientation
 * Player always stands perpendicular to the sphere surface (local "up")
 * With enhanced toon material, outline mesh, and character model support
 */

import * as THREE from 'three';
import { useGameStore } from './stores/gameStore.js';
import {
  createEnhancedToonMaterial,
  createOutlineMesh,
} from './shaders/toon.js';
import { getAudioManager } from './audio/AudioManager.js';
import { MESSENGER_PALETTE, CHARACTER_COLORS } from './constants/colors.js';
import { loadModelWithFallback } from './utils/ModelLoader.js';
import {
  applyCharacterToonShading,
  updateModelLightDirection,
  scaleModelToHeight,
  centerModelAtGround,
  setupModelAnimations,
  createCharacterShadow,
} from './utils/ToonModelHelper.js';

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

    // Enhanced momentum system
    this.momentum = {
      acceleration: 12,      // How fast to reach target speed
      deceleration: 8,       // How fast to slow down
      turnAcceleration: 6,   // How fast to change direction
      currentVelocity: new THREE.Vector3(), // Actual movement velocity
      targetVelocity: new THREE.Vector3(),  // Desired movement velocity
    };

    // Wall sliding parameters
    this.wallSlide = {
      enabled: true,
      slideStrength: 0.85,   // How much velocity is preserved when sliding
      minSlideAngle: 0.3,    // Minimum angle to trigger slide (radians)
    };

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

    // Thigh material (skin-colored - visible below skirt)
    const shortsMaterial = createEnhancedToonMaterial({
      color: skinColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    // =====================================================
    // HEAD (larger anime-style head - key for cute look)
    // =====================================================
    // Rounded head, bigger for anime proportions
    const headGeo = new THREE.SphereGeometry(0.18, 24, 24);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.62; // Adjusted for larger head
    head.scale.set(1.0, 1.15, 0.95); // Slightly taller, flatter face
    head.castShadow = true;
    head.renderOrder = 10; // Render character meshes after outlines
    this.characterGroup.add(head);

    const headOutline = createOutlineMesh(head, 0.05);
    headOutline.position.copy(head.position);
    headOutline.scale.copy(head.scale);
    headOutline.renderOrder = 5; // Outlines render before main meshes
    this.characterGroup.add(headOutline);

    // =====================================================
    // HAIR - Messy anime style (larger to match bigger head)
    // =====================================================
    // Main hair volume
    const hairGeo = new THREE.SphereGeometry(0.20, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.y = 1.72;
    hair.scale.set(1.05, 1.0, 1.0);
    hair.castShadow = true;
    this.characterGroup.add(hair);

    // Hair bangs (messy front fringe - larger)
    const bangsGeo = new THREE.BoxGeometry(0.28, 0.07, 0.10);
    const bangs = new THREE.Mesh(bangsGeo, hairMaterial);
    bangs.position.set(0, 1.70, 0.13);
    bangs.rotation.x = -0.15;
    this.characterGroup.add(bangs);

    // Side strands (messy look - larger)
    const strandGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const leftStrand = new THREE.Mesh(strandGeo, hairMaterial);
    leftStrand.position.set(-0.16, 1.55, 0.08);
    leftStrand.scale.set(1, 1.6, 0.8);
    this.characterGroup.add(leftStrand);

    const rightStrand = new THREE.Mesh(strandGeo, hairMaterial);
    rightStrand.position.set(0.16, 1.55, 0.08);
    rightStrand.scale.set(1, 1.6, 0.8);
    this.characterGroup.add(rightStrand);

    // Back of hair (larger)
    const backHairGeo = new THREE.SphereGeometry(0.18, 12, 12, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.55);
    const backHair = new THREE.Mesh(backHairGeo, hairMaterial);
    backHair.position.set(0, 1.55, -0.08);
    backHair.rotation.x = Math.PI;
    this.characterGroup.add(backHair);

    const hairOutline = createOutlineMesh(hair, 0.045);
    hairOutline.position.copy(hair.position);
    hairOutline.scale.copy(hair.scale);
    hairOutline.renderOrder = 5;
    this.characterGroup.add(hairOutline);

    // =====================================================
    // FACE - BIG expressive eyes (anime style - CRITICAL)
    // =====================================================
    // Eyes - MUCH LARGER for anime/messenger look
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: MESSENGER_PALETTE.OUTLINE_PRIMARY });
    const eyeGeo = new THREE.SphereGeometry(0.085, 16, 16); // BIG anime eyes!

    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.065, 1.60, 0.14);
    leftEye.scale.set(0.9, 1.15, 0.5); // Tall oval shape
    this.characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.065, 1.60, 0.14);
    rightEye.scale.set(0.9, 1.15, 0.5); // Tall oval shape
    this.characterGroup.add(rightEye);

    // Eye whites (behind pupils for depth)
    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const eyeWhiteGeo = new THREE.SphereGeometry(0.09, 16, 16);

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.065, 1.60, 0.12);
    leftEyeWhite.scale.set(0.85, 1.1, 0.4);
    this.characterGroup.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.065, 1.60, 0.12);
    rightEyeWhite.scale.set(0.85, 1.1, 0.4);
    this.characterGroup.add(rightEyeWhite);

    // Eye highlights - BIG and prominent (anime sparkle)
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const highlightGeo = new THREE.SphereGeometry(0.035, 10, 10);

    const leftHighlight = new THREE.Mesh(highlightGeo, highlightMaterial);
    leftHighlight.position.set(-0.045, 1.64, 0.16);
    this.characterGroup.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(highlightGeo, highlightMaterial);
    rightHighlight.position.set(0.085, 1.64, 0.16);
    this.characterGroup.add(rightHighlight);

    // Secondary smaller highlights for extra sparkle
    const highlight2Geo = new THREE.SphereGeometry(0.018, 8, 8);
    const leftHighlight2 = new THREE.Mesh(highlight2Geo, highlightMaterial);
    leftHighlight2.position.set(-0.08, 1.58, 0.155);
    this.characterGroup.add(leftHighlight2);

    const rightHighlight2 = new THREE.Mesh(highlight2Geo, highlightMaterial);
    rightHighlight2.position.set(0.05, 1.58, 0.155);
    this.characterGroup.add(rightHighlight2);

    // Blush marks (cute anime cheeks)
    const blushMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFB6C1,
      transparent: true,
      opacity: 0.4
    });
    const blushGeo = new THREE.SphereGeometry(0.04, 8, 8);

    const leftBlush = new THREE.Mesh(blushGeo, blushMaterial);
    leftBlush.position.set(-0.11, 1.55, 0.12);
    leftBlush.scale.set(1.2, 0.6, 0.3);
    this.characterGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMaterial);
    rightBlush.position.set(0.11, 1.55, 0.12);
    rightBlush.scale.set(1.2, 0.6, 0.3);
    this.characterGroup.add(rightBlush);

    // Small cute nose
    const noseMaterial = createEnhancedToonMaterial({
      color: 0xE8C8B8, // Slightly darker than skin
      isCharacter: true,
      lightDirection: this.lightDirection,
    });
    const noseGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const nose = new THREE.Mesh(noseGeo, noseMaterial);
    nose.position.set(0, 1.56, 0.165);
    nose.scale.set(1, 0.8, 0.5);
    this.characterGroup.add(nose);

    // Small smile
    const smileMaterial = new THREE.MeshBasicMaterial({ color: 0xC88080 });
    const smileGeo = new THREE.TorusGeometry(0.025, 0.004, 8, 12, Math.PI);
    const smile = new THREE.Mesh(smileGeo, smileMaterial);
    smile.position.set(0, 1.52, 0.155);
    smile.rotation.x = -0.1;
    smile.rotation.z = Math.PI;
    this.characterGroup.add(smile);

    // Eyebrows (thicker, more expressive)
    const browMaterial = new THREE.MeshBasicMaterial({ color: hairColor });
    const browGeo = new THREE.BoxGeometry(0.055, 0.008, 0.008);

    const leftBrow = new THREE.Mesh(browGeo, browMaterial);
    leftBrow.position.set(-0.055, 1.70, 0.13);
    leftBrow.rotation.z = 0.12;
    this.characterGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMaterial);
    rightBrow.position.set(0.055, 1.70, 0.13);
    rightBrow.rotation.z = -0.12;
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

    const torsoOutline = createOutlineMesh(upperTorso, 0.04);
    torsoOutline.position.copy(upperTorso.position);
    torsoOutline.renderOrder = 5;
    this.characterGroup.add(torsoOutline);

    // RED SKIRT (signature messenger.abeto.co look)
    // A-line shape using a tapered cylinder
    const skirtGeo = new THREE.CylinderGeometry(0.08, 0.18, 0.25, 8);
    const skirt = new THREE.Mesh(skirtGeo, skirtMaterial);
    skirt.position.y = 0.98;
    skirt.castShadow = true;
    this.characterGroup.add(skirt);

    const skirtOutline = createOutlineMesh(skirt, 0.04);
    skirtOutline.position.copy(skirt.position);
    skirtOutline.renderOrder = 5;
    this.characterGroup.add(skirtOutline);

    // =====================================================
    // MESSENGER BAG (iconic YELLOW bag - signature look!)
    // =====================================================
    // Strap (bright yellow, diagonal across body)
    const strapGeo = new THREE.BoxGeometry(0.035, 0.55, 0.018);
    const strap = new THREE.Mesh(strapGeo, bagMaterial); // Yellow strap
    strap.position.set(0.05, 1.22, 0.06);
    strap.rotation.z = Math.PI / 4.5;
    strap.rotation.x = 0.1;
    this.characterGroup.add(strap);

    // Bag body - LARGER and clearly yellow (on right hip)
    const bagBodyGeo = new THREE.BoxGeometry(0.20, 0.15, 0.07);
    const bagBody = new THREE.Mesh(bagBodyGeo, bagMaterial);
    bagBody.position.set(0.18, 0.92, 0.10);
    bagBody.rotation.y = -0.12;
    bagBody.castShadow = true;
    this.characterGroup.add(bagBody);

    const bagOutline = createOutlineMesh(bagBody, 0.04);
    bagOutline.position.copy(bagBody.position);
    bagOutline.rotation.copy(bagBody.rotation);
    bagOutline.renderOrder = 5;
    this.characterGroup.add(bagOutline);

    // Bag flap (larger)
    const flapGeo = new THREE.BoxGeometry(0.20, 0.05, 0.075);
    const flap = new THREE.Mesh(flapGeo, bagMaterial);
    flap.position.set(0.18, 0.98, 0.12);
    flap.rotation.y = -0.12;
    flap.rotation.x = 0.08;
    this.characterGroup.add(flap);

    // Bag buckle (small dark accent)
    const buckleMaterial = createEnhancedToonMaterial({
      color: MESSENGER_PALETTE.OUTLINE_PRIMARY,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });
    const buckleGeo = new THREE.BoxGeometry(0.04, 0.025, 0.02);
    const buckle = new THREE.Mesh(buckleGeo, buckleMaterial);
    buckle.position.set(0.18, 0.96, 0.145);
    buckle.rotation.y = -0.12;
    this.characterGroup.add(buckle);

    // =====================================================
    // ARMS (thinner for anime proportions)
    // =====================================================
    // Upper arm - thinner
    const upperArmGeo = new THREE.CylinderGeometry(0.028, 0.024, 0.22, 8);

    this.leftUpperArm = new THREE.Mesh(upperArmGeo, skinMaterial);
    this.leftUpperArm.position.set(-0.17, 1.28, 0);
    this.leftUpperArm.rotation.z = 0.12;
    this.leftUpperArm.castShadow = true;
    this.characterGroup.add(this.leftUpperArm);

    this.rightUpperArm = new THREE.Mesh(upperArmGeo, skinMaterial);
    this.rightUpperArm.position.set(0.17, 1.28, 0);
    this.rightUpperArm.rotation.z = -0.12;
    this.rightUpperArm.castShadow = true;
    this.characterGroup.add(this.rightUpperArm);

    // Forearm - thinner
    const forearmGeo = new THREE.CylinderGeometry(0.024, 0.020, 0.20, 8);

    this.leftForearm = new THREE.Mesh(forearmGeo, skinMaterial);
    this.leftForearm.position.set(-0.19, 1.08, 0);
    this.leftForearm.rotation.z = 0.08;
    this.leftForearm.castShadow = true;
    this.characterGroup.add(this.leftForearm);

    this.rightForearm = new THREE.Mesh(forearmGeo, skinMaterial);
    this.rightForearm.position.set(0.19, 1.08, 0);
    this.rightForearm.rotation.z = -0.08;
    this.rightForearm.castShadow = true;
    this.characterGroup.add(this.rightForearm);

    // Hands (smaller, rounder)
    const handGeo = new THREE.SphereGeometry(0.028, 8, 8);

    const leftHand = new THREE.Mesh(handGeo, skinMaterial);
    leftHand.position.set(-0.20, 0.96, 0);
    leftHand.scale.set(1, 1.2, 0.8);
    this.characterGroup.add(leftHand);

    const rightHand = new THREE.Mesh(handGeo, skinMaterial);
    rightHand.position.set(0.20, 0.96, 0);
    rightHand.scale.set(1, 1.2, 0.8);
    this.characterGroup.add(rightHand);

    // Store arm references for animation
    this.leftArm = this.leftUpperArm;
    this.rightArm = this.rightUpperArm;

    // =====================================================
    // LEGS (thinner for anime proportions)
    // =====================================================
    // Thigh (skin colored - visible below skirt)
    const thighGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.28, 8);

    this.leftThigh = new THREE.Mesh(thighGeo, skinMaterial); // Skin colored!
    this.leftThigh.position.set(-0.065, 0.72, 0);
    this.leftThigh.castShadow = true;
    this.characterGroup.add(this.leftThigh);

    this.rightThigh = new THREE.Mesh(thighGeo, skinMaterial); // Skin colored!
    this.rightThigh.position.set(0.065, 0.72, 0);
    this.rightThigh.castShadow = true;
    this.characterGroup.add(this.rightThigh);

    // Lower leg (skin) - thinner
    const shinGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.32, 8);

    this.leftShin = new THREE.Mesh(shinGeo, skinMaterial);
    this.leftShin.position.set(-0.065, 0.42, 0);
    this.leftShin.castShadow = true;
    this.characterGroup.add(this.leftShin);

    this.rightShin = new THREE.Mesh(shinGeo, skinMaterial);
    this.rightShin.position.set(0.065, 0.42, 0);
    this.rightShin.castShadow = true;
    this.characterGroup.add(this.rightShin);

    // Store leg references for animation
    this.leftLeg = this.leftThigh;
    this.rightLeg = this.rightThigh;

    // Ankle socks (white)
    const sockGeo = new THREE.CylinderGeometry(0.035, 0.038, 0.05, 8);

    const leftSock = new THREE.Mesh(sockGeo, sockMaterial);
    leftSock.position.set(-0.065, 0.24, 0);
    this.characterGroup.add(leftSock);

    const rightSock = new THREE.Mesh(sockGeo, sockMaterial);
    rightSock.position.set(0.065, 0.24, 0);
    this.characterGroup.add(rightSock);

    // =====================================================
    // FEET/SHOES - CHUNKY YELLOW SNEAKERS (signature!)
    // =====================================================
    // Main shoe body - chunky and yellow
    const footGeo = new THREE.BoxGeometry(0.09, 0.08, 0.16);

    const leftFoot = new THREE.Mesh(footGeo, shoeMaterial);
    leftFoot.position.set(-0.065, 0.17, 0.025);
    leftFoot.castShadow = true;
    this.characterGroup.add(leftFoot);

    const leftFootOutline = createOutlineMesh(leftFoot, 0.035);
    leftFootOutline.position.copy(leftFoot.position);
    leftFootOutline.renderOrder = 5;
    this.characterGroup.add(leftFootOutline);

    const rightFoot = new THREE.Mesh(footGeo, shoeMaterial);
    rightFoot.position.set(0.065, 0.17, 0.025);
    rightFoot.castShadow = true;
    this.characterGroup.add(rightFoot);

    const rightFootOutline = createOutlineMesh(rightFoot, 0.035);
    rightFootOutline.position.copy(rightFoot.position);
    rightFootOutline.renderOrder = 5;
    this.characterGroup.add(rightFootOutline);

    // Shoe sole (white for chunky sneaker look)
    const soleMaterial = createEnhancedToonMaterial({
      color: 0xF5F5F5,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });
    const soleGeo = new THREE.BoxGeometry(0.095, 0.025, 0.165);

    const leftSole = new THREE.Mesh(soleGeo, soleMaterial);
    leftSole.position.set(-0.065, 0.125, 0.025);
    this.characterGroup.add(leftSole);

    const rightSole = new THREE.Mesh(soleGeo, soleMaterial);
    rightSole.position.set(0.065, 0.125, 0.025);
    this.characterGroup.add(rightSole);

    // Shoe toe cap (white accent)
    const toeGeo = new THREE.BoxGeometry(0.07, 0.04, 0.04);

    const leftToe = new THREE.Mesh(toeGeo, soleMaterial);
    leftToe.position.set(-0.065, 0.16, 0.09);
    this.characterGroup.add(leftToe);

    const rightToe = new THREE.Mesh(toeGeo, soleMaterial);
    rightToe.position.set(0.065, 0.16, 0.09);
    this.characterGroup.add(rightToe);

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
   * Load external character model if available, otherwise keep procedural mesh
   * Supports GLB format with automatic toon shading application
   */
  async loadCharacterModel() {
    try {
      const { model, isLoaded } = await loadModelWithFallback(
        'characters/player.glb',
        () => null, // Return null to keep procedural mesh
        { clone: true }
      );

      if (isLoaded && model) {
        console.log('Loaded player model from GLB');

        // Remove procedural mesh
        if (this.characterGroup) {
          this.container.remove(this.characterGroup);
          this.characterGroup.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
        }

        // Apply toon shading to loaded model
        applyCharacterToonShading(model, {
          skinColor: CHARACTER_COLORS.skin,
          hairColor: CHARACTER_COLORS.hair,
          shirtColor: CHARACTER_COLORS.shirt,
          pantsColor: CHARACTER_COLORS.skirt,
          shoeColor: CHARACTER_COLORS.shoes,
          bagColor: CHARACTER_COLORS.bag,
        }, this.lightDirection);

        // Scale model to correct height (1.8 units total)
        scaleModelToHeight(model, 1.8);
        centerModelAtGround(model);

        // Add shadow blob
        const shadow = createCharacterShadow(0.22, 0.25);
        shadow.position.y = 0.01;
        model.add(shadow);
        this.shadowBlob = shadow;

        // Set up animations if present
        const animSetup = setupModelAnimations(model);
        if (animSetup) {
          this.mixer = animSetup.mixer;
          this.animations = animSetup.actions;

          // Map standard animation names
          if (this.animations.idle) this.animations[ANIM_STATES.IDLE] = this.animations.idle;
          if (this.animations.walk) this.animations[ANIM_STATES.WALK] = this.animations.walk;
          if (this.animations.run) this.animations[ANIM_STATES.RUN] = this.animations.run;

          // Start with idle animation
          if (this.animations[ANIM_STATES.IDLE]) {
            this.animations[ANIM_STATES.IDLE].play();
          }
        }

        // Store model reference and add to container
        this.characterModel = model;
        this.characterGroup = model;
        model.position.y = -0.14; // Same offset as procedural mesh
        this.container.add(model);

        // Find limb references for fallback procedural animation
        this.findLimbReferences(model);

      } else {
        console.log('Using procedural character (no external model found)');
      }
    } catch (error) {
      console.log('Using procedural character:', error.message);
    }
  }

  /**
   * Find limb mesh references in loaded model for procedural animation fallback
   * Searches for meshes with common bone/object names
   */
  findLimbReferences(model) {
    model.traverse((child) => {
      const name = child.name?.toLowerCase() || '';

      // Arm references
      if (name.includes('arm') && name.includes('left') && name.includes('upper')) {
        this.leftUpperArm = child;
      }
      if (name.includes('arm') && name.includes('right') && name.includes('upper')) {
        this.rightUpperArm = child;
      }
      if (name.includes('arm') && name.includes('left') && name.includes('fore')) {
        this.leftForearm = child;
      }
      if (name.includes('arm') && name.includes('right') && name.includes('fore')) {
        this.rightForearm = child;
      }

      // Leg references
      if (name.includes('thigh') && name.includes('left')) {
        this.leftThigh = child;
      }
      if (name.includes('thigh') && name.includes('right')) {
        this.rightThigh = child;
      }
      if (name.includes('shin') && name.includes('left')) {
        this.leftShin = child;
      }
      if (name.includes('shin') && name.includes('right')) {
        this.rightShin = child;
      }
    });
  }

  /**
   * Set the light direction (synced with sun position)
   * @param {THREE.Vector3} direction
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();

    // Update material uniform if using enhanced toon material
    if (this.mesh && this.mesh.material?.uniforms) {
      this.mesh.material.uniforms.lightDirection.value = this.lightDirection;
    }

    // Update character model materials (both procedural and loaded)
    if (this.characterModel) {
      updateModelLightDirection(this.characterModel, this.lightDirection);
    } else if (this.characterGroup) {
      // Update procedural character materials
      let updatedCount = 0;
      this.characterGroup.traverse((child) => {
        if (child.isMesh && child.material?.uniforms?.lightDirection) {
          child.material.uniforms.lightDirection.value.copy(this.lightDirection);
          updatedCount++;
        }
      });
      // Log warning if no materials were updated (helps with debugging)
      if (updatedCount === 0 && this.characterGroup.children.length > 0) {
        console.warn('[Player] No toon materials found to update light direction');
      }
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
      // Wrap walk cycle to prevent NaN after long sessions (2*PI for full cycle)
      this.walkCycle = (this.walkCycle + deltaTime * cycleSpeed) % (Math.PI * 2);

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
   * Update movement on spherical planet with momentum and wall sliding
   */
  updateSpherical(deltaTime, movement, speed, isMoving) {
    // Update orientation from planet
    this.updateOrientationFromPlanet();

    if (isMoving) {
      // Calculate target heading based on movement direction
      const targetHeading = Math.atan2(movement.x, movement.z);

      // Smoothly rotate towards target heading with momentum
      let headingDiff = targetHeading - this.heading;
      while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
      while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;

      // Use turn acceleration for smoother turning
      const turnFactor = Math.min(1, this.momentum.turnAcceleration * deltaTime);
      this.heading += headingDiff * turnFactor;

      // Update local axes with new heading
      this.updateOrientationFromPlanet();

      // Calculate target velocity in world space
      const moveDir = new THREE.Vector3()
        .addScaledVector(this.localForward, movement.z)
        .addScaledVector(this.localRight, movement.x)
        .normalize();

      this.momentum.targetVelocity.copy(moveDir).multiplyScalar(speed);

      // Smoothly accelerate towards target velocity (momentum)
      const accelFactor = Math.min(1, this.momentum.acceleration * deltaTime);
      this.momentum.currentVelocity.lerp(this.momentum.targetVelocity, accelFactor);
    } else {
      // Decelerate when not moving (friction/momentum)
      this.momentum.targetVelocity.set(0, 0, 0);
      const decelFactor = Math.min(1, this.momentum.deceleration * deltaTime);
      this.momentum.currentVelocity.lerp(this.momentum.targetVelocity, decelFactor);
    }

    // Only move if we have meaningful velocity
    const currentSpeed = this.momentum.currentVelocity.length();
    if (currentSpeed > 0.01) {
      const moveDir = this.momentum.currentVelocity.clone().normalize();
      const distance = currentSpeed * deltaTime;

      // Try to move to new position
      const newPosition = this.planet.moveOnSurface(this.position, moveDir, distance);

      // Check collision with wall sliding
      if (this.canMoveTo(newPosition)) {
        this.position.copy(newPosition);
      } else if (this.wallSlide.enabled) {
        // Wall sliding: try to slide along the obstacle
        const slideResult = this.tryWallSlide(newPosition, moveDir, distance);
        if (slideResult.canMove) {
          this.position.copy(slideResult.position);
          // Reduce momentum in blocked direction
          this.momentum.currentVelocity.multiplyScalar(this.wallSlide.slideStrength);
        } else {
          // Complete stop - can't slide
          this.momentum.currentVelocity.multiplyScalar(0.2);
        }
      } else {
        // No wall sliding, just stop
        this.momentum.currentVelocity.set(0, 0, 0);
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
   * Attempt to slide along a wall when direct movement is blocked
   * @param {THREE.Vector3} blockedPosition - The position we couldn't move to
   * @param {THREE.Vector3} moveDir - Original movement direction
   * @param {number} distance - Movement distance
   * @returns {Object} { canMove: boolean, position: THREE.Vector3 }
   */
  tryWallSlide(blockedPosition, moveDir, distance) {
    // Try sliding along forward axis
    const forwardSlide = this.planet.moveOnSurface(
      this.position,
      this.localForward,
      distance * Math.abs(moveDir.dot(this.localForward))
    );
    if (this.canMoveTo(forwardSlide)) {
      return { canMove: true, position: forwardSlide };
    }

    // Try sliding along right axis
    const rightSlide = this.planet.moveOnSurface(
      this.position,
      this.localRight,
      distance * Math.abs(moveDir.dot(this.localRight))
    );
    if (this.canMoveTo(rightSlide)) {
      return { canMove: true, position: rightSlide };
    }

    // Try negative forward
    const backwardSlide = this.planet.moveOnSurface(
      this.position,
      this.localForward.clone().negate(),
      distance * 0.5
    );
    if (this.canMoveTo(backwardSlide)) {
      return { canMove: true, position: backwardSlide };
    }

    // Try negative right
    const leftSlide = this.planet.moveOnSurface(
      this.position,
      this.localRight.clone().negate(),
      distance * 0.5
    );
    if (this.canMoveTo(leftSlide)) {
      return { canMove: true, position: leftSlide };
    }

    // Can't slide in any direction
    return { canMove: false, position: this.position };
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
