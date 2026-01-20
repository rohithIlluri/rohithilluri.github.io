/**
 * LODManager.js - Level of Detail Manager
 * Handles automatic mesh detail switching based on camera distance
 */

import * as THREE from 'three';

export class LODManager {
  constructor(camera) {
    this.camera = camera;
    this.lodObjects = [];
    this.updateInterval = 0.1; // Update every 100ms
    this.timeSinceUpdate = 0;

    // Distance thresholds for LOD levels
    this.thresholds = {
      high: 20,    // Within 20 units: highest detail
      medium: 50,  // Within 50 units: medium detail
      low: 100,    // Within 100 units: low detail
      // Beyond 100 units: lowest detail or culled
    };
  }

  /**
   * Register a LOD object
   * @param {Object} lodConfig - Configuration for the LOD object
   * @param {THREE.Object3D} lodConfig.high - High detail mesh
   * @param {THREE.Object3D} lodConfig.medium - Medium detail mesh (optional)
   * @param {THREE.Object3D} lodConfig.low - Low detail mesh (optional)
   * @param {THREE.Vector3} lodConfig.position - World position for distance calculation
   */
  addLODObject(lodConfig) {
    const lodObj = {
      levels: {
        high: lodConfig.high,
        medium: lodConfig.medium || lodConfig.high,
        low: lodConfig.low || lodConfig.medium || lodConfig.high,
      },
      position: lodConfig.position || new THREE.Vector3(),
      currentLevel: 'high',
    };

    // Initially show high detail
    if (lodObj.levels.high) lodObj.levels.high.visible = true;
    if (lodObj.levels.medium && lodObj.levels.medium !== lodObj.levels.high) {
      lodObj.levels.medium.visible = false;
    }
    if (lodObj.levels.low && lodObj.levels.low !== lodObj.levels.medium) {
      lodObj.levels.low.visible = false;
    }

    this.lodObjects.push(lodObj);
    return lodObj;
  }

  /**
   * Remove a LOD object from management
   * @param {Object} lodObj - The LOD object to remove
   */
  removeLODObject(lodObj) {
    const index = this.lodObjects.indexOf(lodObj);
    if (index > -1) {
      this.lodObjects.splice(index, 1);
    }
  }

  /**
   * Update all LOD objects based on camera distance
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    this.timeSinceUpdate += deltaTime;

    // Throttle updates for performance
    if (this.timeSinceUpdate < this.updateInterval) return;
    this.timeSinceUpdate = 0;

    const cameraPosition = this.camera.position;

    for (const lodObj of this.lodObjects) {
      const distance = cameraPosition.distanceTo(lodObj.position);
      let targetLevel = 'low';

      if (distance < this.thresholds.high) {
        targetLevel = 'high';
      } else if (distance < this.thresholds.medium) {
        targetLevel = 'medium';
      }

      // Switch level if needed
      if (targetLevel !== lodObj.currentLevel) {
        this.switchLevel(lodObj, targetLevel);
      }
    }
  }

  /**
   * Switch visibility between LOD levels
   * @param {Object} lodObj - The LOD object
   * @param {string} newLevel - The new level to switch to
   */
  switchLevel(lodObj, newLevel) {
    const oldMesh = lodObj.levels[lodObj.currentLevel];
    const newMesh = lodObj.levels[newLevel];

    if (oldMesh && oldMesh !== newMesh) {
      oldMesh.visible = false;
    }
    if (newMesh) {
      newMesh.visible = true;
    }

    lodObj.currentLevel = newLevel;
  }

  /**
   * Set distance thresholds
   * @param {Object} thresholds - New threshold values
   */
  setThresholds(thresholds) {
    Object.assign(this.thresholds, thresholds);
  }

  /**
   * Clean up
   */
  dispose() {
    this.lodObjects = [];
  }
}
