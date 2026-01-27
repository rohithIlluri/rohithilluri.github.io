/**
 * MailboxManager.js - Manages all mailboxes in the game
 * Spawns mailboxes around the planet, tracks mail status, handles respawning
 */

import { Mailbox } from './Mailbox.js';
import { useGameStore } from '../stores/gameStore.js';

// Fixed mailbox locations on the planet (lat/lon coordinates)
const MAILBOX_LOCATIONS = [
  { id: 'mailbox-towncenter', lat: 5, lon: 10, name: 'Town Center Mailbox' },
  { id: 'mailbox-north', lat: 35, lon: 5, name: 'North Path Mailbox' },
  { id: 'mailbox-south', lat: -25, lon: -10, name: 'South Path Mailbox' },
  { id: 'mailbox-east', lat: 10, lon: 40, name: 'East Side Mailbox' },
  { id: 'mailbox-west', lat: 5, lon: -35, name: 'West Side Mailbox' },
  { id: 'mailbox-harbor', lat: -40, lon: 15, name: 'Harbor Mailbox' },
];

// Mail respawn timing
const RESPAWN_DELAY_MIN = 10000; // 10 seconds
const RESPAWN_DELAY_MAX = 30000; // 30 seconds

export class MailboxManager {
  constructor(scene, planet, options = {}) {
    this.scene = scene;
    this.planet = planet;

    // Options
    this.enabled = options.enabled !== false;
    this.maxMailboxes = options.maxMailboxes || MAILBOX_LOCATIONS.length;

    // Mailboxes collection
    this.mailboxes = [];

    // Respawn timers
    this.respawnTimers = new Map();

    // Player position reference
    this.playerPosition = null;

    // Currently nearby mailbox
    this.nearbyMailbox = null;

    // Light direction
    this.lightDirection = null;

    // Initialize if enabled
    if (this.enabled) {
      this.init();
    }
  }

  /**
   * Initialize mailboxes at fixed locations
   */
  init() {
    const count = Math.min(this.maxMailboxes, MAILBOX_LOCATIONS.length);

    for (let i = 0; i < count; i++) {
      const location = MAILBOX_LOCATIONS[i];
      const mailbox = new Mailbox(this.scene, this.planet, {
        id: location.id,
        lat: location.lat,
        lon: location.lon,
        interactionRadius: 3.0,
      });

      // Store location name
      mailbox.locationName = location.name;

      // Sync light direction if set
      if (this.lightDirection) {
        mailbox.setLightDirection(this.lightDirection);
      }

      this.mailboxes.push(mailbox);

      // Spawn initial mail in some mailboxes (50% chance)
      if (Math.random() < 0.5) {
        mailbox.spawnMail();
      } else {
        // Schedule respawn for empty mailboxes
        this.scheduleRespawn(mailbox);
      }
    }

    console.log(`[MailboxManager] Spawned ${this.mailboxes.length} mailboxes`);
  }

  /**
   * Schedule mail respawn for a mailbox
   * @param {Mailbox} mailbox
   */
  scheduleRespawn(mailbox) {
    // Clear existing timer if any
    if (this.respawnTimers.has(mailbox.id)) {
      clearTimeout(this.respawnTimers.get(mailbox.id));
    }

    // Random delay between min and max
    const delay = RESPAWN_DELAY_MIN + Math.random() * (RESPAWN_DELAY_MAX - RESPAWN_DELAY_MIN);

    const timer = setTimeout(() => {
      if (!mailbox.hasNewMail) {
        mailbox.spawnMail();
        console.log(`[MailboxManager] Mail respawned at ${mailbox.locationName}`);
      }
      this.respawnTimers.delete(mailbox.id);
    }, delay);

    this.respawnTimers.set(mailbox.id, timer);
  }

  /**
   * Set the light direction for all mailboxes
   * @param {THREE.Vector3} direction
   */
  setLightDirection(direction) {
    this.lightDirection = direction;
    this.mailboxes.forEach(mailbox => mailbox.setLightDirection(direction));
  }

  /**
   * Set the player position for proximity checks
   * @param {THREE.Vector3} position
   */
  setPlayerPosition(position) {
    this.playerPosition = position;
  }

  /**
   * Update all mailboxes
   * @param {number} deltaTime
   */
  update(deltaTime) {
    if (!this.enabled) return;

    // Update each mailbox
    this.mailboxes.forEach(mailbox => mailbox.update(deltaTime));

    // Check player proximity
    this.checkPlayerProximity();
  }

  /**
   * Check if player is near any mailbox
   */
  checkPlayerProximity() {
    if (!this.playerPosition) return;

    let closestMailbox = null;
    let closestDistance = Infinity;

    for (const mailbox of this.mailboxes) {
      const distance = this.playerPosition.distanceTo(mailbox.getPosition());

      if (distance < mailbox.interactionRadius && distance < closestDistance) {
        closestMailbox = mailbox;
        closestDistance = distance;
      }
    }

    // Update nearby mailbox
    if (closestMailbox !== this.nearbyMailbox) {
      this.nearbyMailbox = closestMailbox;

      // Update store
      useGameStore.getState().setNearbyMailbox(closestMailbox);
    }
  }

  /**
   * Collect mail from nearby mailbox
   * @returns {Object|null} Mail item or null
   */
  collectMailFromNearby() {
    if (!this.nearbyMailbox || !this.nearbyMailbox.hasNewMail) {
      return null;
    }

    const mail = this.nearbyMailbox.collectMail();

    if (mail) {
      // Schedule respawn
      this.scheduleRespawn(this.nearbyMailbox);
      console.log(`[MailboxManager] Mail collected from ${this.nearbyMailbox.locationName}`);
    }

    return mail;
  }

  /**
   * Get all mailboxes with mail
   * @returns {Array<Mailbox>}
   */
  getMailboxesWithMail() {
    return this.mailboxes.filter(mailbox => mailbox.hasNewMail);
  }

  /**
   * Get total count of available mail
   * @returns {number}
   */
  getAvailableMailCount() {
    return this.mailboxes.filter(mailbox => mailbox.hasNewMail).length;
  }

  /**
   * Get mailbox by ID
   * @param {string} id
   * @returns {Mailbox|undefined}
   */
  getMailboxById(id) {
    return this.mailboxes.find(mailbox => mailbox.id === id);
  }

  /**
   * Get nearest mailbox with mail
   * @param {THREE.Vector3} position
   * @returns {Mailbox|null}
   */
  getNearestMailboxWithMail(position) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (const mailbox of this.mailboxes) {
      if (!mailbox.hasNewMail) continue;

      const distance = position.distanceTo(mailbox.getPosition());
      if (distance < nearestDistance) {
        nearest = mailbox;
        nearestDistance = distance;
      }
    }

    return nearest;
  }

  /**
   * Force respawn mail at a specific mailbox (for testing)
   * @param {string} mailboxId
   */
  forceRespawn(mailboxId) {
    const mailbox = this.getMailboxById(mailboxId);
    if (mailbox && !mailbox.hasNewMail) {
      mailbox.spawnMail();
    }
  }

  /**
   * Enable/disable manager
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;

    // Show/hide all mailboxes
    this.mailboxes.forEach(mailbox => {
      mailbox.container.visible = enabled;
    });
  }

  /**
   * Dispose of all mailboxes
   */
  dispose() {
    // Clear all respawn timers
    this.respawnTimers.forEach(timer => clearTimeout(timer));
    this.respawnTimers.clear();

    // Dispose all mailboxes
    this.mailboxes.forEach(mailbox => mailbox.dispose());
    this.mailboxes = [];

    console.log('[MailboxManager] Disposed');
  }
}
