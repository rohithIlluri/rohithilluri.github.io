/**
 * Mailbox.js - 3D Mailbox Entity
 * Creates a cel-shaded mailbox with flag indicator and mail generation
 * Part of the mail delivery gameplay loop
 */

import * as THREE from 'three';
import {
  createToonMaterial,
  createOutlineMesh,
  createGlowMaterial,
} from '../shaders/toon.js';
import { MESSENGER_PALETTE } from '../constants/colors.js';
import { NPC_DEFINITIONS, getAppearance } from './NPCData.js';

// Mailbox colors
const MAILBOX_COLORS = {
  body: 0x3A5A8C,       // Blue mailbox body
  post: 0x6B5B4B,       // Wooden post
  flag: 0xC85A5A,       // Red flag
  flagGlow: 0xFF6B6B,   // Glowing flag when mail available
  door: 0x2A4A6C,       // Darker blue for door
};

// Mail priorities and their coin rewards
const MAIL_PRIORITIES = {
  normal: { reward: 10, color: 0xFFFFFF },
  express: { reward: 15, color: 0x5ABBB8 },
  urgent: { reward: 25, color: 0xC85A5A },
};

// Location names for mail origins
const MAIL_ORIGINS = [
  'Town Center',
  'Harbor District',
  'Mountain Village',
  'Forest Edge',
  'Beach Cove',
  'North Path',
];

export class Mailbox {
  constructor(scene, planet, options = {}) {
    this.scene = scene;
    this.planet = planet;

    // Position on planet (lat/lon)
    this.lat = options.lat || 0;
    this.lon = options.lon || 0;
    this.position = this.planet.latLonToPosition(this.lat, this.lon);

    // Mailbox ID
    this.id = options.id || `mailbox-${Date.now()}`;

    // Mail state
    this.hasNewMail = false;
    this.currentMail = null;

    // Light direction for cel-shading
    this.lightDirection = new THREE.Vector3(1, 1, 1).normalize();

    // Interaction radius
    this.interactionRadius = options.interactionRadius || 3.0;

    // Visual container
    this.container = new THREE.Group();
    this.scene.add(this.container);

    // Animation state
    this.flagAngle = 0;
    this.glowIntensity = 0;
    this.time = 0;

    // References for animation
    this.flag = null;
    this.flagGlow = null;
    this.glowParticles = null;

    // Create the mailbox mesh
    this.createMesh();

    // Position on planet surface
    this.updatePosition();
  }

  /**
   * Create the 3D mailbox mesh with cel-shading
   */
  createMesh() {
    const characterGroup = new THREE.Group();

    // Materials
    const bodyMaterial = createToonMaterial({ color: MAILBOX_COLORS.body });
    const postMaterial = createToonMaterial({ color: MAILBOX_COLORS.post });
    const flagMaterial = createToonMaterial({ color: MAILBOX_COLORS.flag });
    const doorMaterial = createToonMaterial({ color: MAILBOX_COLORS.door });

    // POST (wooden support)
    const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8);
    const post = new THREE.Mesh(postGeo, postMaterial);
    post.position.y = 0.6;
    post.castShadow = true;
    post.receiveShadow = true;
    characterGroup.add(post);

    const postOutline = createOutlineMesh(post, 0.01);
    postOutline.position.copy(post.position);
    characterGroup.add(postOutline);

    // MAILBOX BODY (rounded box shape)
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.35, 0.3);
    const body = new THREE.Mesh(bodyGeo, bodyMaterial);
    body.position.y = 1.35;
    body.castShadow = true;
    body.receiveShadow = true;
    characterGroup.add(body);

    const bodyOutline = createOutlineMesh(body, 0.012);
    bodyOutline.position.copy(body.position);
    characterGroup.add(bodyOutline);

    // MAILBOX TOP (curved)
    const topGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8, 1, false, 0, Math.PI);
    const top = new THREE.Mesh(topGeo, bodyMaterial);
    top.position.set(0, 1.52, 0);
    top.rotation.z = Math.PI / 2;
    top.castShadow = true;
    characterGroup.add(top);

    // MAILBOX DOOR (front panel)
    const doorGeo = new THREE.BoxGeometry(0.4, 0.25, 0.02);
    const door = new THREE.Mesh(doorGeo, doorMaterial);
    door.position.set(0, 1.3, 0.16);
    characterGroup.add(door);

    // Door slot (mail opening)
    const slotGeo = new THREE.BoxGeometry(0.25, 0.03, 0.03);
    const slotMaterial = new THREE.MeshBasicMaterial({ color: 0x1A1A2E });
    const slot = new THREE.Mesh(slotGeo, slotMaterial);
    slot.position.set(0, 1.38, 0.16);
    characterGroup.add(slot);

    // FLAG (indicator for new mail)
    const flagGroup = new THREE.Group();
    flagGroup.position.set(0.28, 1.45, 0);

    // Flag pole
    const flagPoleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
    const flagPole = new THREE.Mesh(flagPoleGeo, flagMaterial);
    flagPole.position.y = 0.1;
    flagGroup.add(flagPole);

    // Flag panel
    const flagPanelGeo = new THREE.BoxGeometry(0.15, 0.1, 0.02);
    const flagPanel = new THREE.Mesh(flagPanelGeo, flagMaterial);
    flagPanel.position.set(0.08, 0.2, 0);
    flagGroup.add(flagPanel);

    const flagOutline = createOutlineMesh(flagPanel, 0.008);
    flagOutline.position.copy(flagPanel.position);
    flagGroup.add(flagOutline);

    this.flag = flagGroup;
    characterGroup.add(flagGroup);

    // FLAG GLOW (visible when mail available)
    const glowMaterial = createGlowMaterial({
      color: MAILBOX_COLORS.flagGlow,
      intensity: 0.8,
    });
    const glowGeo = new THREE.BoxGeometry(0.2, 0.15, 0.08);
    const flagGlow = new THREE.Mesh(glowGeo, glowMaterial);
    flagGlow.position.set(0.36, 1.65, 0);
    flagGlow.visible = false;
    this.flagGlow = flagGlow;
    characterGroup.add(flagGlow);

    // GLOW PARTICLES (point light effect when mail available)
    this.glowParticles = this.createGlowParticles();
    this.glowParticles.visible = false;
    characterGroup.add(this.glowParticles);

    // SHADOW
    const shadowGeo = new THREE.CircleGeometry(0.35, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: MESSENGER_PALETTE.SHADOW_TINT,
      transparent: true,
      opacity: 0.25,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    characterGroup.add(shadow);

    this.container.add(characterGroup);
  }

  /**
   * Create glowing particles around the mailbox
   */
  createGlowParticles() {
    const particleGroup = new THREE.Group();
    const particleCount = 8;
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: MAILBOX_COLORS.flagGlow,
      transparent: true,
      opacity: 0.6,
    });

    for (let i = 0; i < particleCount; i++) {
      const particleGeo = new THREE.SphereGeometry(0.02, 6, 6);
      const particle = new THREE.Mesh(particleGeo, particleMaterial.clone());

      // Arrange in a circle around the flag
      const angle = (i / particleCount) * Math.PI * 2;
      particle.position.set(
        0.36 + Math.cos(angle) * 0.12,
        1.65 + Math.sin(angle) * 0.1,
        Math.sin(angle) * 0.05
      );
      particle.userData = { angle, offset: Math.random() * Math.PI * 2 };
      particleGroup.add(particle);
    }

    return particleGroup;
  }

  /**
   * Update mailbox position on planet surface
   */
  updatePosition() {
    // Position above surface
    const surfacePos = this.planet.projectToSurfaceWithHeight(this.position, 0);
    this.container.position.copy(surfacePos);

    // Orient to match planet surface
    const orientation = this.planet.getSurfaceOrientation(this.position, 0);
    this.container.quaternion.copy(orientation);
  }

  /**
   * Generate a random mail item
   * @returns {Object} Mail item with id, from, to, priority
   */
  generateMail() {
    // Get random NPC as recipient
    const npcNames = NPC_DEFINITIONS.map(npc => {
      const appearance = getAppearance(npc.appearance);
      return {
        id: npc.id,
        name: appearance.name || 'Villager',
      };
    });

    const recipient = npcNames[Math.floor(Math.random() * npcNames.length)];
    const origin = MAIL_ORIGINS[Math.floor(Math.random() * MAIL_ORIGINS.length)];

    // Random priority
    const priorityKeys = Object.keys(MAIL_PRIORITIES);
    const priorityWeights = [0.6, 0.3, 0.1]; // normal, express, urgent
    let random = Math.random();
    let priority = priorityKeys[0];
    let cumulative = 0;
    for (let i = 0; i < priorityKeys.length; i++) {
      cumulative += priorityWeights[i];
      if (random < cumulative) {
        priority = priorityKeys[i];
        break;
      }
    }

    return {
      id: `mail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from: origin,
      to: recipient.id,
      toName: recipient.name,
      priority: priority,
      reward: MAIL_PRIORITIES[priority].reward,
      mailboxId: this.id,
    };
  }

  /**
   * Spawn new mail in this mailbox
   */
  spawnMail() {
    if (this.hasNewMail) return; // Already has mail

    this.currentMail = this.generateMail();
    this.hasNewMail = true;

    // Show visual indicators
    this.flagGlow.visible = true;
    this.glowParticles.visible = true;

    // Animate flag up
    this.flagAngle = 0;
  }

  /**
   * Collect mail from this mailbox
   * @returns {Object|null} The mail item or null if no mail
   */
  collectMail() {
    if (!this.hasNewMail || !this.currentMail) {
      return null;
    }

    const mail = this.currentMail;
    this.currentMail = null;
    this.hasNewMail = false;

    // Hide visual indicators
    this.flagGlow.visible = false;
    this.glowParticles.visible = false;

    // Reset flag position
    this.flagAngle = 0;

    return mail;
  }

  /**
   * Check if position is within interaction range
   * @param {THREE.Vector3} position
   * @returns {boolean}
   */
  isInRange(position) {
    return position.distanceTo(this.position) < this.interactionRadius;
  }

  /**
   * Set light direction for cel-shading
   * @param {THREE.Vector3} direction
   */
  setLightDirection(direction) {
    this.lightDirection.copy(direction).normalize();
  }

  /**
   * Update mailbox animation
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.time += deltaTime;

    if (this.hasNewMail) {
      // Animate flag (pointing up when mail is available)
      const targetAngle = Math.PI / 2;
      this.flagAngle += (targetAngle - this.flagAngle) * 3 * deltaTime;
      if (this.flag) {
        this.flag.rotation.z = this.flagAngle;
      }

      // Pulsing glow effect
      this.glowIntensity = 0.6 + Math.sin(this.time * 3) * 0.3;
      if (this.flagGlow && this.flagGlow.material) {
        this.flagGlow.material.opacity = this.glowIntensity;
      }

      // Animate particles
      if (this.glowParticles) {
        this.glowParticles.children.forEach((particle, i) => {
          const offset = particle.userData.offset || 0;
          const baseAngle = particle.userData.angle || 0;

          // Orbit animation
          const orbitRadius = 0.12 + Math.sin(this.time * 2 + offset) * 0.03;
          const verticalOffset = Math.sin(this.time * 3 + offset) * 0.05;

          particle.position.x = 0.36 + Math.cos(baseAngle + this.time * 0.5) * orbitRadius;
          particle.position.y = 1.65 + verticalOffset;
          particle.position.z = Math.sin(baseAngle + this.time * 0.5) * 0.05;

          // Pulsing opacity
          if (particle.material) {
            particle.material.opacity = 0.4 + Math.sin(this.time * 4 + offset) * 0.3;
          }
        });
      }
    } else {
      // Flag down when no mail
      this.flagAngle *= 0.95;
      if (this.flag) {
        this.flag.rotation.z = this.flagAngle;
      }
    }
  }

  /**
   * Get mailbox position
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.position.clone();
  }

  /**
   * Dispose of mailbox resources
   */
  dispose() {
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
