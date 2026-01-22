/**
 * NPC.js - Non-Player Character Controller
 * Handles individual NPC movement, animation, and behavior on the tiny planet
 */

import * as THREE from 'three';
import {
  createEnhancedToonMaterial,
  createOutlineMesh,
} from '../shaders/toon.js';
import { getWaypoint, getAppearance } from './NPCData.js';
import { MESSENGER_PALETTE } from '../constants/colors.js';

// NPC states
const NPC_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  PAUSED: 'paused', // Pausing at waypoint
  LOOKING: 'looking', // Looking at player
};

export class NPC {
  constructor(scene, planet, definition) {
    this.scene = scene;
    this.planet = planet;
    this.definition = definition;

    // Get appearance preset
    const appearance = getAppearance(definition.appearance);
    this.appearance = appearance;

    // Movement settings
    this.speed = definition.speed || 2.0;
    this.turnSpeed = 4.0;
    this.pauseTime = definition.pauseTime || 2.0;
    this.interactionRadius = definition.interactionRadius || 3.0;

    // Patrol route
    this.patrolRoute = definition.patrolRoute || [];
    this.currentWaypointIndex = 0;
    this.targetPosition = null;

    // State
    this.state = NPC_STATES.IDLE;
    this.pauseTimer = 0;
    this.heading = Math.random() * Math.PI * 2; // Random starting direction

    // Position (on planet surface)
    const startWaypoint = getWaypoint(definition.startWaypoint);
    this.position = this.planet.latLonToPosition(startWaypoint.lat, startWaypoint.lon);

    // Local axes (updated based on position on sphere)
    this.localUp = new THREE.Vector3(0, 1, 0);
    this.localForward = new THREE.Vector3(0, 0, -1);
    this.localRight = new THREE.Vector3(1, 0, 0);

    // Light direction
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();

    // Visual container
    this.container = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.container.add(this.characterGroup);
    this.scene.add(this.container);

    // Animation state
    this.walkCycle = 0;
    this.idleTime = 0;

    // Limb references for animation
    this.leftArm = null;
    this.rightArm = null;
    this.leftLeg = null;
    this.rightLeg = null;

    // Player reference for looking behavior
    this.playerPosition = null;
    this.isNearPlayer = false;

    // Create visual mesh
    this.createMesh();

    // Initialize orientation and start patrol
    this.updateOrientationFromPlanet();
    this.setNextWaypoint();
  }

  /**
   * Create NPC mesh (similar to player but with different colors)
   */
  createMesh() {
    const appearance = this.appearance;

    // Create materials with NPC colors
    const skinMaterial = createEnhancedToonMaterial({
      color: appearance.skinColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const shirtMaterial = createEnhancedToonMaterial({
      color: appearance.shirtColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const pantsMaterial = createEnhancedToonMaterial({
      color: appearance.pantsColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const hairMaterial = createEnhancedToonMaterial({
      color: appearance.hairColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    const shoeMaterial = createEnhancedToonMaterial({
      color: appearance.shoeColor,
      isCharacter: true,
      lightDirection: this.lightDirection,
    });

    // HEAD
    const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const head = new THREE.Mesh(headGeo, skinMaterial);
    head.position.y = 1.4;
    head.castShadow = true;
    this.characterGroup.add(head);

    const headOutline = createOutlineMesh(head, 0.012);
    headOutline.position.copy(head.position);
    this.characterGroup.add(headOutline);

    // HAIR
    const hairGeo = new THREE.SphereGeometry(0.27, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hair = new THREE.Mesh(hairGeo, hairMaterial);
    hair.position.y = 1.48;
    hair.castShadow = true;
    this.characterGroup.add(hair);

    const hairOutline = createOutlineMesh(hair, 0.01);
    hairOutline.position.copy(hair.position);
    this.characterGroup.add(hairOutline);

    // EYES
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x1A1A2E });
    const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);

    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.08, 1.4, 0.2);
    this.characterGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.08, 1.4, 0.2);
    this.characterGroup.add(rightEye);

    // Eye highlights
    const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const highlightGeo = new THREE.SphereGeometry(0.012, 6, 6);

    const leftHighlight = new THREE.Mesh(highlightGeo, highlightMaterial);
    leftHighlight.position.set(-0.06, 1.42, 0.22);
    this.characterGroup.add(leftHighlight);

    const rightHighlight = new THREE.Mesh(highlightGeo, highlightMaterial);
    rightHighlight.position.set(0.1, 1.42, 0.22);
    this.characterGroup.add(rightHighlight);

    // BODY
    const bodyGeo = new THREE.BoxGeometry(0.35, 0.45, 0.2);
    const body = new THREE.Mesh(bodyGeo, shirtMaterial);
    body.position.y = 0.95;
    body.castShadow = true;
    this.characterGroup.add(body);

    const bodyOutline = createOutlineMesh(body, 0.012);
    bodyOutline.position.copy(body.position);
    this.characterGroup.add(bodyOutline);

    // MESSENGER BAG (optional - only for mail carrier)
    if (appearance.hasBag) {
      const bagMaterial = createEnhancedToonMaterial({
        color: appearance.bagColor || 0x8B4513,
        isCharacter: true,
        lightDirection: this.lightDirection,
      });

      const strapGeo = new THREE.BoxGeometry(0.05, 0.02, 0.6);
      const strap = new THREE.Mesh(strapGeo, bagMaterial);
      strap.position.set(0, 1.0, 0);
      strap.rotation.x = Math.PI / 4;
      strap.rotation.z = Math.PI / 6;
      this.characterGroup.add(strap);

      const bagBodyGeo = new THREE.BoxGeometry(0.22, 0.15, 0.07);
      const bagBody = new THREE.Mesh(bagBodyGeo, bagMaterial);
      bagBody.position.set(0.16, 0.72, 0.1);
      bagBody.rotation.y = -0.2;
      this.characterGroup.add(bagBody);
    }

    // ARMS
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8);

    this.leftArm = new THREE.Mesh(armGeo, skinMaterial);
    this.leftArm.position.set(-0.24, 0.95, 0);
    this.leftArm.rotation.z = Math.PI / 12;
    this.leftArm.castShadow = true;
    this.characterGroup.add(this.leftArm);

    const leftArmOutline = createOutlineMesh(this.leftArm, 0.01);
    leftArmOutline.position.copy(this.leftArm.position);
    leftArmOutline.rotation.copy(this.leftArm.rotation);
    this.characterGroup.add(leftArmOutline);

    this.rightArm = new THREE.Mesh(armGeo, skinMaterial);
    this.rightArm.position.set(0.24, 0.95, 0);
    this.rightArm.rotation.z = -Math.PI / 12;
    this.rightArm.castShadow = true;
    this.characterGroup.add(this.rightArm);

    const rightArmOutline = createOutlineMesh(this.rightArm, 0.01);
    rightArmOutline.position.copy(this.rightArm.position);
    rightArmOutline.rotation.copy(this.rightArm.rotation);
    this.characterGroup.add(rightArmOutline);

    // LEGS
    const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8);

    this.leftLeg = new THREE.Mesh(legGeo, pantsMaterial);
    this.leftLeg.position.set(-0.09, 0.5, 0);
    this.leftLeg.castShadow = true;
    this.characterGroup.add(this.leftLeg);

    const leftLegOutline = createOutlineMesh(this.leftLeg, 0.01);
    leftLegOutline.position.copy(this.leftLeg.position);
    this.characterGroup.add(leftLegOutline);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMaterial);
    this.rightLeg.position.set(0.09, 0.5, 0);
    this.rightLeg.castShadow = true;
    this.characterGroup.add(this.rightLeg);

    const rightLegOutline = createOutlineMesh(this.rightLeg, 0.01);
    rightLegOutline.position.copy(this.rightLeg.position);
    this.characterGroup.add(rightLegOutline);

    // FEET
    const footGeo = new THREE.BoxGeometry(0.1, 0.08, 0.15);

    const leftFoot = new THREE.Mesh(footGeo, shoeMaterial);
    leftFoot.position.set(-0.09, 0.18, 0.02);
    leftFoot.castShadow = true;
    this.characterGroup.add(leftFoot);

    const leftFootOutline = createOutlineMesh(leftFoot, 0.008);
    leftFootOutline.position.copy(leftFoot.position);
    this.characterGroup.add(leftFootOutline);

    const rightFoot = new THREE.Mesh(footGeo, shoeMaterial);
    rightFoot.position.set(0.09, 0.18, 0.02);
    rightFoot.castShadow = true;
    this.characterGroup.add(rightFoot);

    const rightFootOutline = createOutlineMesh(rightFoot, 0.008);
    rightFootOutline.position.copy(rightFoot.position);
    this.characterGroup.add(rightFootOutline);

    // SHADOW (blue-gray, never pure black per CLAUDE.md spec)
    const shadowGeo = new THREE.CircleGeometry(0.25, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: MESSENGER_PALETTE.SHADOW_TINT,
      transparent: true,
      opacity: 0.25,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.characterGroup.add(shadow);

    // Initial position update
    this.updateContainerPosition();
  }

  /**
   * Update local orientation from planet position
   */
  updateOrientationFromPlanet() {
    if (!this.planet) return;

    const axes = this.planet.getLocalAxes(this.position, this.heading);
    this.localUp = axes.up;
    this.localForward = axes.forward;
    this.localRight = axes.right;
  }

  /**
   * Set the next waypoint in the patrol route
   */
  setNextWaypoint() {
    if (this.patrolRoute.length === 0) {
      this.state = NPC_STATES.IDLE;
      return;
    }

    this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.patrolRoute.length;
    const waypointName = this.patrolRoute[this.currentWaypointIndex];
    const waypoint = getWaypoint(waypointName);

    this.targetPosition = this.planet.latLonToPosition(waypoint.lat, waypoint.lon);
    this.state = NPC_STATES.WALKING;
  }

  /**
   * Set the light direction
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();
  }

  /**
   * Update player position reference (for look-at behavior)
   */
  setPlayerPosition(position) {
    this.playerPosition = position;
  }

  /**
   * Update NPC each frame
   */
  update(deltaTime) {
    // Check distance to player
    if (this.playerPosition) {
      const distanceToPlayer = this.position.distanceTo(this.playerPosition);
      this.isNearPlayer = distanceToPlayer < this.interactionRadius;
    }

    // Update based on state
    switch (this.state) {
      case NPC_STATES.WALKING:
        this.updateWalking(deltaTime);
        break;
      case NPC_STATES.PAUSED:
        this.updatePaused(deltaTime);
        break;
      case NPC_STATES.LOOKING:
        this.updateLooking(deltaTime);
        break;
      case NPC_STATES.IDLE:
      default:
        this.updateIdle(deltaTime);
        break;
    }

    // Update animation
    this.updateAnimation(deltaTime);

    // Update visual position
    this.updateContainerPosition();
  }

  /**
   * Update walking state
   */
  updateWalking(deltaTime) {
    if (!this.targetPosition) {
      this.setNextWaypoint();
      return;
    }

    // Check if we should look at player instead
    if (this.isNearPlayer) {
      this.state = NPC_STATES.LOOKING;
      return;
    }

    // Calculate direction to target
    const toTarget = new THREE.Vector3().subVectors(this.targetPosition, this.position);
    const distanceToTarget = toTarget.length();

    // Check if we've reached the waypoint
    if (distanceToTarget < 1.0) {
      this.state = NPC_STATES.PAUSED;
      this.pauseTimer = this.pauseTime;
      return;
    }

    // Calculate target heading
    toTarget.normalize();
    const targetHeading = Math.atan2(
      toTarget.dot(this.localRight),
      toTarget.dot(this.localForward)
    );

    // Smoothly rotate towards target
    let headingDiff = targetHeading - this.heading;
    while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
    while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
    this.heading += headingDiff * this.turnSpeed * deltaTime;

    // Update orientation
    this.updateOrientationFromPlanet();

    // Move towards target
    const distance = this.speed * deltaTime;
    this.position = this.planet.moveOnSurface(this.position, this.localForward, distance);
    this.position = this.planet.projectToSurface(this.position);
  }

  /**
   * Update paused state (at waypoint)
   */
  updatePaused(deltaTime) {
    // Check if we should look at player
    if (this.isNearPlayer) {
      this.state = NPC_STATES.LOOKING;
      return;
    }

    this.pauseTimer -= deltaTime;
    if (this.pauseTimer <= 0) {
      this.setNextWaypoint();
    }
  }

  /**
   * Update looking state (facing player)
   */
  updateLooking(deltaTime) {
    // Return to walking if player moves away
    if (!this.isNearPlayer) {
      this.state = NPC_STATES.WALKING;
      return;
    }

    // Turn to face player
    if (this.playerPosition) {
      const toPlayer = new THREE.Vector3().subVectors(this.playerPosition, this.position);
      toPlayer.normalize();

      const targetHeading = Math.atan2(
        toPlayer.dot(this.localRight),
        toPlayer.dot(this.localForward)
      );

      let headingDiff = targetHeading - this.heading;
      while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
      while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
      this.heading += headingDiff * this.turnSpeed * 0.5 * deltaTime;

      this.updateOrientationFromPlanet();
    }
  }

  /**
   * Update idle state
   */
  updateIdle(deltaTime) {
    // Just idle animation, no movement
    this.idleTime += deltaTime;
  }

  /**
   * Update procedural animation
   */
  updateAnimation(deltaTime) {
    const isMoving = this.state === NPC_STATES.WALKING;

    if (isMoving) {
      // Walk cycle
      const cycleSpeed = 8;
      this.walkCycle += deltaTime * cycleSpeed;

      // Leg swing
      const legSwing = Math.sin(this.walkCycle) * 0.35;
      if (this.leftLeg) {
        this.leftLeg.rotation.x = legSwing;
        this.leftLeg.position.z = Math.sin(this.walkCycle) * 0.04;
      }
      if (this.rightLeg) {
        this.rightLeg.rotation.x = -legSwing;
        this.rightLeg.position.z = -Math.sin(this.walkCycle) * 0.04;
      }

      // Arm swing
      const armSwing = Math.sin(this.walkCycle) * 0.25;
      if (this.leftArm) this.leftArm.rotation.x = -armSwing;
      if (this.rightArm) this.rightArm.rotation.x = armSwing;

      // Body bob
      this.characterGroup.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * 0.015;

      this.idleTime = 0;
    } else {
      // Idle animation
      this.idleTime += deltaTime;
      const breathe = Math.sin(this.idleTime * 2) * 0.008;
      this.characterGroup.position.y = breathe;

      // Reset limbs
      if (this.leftLeg) {
        this.leftLeg.rotation.x *= 0.9;
        this.leftLeg.position.z *= 0.9;
      }
      if (this.rightLeg) {
        this.rightLeg.rotation.x *= 0.9;
        this.rightLeg.position.z *= 0.9;
      }
      if (this.leftArm) this.leftArm.rotation.x *= 0.9;
      if (this.rightArm) this.rightArm.rotation.x *= 0.9;

      this.walkCycle *= 0.95;
    }
  }

  /**
   * Update container position and orientation
   */
  updateContainerPosition() {
    // Position above surface
    this.container.position.copy(
      this.planet.projectToSurfaceWithHeight(this.position, 0.8)
    );

    // Orient to match planet surface
    const orientation = this.planet.getSurfaceOrientation(this.position, this.heading);
    this.container.quaternion.copy(orientation);
  }

  /**
   * Get NPC position
   */
  getPosition() {
    return this.position.clone();
  }

  /**
   * Dispose of NPC resources
   */
  dispose() {
    // Traverse and dispose all geometries and materials
    this.container.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });

    this.scene.remove(this.container);
  }
}
