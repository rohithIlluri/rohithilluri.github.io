/**
 * MailSystem.js - Mail Pickup and Delivery System
 * Manages mailboxes, mail spawning, and delivery mechanics
 */

import * as THREE from 'three';
import { useGameStore } from '../stores/gameStore.js';
import { inventoryManager } from './InventoryManager.js';
import { createToonMaterial, createOutlineMesh } from '../shaders/toon.js';
import questsData from '../data/quests.json';

class MailSystem {
  constructor() {
    this.mailboxes = [];
    this.activeMailItems = new Map(); // Mail ID -> mesh
    this.scene = null;
    this.planet = null;
    this.pickupRadius = 2.5;
    this.glowTime = 0;
  }

  /**
   * Initialize the mail system
   * @param {THREE.Scene} scene
   * @param {Object} planet Planet instance for positioning
   */
  init(scene, planet) {
    this.scene = scene;
    this.planet = planet;
    this.createMailboxes();
    console.log('[MailSystem] Initialized with', this.mailboxes.length, 'mailboxes');
  }

  /**
   * Create mailboxes around the planet
   */
  createMailboxes() {
    // Mailbox locations (lat, lon)
    const locations = [
      { lat: 0.1, lon: 0.0, zone: 'downtown' },       // Downtown - Post Office
      { lat: 0.2, lon: 0.25, zone: 'harbor' },        // Harbor
      { lat: 0.15, lon: 0.5, zone: 'residential' },   // Residential
      { lat: 0.0, lon: 0.75, zone: 'park' },          // Park
      { lat: -0.1, lon: 0.9, zone: 'industrial' },    // Industrial
    ];

    locations.forEach((loc, index) => {
      const mailbox = this.createMailbox(loc.lat, loc.lon, loc.zone, index);
      this.mailboxes.push(mailbox);
    });
  }

  /**
   * Create a single mailbox
   * @param {number} lat
   * @param {number} lon
   * @param {string} zone
   * @param {number} index
   * @returns {Object} Mailbox data
   */
  createMailbox(lat, lon, zone, index) {
    const group = new THREE.Group();

    // Mailbox body - blue USPS style
    const bodyGeo = new THREE.BoxGeometry(0.4, 0.6, 0.3);
    const bodyMat = createToonMaterial({ color: 0x004A9C });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    group.add(body);

    // Mailbox top (rounded)
    const topGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.35, 8, 1, false, 0, Math.PI);
    const top = new THREE.Mesh(topGeo, bodyMat);
    top.rotation.z = Math.PI / 2;
    top.rotation.y = Math.PI / 2;
    top.position.set(0, 0.8, 0);
    group.add(top);

    // Mail slot
    const slotGeo = new THREE.BoxGeometry(0.25, 0.04, 0.05);
    const slotMat = createToonMaterial({ color: 0x2A2A2A });
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.set(0, 0.65, 0.16);
    group.add(slot);

    // Post
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4);
    const postMat = createToonMaterial({ color: 0x5A5A5A });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 0.2;
    group.add(post);

    // Outline
    const outline = createOutlineMesh(body, 0.03);
    outline.position.copy(body.position);
    group.add(outline);

    // Glow indicator (when mail available)
    const glowGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xFFD700,
      transparent: true,
      opacity: 0,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, 1.1, 0);
    group.add(glow);

    // Position on planet
    if (this.planet) {
      const surfacePos = this.planet.latLonToPosition(lat, lon);
      const orientation = this.planet.getSurfaceOrientation(surfacePos);
      group.position.copy(surfacePos);
      group.quaternion.copy(orientation);
    }

    if (this.scene) {
      this.scene.add(group);
    }

    return {
      id: `mailbox_${index}`,
      group,
      body,
      glow,
      glowMat,
      lat,
      lon,
      zone,
      availableMail: [], // Mail items available for pickup
    };
  }

  /**
   * Spawn mail at a mailbox
   * @param {string} mailboxId
   * @param {Object} mailItem Mail data from quests.json
   */
  spawnMail(mailboxId, mailItem) {
    const mailbox = this.mailboxes.find(m => m.id === mailboxId);
    if (!mailbox) return;

    // Add to available mail
    mailbox.availableMail.push(mailItem);

    // Update visual indicator
    this.updateMailboxIndicator(mailbox);
  }

  /**
   * Spawn mail at appropriate mailbox based on quest
   * @param {string} mailId
   */
  spawnMailForQuest(mailId) {
    const mailItem = questsData.mailItems.find(m => m.id === mailId);
    if (!mailItem) {
      console.warn('[MailSystem] Mail item not found:', mailId);
      return;
    }

    // Spawn at first mailbox (Post Office) by default
    const postOffice = this.mailboxes.find(m => m.zone === 'downtown') || this.mailboxes[0];
    if (postOffice) {
      this.spawnMail(postOffice.id, mailItem);
    }
  }

  /**
   * Update mailbox visual indicator
   * @param {Object} mailbox
   */
  updateMailboxIndicator(mailbox) {
    const hasMail = mailbox.availableMail.length > 0;
    mailbox.glowMat.opacity = hasMail ? 0.8 : 0;
  }

  /**
   * Check if player can pick up mail from nearby mailbox
   * @param {THREE.Vector3} playerPosition
   * @returns {Object|null} Available mailbox or null
   */
  checkPickup(playerPosition) {
    for (const mailbox of this.mailboxes) {
      const distance = playerPosition.distanceTo(mailbox.group.position);
      if (distance < this.pickupRadius && mailbox.availableMail.length > 0) {
        return mailbox;
      }
    }
    return null;
  }

  /**
   * Pick up mail from mailbox
   * @param {Object} mailbox
   * @returns {boolean} Success
   */
  pickupMail(mailbox) {
    if (mailbox.availableMail.length === 0) return false;

    // Pick up first available mail
    const mailItem = mailbox.availableMail.shift();

    if (inventoryManager.collectMail(mailItem)) {
      this.updateMailboxIndicator(mailbox);
      return true;
    } else {
      // Put mail back if inventory full
      mailbox.availableMail.unshift(mailItem);
      return false;
    }
  }

  /**
   * Check if player can deliver mail to nearby NPC
   * @param {THREE.Vector3} playerPosition
   * @param {Array} npcs Array of NPCs in scene
   * @returns {Object|null} { npc, mail } or null
   */
  checkDelivery(playerPosition, npcs) {
    for (const npc of npcs) {
      if (!npc.mesh) continue;

      const distance = playerPosition.distanceTo(npc.mesh.position);
      if (distance < this.pickupRadius) {
        // Check if we have mail for this NPC
        const mail = inventoryManager.getMailFor(npc.id);
        if (mail) {
          return { npc, mail };
        }
      }
    }
    return null;
  }

  /**
   * Get nearest mailbox with mail
   * @param {THREE.Vector3} playerPosition
   * @returns {Object|null}
   */
  getNearestMailbox(playerPosition) {
    let nearest = null;
    let nearestDist = Infinity;

    for (const mailbox of this.mailboxes) {
      if (mailbox.availableMail.length === 0) continue;

      const dist = playerPosition.distanceTo(mailbox.group.position);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = mailbox;
      }
    }

    return nearest;
  }

  /**
   * Update mail system (animations)
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.glowTime += deltaTime;

    // Animate glow indicators
    for (const mailbox of this.mailboxes) {
      if (mailbox.availableMail.length > 0) {
        // Pulsing glow
        const pulse = 0.5 + Math.sin(this.glowTime * 3) * 0.3;
        mailbox.glowMat.opacity = pulse;

        // Bobbing motion
        mailbox.glow.position.y = 1.1 + Math.sin(this.glowTime * 2) * 0.05;
      }
    }
  }

  /**
   * Get interaction prompt for UI
   * @param {THREE.Vector3} playerPosition
   * @param {Array} npcs
   * @returns {Object|null} { type, message, target }
   */
  getInteractionPrompt(playerPosition, npcs) {
    // Check for pickup
    const mailbox = this.checkPickup(playerPosition);
    if (mailbox) {
      return {
        type: 'pickup',
        message: `E: Pick up mail (${mailbox.availableMail.length})`,
        target: mailbox,
      };
    }

    // Check for delivery
    const delivery = this.checkDelivery(playerPosition, npcs);
    if (delivery) {
      return {
        type: 'deliver',
        message: `E: Deliver to ${delivery.npc.name}`,
        target: delivery,
      };
    }

    return null;
  }

  /**
   * Handle interaction
   * @param {THREE.Vector3} playerPosition
   * @param {Array} npcs
   * @returns {boolean} Success
   */
  handleInteraction(playerPosition, npcs) {
    // Try pickup first
    const mailbox = this.checkPickup(playerPosition);
    if (mailbox) {
      return this.pickupMail(mailbox);
    }

    // Try delivery
    const delivery = this.checkDelivery(playerPosition, npcs);
    if (delivery) {
      return inventoryManager.deliverMail(delivery.mail.id, delivery.npc.id);
    }

    return false;
  }

  /**
   * Dispose of mail system
   */
  dispose() {
    for (const mailbox of this.mailboxes) {
      if (mailbox.group.parent) {
        mailbox.group.parent.remove(mailbox.group);
      }
      mailbox.group.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }
    this.mailboxes = [];
    this.activeMailItems.clear();
    console.log('[MailSystem] Disposed');
  }
}

// Singleton instance
export const mailSystem = new MailSystem();
export default MailSystem;
