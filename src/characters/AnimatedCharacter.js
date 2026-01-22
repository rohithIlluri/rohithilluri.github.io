/**
 * AnimatedCharacter.js - Character component using loaded 3D models with animations
 * Supports models from Three.js examples (Robot, Fox, Soldier)
 * Falls back to procedural character if models fail to load
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  createEnhancedToonMaterial,
  createOutlineMesh,
} from '../shaders/toon.js';

// Animation state machine
const ANIM_STATES = {
  IDLE: 'Idle',
  WALK: 'Walk',
  RUN: 'Run',
  JUMP: 'Jump',
};

// Character model configurations
const CHARACTER_CONFIGS = {
  robot: {
    url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
    scale: 0.5,
    animations: {
      idle: 'Idle',
      walk: 'Walking',
      run: 'Running',
      jump: 'Jump',
    },
    yOffset: 0,
  },
  soldier: {
    url: 'https://threejs.org/examples/models/gltf/Soldier.glb',
    scale: 1.0,
    animations: {
      idle: 'Idle',
      walk: 'Walk',
      run: 'Run',
    },
    yOffset: 0,
  },
  fox: {
    url: 'https://threejs.org/examples/models/gltf/Fox/glTF/Fox.gltf',
    scale: 0.02,
    animations: {
      idle: 'Survey',
      walk: 'Walk',
      run: 'Run',
    },
    yOffset: 0,
  },
};

export class AnimatedCharacter {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.characterType = options.type || 'robot';
    this.onLoaded = options.onLoaded || null;

    // Container for the character
    this.container = new THREE.Group();
    this.scene.add(this.container);

    // Model and animations
    this.model = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.currentState = ANIM_STATES.IDLE;

    // Fallback procedural character
    this.proceduralCharacter = null;
    this.useProceduralFallback = false;

    // Animation timing
    this.walkCycle = 0;
    this.idleTime = 0;

    // Light direction for shading
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();
  }

  /**
   * Initialize and load the character model
   */
  async init() {
    const config = CHARACTER_CONFIGS[this.characterType];

    if (!config) {
      console.warn(`[AnimatedCharacter] Unknown type: ${this.characterType}, using procedural`);
      this.createProceduralCharacter();
      return;
    }

    try {
      console.log(`[AnimatedCharacter] Loading ${this.characterType} model...`);
      await this.loadModel(config);
      console.log(`[AnimatedCharacter] ${this.characterType} loaded successfully`);

      if (this.onLoaded) {
        this.onLoaded(this);
      }
    } catch (error) {
      console.warn(`[AnimatedCharacter] Failed to load model, using procedural:`, error.message);
      this.createProceduralCharacter();
    }
  }

  /**
   * Load GLTF model
   */
  async loadModel(config) {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        config.url,
        (gltf) => {
          this.model = gltf.scene;
          this.model.scale.setScalar(config.scale);
          this.model.position.y = config.yOffset;

          // Apply toon materials to all meshes
          this.model.traverse((child) => {
            if (child.isMesh) {
              // Get original color
              const originalColor = child.material.color
                ? child.material.color.getHex()
                : 0x4A90D9;

              // Create toon material
              child.material = createEnhancedToonMaterial({
                color: originalColor,
                isCharacter: true,
                lightDirection: this.lightDirection,
              });

              child.castShadow = true;
              child.receiveShadow = false;

              // Add outline mesh
              const outline = createOutlineMesh(child, 0.015);
              if (outline) {
                child.parent.add(outline);
              }
            }
          });

          // Setup animation mixer
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model);

            // Map animations to states
            gltf.animations.forEach((clip) => {
              this.animations[clip.name] = this.mixer.clipAction(clip);
            });

            // Start with idle animation
            this.playAnimation(config.animations.idle);
          }

          this.container.add(this.model);
          this.useProceduralFallback = false;

          resolve(gltf);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  /**
   * Create procedural character as fallback
   */
  createProceduralCharacter() {
    this.useProceduralFallback = true;
    this.proceduralCharacter = new THREE.Group();

    // Character colors
    const skinColor = 0xFFD1AA;
    const shirtColor = 0x4FC3F7;
    const pantsColor = 0x3D5A80;
    const hairColor = 0x5D4037;

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
    this.proceduralCharacter.add(head);

    // Head outline
    const headOutline = createOutlineMesh(head, 0.015);
    headOutline.position.copy(head.position);
    this.proceduralCharacter.add(headOutline);

    // HAIR
    const hairGeo = new THREE.SphereGeometry(0.27, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.y = 1.5;
    hair.castShadow = true;
    this.proceduralCharacter.add(hair);

    // EYES
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1A1A2E });
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.08, 1.48, 0.2);
    this.proceduralCharacter.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.08, 1.48, 0.2);
    this.proceduralCharacter.add(rightEye);

    // EYE WHITES
    const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const eyeWhiteGeo = new THREE.SphereGeometry(0.055, 8, 8);

    const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    leftEyeWhite.position.set(-0.08, 1.48, 0.18);
    this.proceduralCharacter.add(leftEyeWhite);

    const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMaterial);
    rightEyeWhite.position.set(0.08, 1.48, 0.18);
    this.proceduralCharacter.add(rightEyeWhite);

    // BODY
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.5, 0.22);
    const body = new THREE.Mesh(bodyGeo, shirtMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    this.proceduralCharacter.add(body);

    const bodyOutline = createOutlineMesh(body, 0.015);
    bodyOutline.position.copy(body.position);
    this.proceduralCharacter.add(bodyOutline);

    // ARMS
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);

    this.leftArm = new THREE.Mesh(armGeo, skinMaterial);
    this.leftArm.position.set(-0.28, 1.0, 0);
    this.leftArm.rotation.z = Math.PI / 12;
    this.leftArm.castShadow = true;
    this.proceduralCharacter.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, skinMaterial);
    this.rightArm.position.set(0.28, 1.0, 0);
    this.rightArm.rotation.z = -Math.PI / 12;
    this.rightArm.castShadow = true;
    this.proceduralCharacter.add(this.rightArm);

    // LEGS
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);

    this.leftLeg = new THREE.Mesh(legGeo, pantsMaterial);
    this.leftLeg.position.set(-0.1, 0.5, 0);
    this.leftLeg.castShadow = true;
    this.proceduralCharacter.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMaterial);
    this.rightLeg.position.set(0.1, 0.5, 0);
    this.rightLeg.castShadow = true;
    this.proceduralCharacter.add(this.rightLeg);

    // FEET
    const footGeo = new THREE.BoxGeometry(0.1, 0.08, 0.16);
    const footMaterial = createEnhancedToonMaterial({
      color: 0x3D3D3D,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const leftFoot = new THREE.Mesh(footGeo, footMaterial);
    leftFoot.position.set(-0.1, 0.2, 0.02);
    leftFoot.castShadow = true;
    this.proceduralCharacter.add(leftFoot);

    const rightFoot = new THREE.Mesh(footGeo, footMaterial);
    rightFoot.position.set(0.1, 0.2, 0.02);
    rightFoot.castShadow = true;
    this.proceduralCharacter.add(rightFoot);

    // SHADOW BLOB
    const shadowGeo = new THREE.CircleGeometry(0.3, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    });
    this.shadowBlob = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.shadowBlob.position.y = 0.02;
    this.proceduralCharacter.add(this.shadowBlob);

    this.container.add(this.proceduralCharacter);

    if (this.onLoaded) {
      this.onLoaded(this);
    }
  }

  /**
   * Play an animation by name
   */
  playAnimation(name) {
    if (!this.mixer || !this.animations[name]) return;

    const newAction = this.animations[name];

    if (this.currentAction === newAction) return;

    if (this.currentAction) {
      this.currentAction.fadeOut(0.2);
    }

    newAction.reset().fadeIn(0.2).play();
    this.currentAction = newAction;
  }

  /**
   * Set animation state based on movement
   */
  setState(state) {
    if (this.currentState === state) return;
    this.currentState = state;

    const config = CHARACTER_CONFIGS[this.characterType];
    if (!config) return;

    switch (state) {
      case ANIM_STATES.IDLE:
        this.playAnimation(config.animations.idle);
        break;
      case ANIM_STATES.WALK:
        this.playAnimation(config.animations.walk);
        break;
      case ANIM_STATES.RUN:
        this.playAnimation(config.animations.run);
        break;
      case ANIM_STATES.JUMP:
        if (config.animations.jump) {
          this.playAnimation(config.animations.jump);
        }
        break;
    }
  }

  /**
   * Update character (animations)
   */
  update(deltaTime, isMoving = false, isRunning = false) {
    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }

    // Update state based on movement
    if (isMoving) {
      this.setState(isRunning ? ANIM_STATES.RUN : ANIM_STATES.WALK);
    } else {
      this.setState(ANIM_STATES.IDLE);
    }

    // Update procedural animation if using fallback
    if (this.useProceduralFallback) {
      this.updateProceduralAnimation(deltaTime, isMoving, isRunning);
    }
  }

  /**
   * Update procedural character animation
   */
  updateProceduralAnimation(deltaTime, isMoving, isRunning) {
    if (!this.proceduralCharacter) return;

    if (isMoving) {
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

      // Arm swing
      const armSwing = Math.sin(this.walkCycle) * 0.3;
      if (this.leftArm) {
        this.leftArm.rotation.x = -armSwing;
      }
      if (this.rightArm) {
        this.rightArm.rotation.x = armSwing;
      }

      // Body bob
      const bobAmount = isRunning ? 0.03 : 0.015;
      this.proceduralCharacter.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * bobAmount;

      this.idleTime = 0;
    } else {
      // Idle animation
      this.idleTime += deltaTime;
      const breathe = Math.sin(this.idleTime * 2) * 0.01;
      this.proceduralCharacter.position.y = breathe;

      // Reset limbs
      if (this.leftLeg) this.leftLeg.rotation.x *= 0.9;
      if (this.rightLeg) this.rightLeg.rotation.x *= 0.9;
      if (this.leftArm) this.leftArm.rotation.x *= 0.9;
      if (this.rightArm) this.rightArm.rotation.x *= 0.9;

      this.walkCycle *= 0.95;
    }
  }

  /**
   * Set light direction for shading
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();

    // Update materials if using loaded model
    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh && child.material.uniforms?.lightDirection) {
          child.material.uniforms.lightDirection.value = this.lightDirection;
        }
      });
    }
  }

  /**
   * Get the character container
   */
  getContainer() {
    return this.container;
  }

  /**
   * Dispose of the character
   */
  dispose() {
    if (this.model) {
      this.model.traverse((child) => {
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

    if (this.proceduralCharacter) {
      this.proceduralCharacter.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }

    this.scene.remove(this.container);
  }
}

export default AnimatedCharacter;
