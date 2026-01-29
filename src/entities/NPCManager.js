/**
 * NPCManager.js - Manages all NPCs in the game
 * Spawns, updates, and disposes NPCs
 */

import { NPC } from './NPC.js';
import { NPC_DEFINITIONS } from './NPCData.js';
import { useGameStore } from '../stores/gameStore.js';

export class NPCManager {
  constructor(scene, planet, options = {}) {
    this.scene = scene;
    this.planet = planet;

    // Options
    this.maxNPCs = options.maxNPCs || NPC_DEFINITIONS.length;
    this.enabled = options.enabled !== false;

    // NPCs collection
    this.npcs = [];

    // Light direction (synced with sun)
    this.lightDirection = null;

    // Player position reference
    this.playerPosition = null;

    // Initialize if enabled
    if (this.enabled) {
      this.init();
    }
  }

  /**
   * Initialize NPCs from definitions
   */
  init() {
    // Spawn NPCs from definitions (up to maxNPCs)
    const count = Math.min(this.maxNPCs, NPC_DEFINITIONS.length);

    for (let i = 0; i < count; i++) {
      const definition = NPC_DEFINITIONS[i];
      const npc = new NPC(this.scene, this.planet, definition);

      // Sync light direction if set
      if (this.lightDirection) {
        npc.setLightDirection(this.lightDirection);
      }

      this.npcs.push(npc);
    }

    console.log(`NPCManager: Spawned ${this.npcs.length} NPCs`);
  }

  /**
   * Set the light direction for all NPCs
   */
  setLightDirection(direction) {
    this.lightDirection = direction;
    this.npcs.forEach(npc => npc.setLightDirection(direction));
  }

  /**
   * Set the player position for NPCs to reference
   */
  setPlayerPosition(position) {
    this.playerPosition = position;
    this.npcs.forEach(npc => npc.setPlayerPosition(position));
  }

  /**
   * Update all NPCs
   */
  update(deltaTime) {
    if (!this.enabled) return;

    // Update player position for all NPCs
    if (this.playerPosition) {
      this.npcs.forEach(npc => npc.setPlayerPosition(this.playerPosition));
    }

    // Update each NPC
    this.npcs.forEach(npc => npc.update(deltaTime));

    // Check for nearby NPC and update game store
    this.updateNearbyNPC();
  }

  /**
   * Update nearbyNPC in gameStore based on player proximity
   * Interaction range is 2 units
   */
  updateNearbyNPC() {
    if (!this.playerPosition) return;

    const store = useGameStore.getState();
    const interactionRange = 2.0; // Units for interaction

    // Find the nearest NPC within interaction range
    const nearestNPC = this.getNearestNPC(this.playerPosition, interactionRange);

    // Get current nearbyNPC from store
    const currentNearby = store.nearbyNPC;

    // Only update if changed
    if (nearestNPC !== currentNearby) {
      store.setNearbyNPC(nearestNPC);
    }
  }

  /**
   * Get all NPCs
   */
  getNPCs() {
    return this.npcs;
  }

  /**
   * Get NPC by ID
   */
  getNPCById(id) {
    return this.npcs.find(npc => npc.definition.id === id);
  }

  /**
   * Get nearest NPC to a position
   *
   * Performance note: Uses O(n) iteration which is optimal for small NPC counts (<20).
   * For 100+ NPCs, consider implementing spatial hashing. Current game has 6 NPCs,
   * so O(6) ≈ O(1) and spatial hash overhead would be counterproductive.
   */
  getNearestNPC(position, maxDistance = Infinity) {
    let nearest = null;
    let nearestDistance = maxDistance;

    // Early exit optimization: if we find NPC within half the max distance,
    // and we only need "nearest within range", we can skip remaining checks
    const earlyExitThreshold = maxDistance * 0.5;
    let foundClose = false;

    for (const npc of this.npcs) {
      const distance = position.distanceTo(npc.getPosition());
      if (distance < nearestDistance) {
        nearest = npc;
        nearestDistance = distance;

        // If we found something very close, we likely have the answer
        if (distance < earlyExitThreshold) {
          foundClose = true;
        }
      }

      // Early exit if we found a very close NPC and we're looking within a range
      if (foundClose && maxDistance !== Infinity) {
        break;
      }
    }

    return nearest;
  }

  /**
   * Check if any NPC is within range of position
   */
  hasNPCInRange(position, range) {
    return this.npcs.some(npc => {
      const distance = position.distanceTo(npc.getPosition());
      return distance < range;
    });
  }

  /**
   * Enable/disable NPC manager
   */
  setEnabled(enabled) {
    this.enabled = enabled;

    // Show/hide all NPCs
    this.npcs.forEach(npc => {
      npc.container.visible = enabled;
    });
  }

  /**
   * Set time of day (for any future day/night behavior)
   */
  setTimeOfDay(time) {
    // Could implement different behavior at night
    // For now, NPCs behave the same day and night
  }

  /**
   * Dispose of all NPCs
   */
  dispose() {
    this.npcs.forEach(npc => npc.dispose());
    this.npcs = [];
  }
}
