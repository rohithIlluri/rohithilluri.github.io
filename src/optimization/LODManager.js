/**
 * LODManager.js - Distance-Based Level of Detail System
 * Implements 4-tier LOD for optimized rendering
 * High (0-15 units), Medium (15-40), Low (40-80), Culled (80+)
 */

import * as THREE from 'three';

// LOD distance thresholds from spec
const LOD_DISTANCES = {
  high: 15,     // 0-15 units: Full geometry, all textures
  medium: 40,   // 15-40 units: Reduced poly, combined textures
  low: 80,      // 40-80 units: Billboard/impostor
  culled: 80,   // 80+ units: Not rendered
};

// LOD levels
const LOD_LEVELS = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
  CULLED: 3,
};

/**
 * LOD Object wrapper
 * Manages multiple representations of a single object
 */
export class LODObject {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.levels = [];
    this.currentLevel = LOD_LEVELS.HIGH;
    this.position = options.position || new THREE.Vector3();

    // Store reference to the base mesh for billboards
    this.baseMesh = options.baseMesh || null;

    // Billboard for low LOD
    this.billboard = null;
    this.billboardTexture = null;

    this.group.position.copy(this.position);
  }

  /**
   * Add a mesh for a specific LOD level
   * @param {number} level LOD level (0=high, 1=medium, 2=low)
   * @param {THREE.Object3D} mesh The mesh to use at this level
   */
  addLevel(level, mesh) {
    this.levels[level] = mesh;
    mesh.visible = level === 0; // Only show high by default
    this.group.add(mesh);
  }

  /**
   * Create a billboard representation from a rendered image
   * @param {THREE.WebGLRenderer} renderer The renderer
   * @param {THREE.Camera} camera The camera to render from
   */
  createBillboard(renderer, camera) {
    if (!this.baseMesh) return;

    // Create a render target for the billboard
    const size = 128;
    const renderTarget = new THREE.WebGLRenderTarget(size, size, {
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });

    // Set up a temporary scene
    const tempScene = new THREE.Scene();
    const tempMesh = this.baseMesh.clone();
    tempScene.add(tempMesh);

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    tempScene.add(light);
    tempScene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Position camera to capture the object
    const box = new THREE.Box3().setFromObject(tempMesh);
    const center = box.getCenter(new THREE.Vector3());
    const size3d = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size3d.x, size3d.y, size3d.z);

    const tempCamera = new THREE.OrthographicCamera(
      -maxDim, maxDim, maxDim, -maxDim, 0.1, 1000
    );
    tempCamera.position.set(center.x, center.y, center.z + maxDim * 2);
    tempCamera.lookAt(center);

    // Render to texture
    renderer.setRenderTarget(renderTarget);
    renderer.render(tempScene, tempCamera);
    renderer.setRenderTarget(null);

    this.billboardTexture = renderTarget.texture;

    // Create billboard sprite
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.billboardTexture,
      transparent: true,
    });
    this.billboard = new THREE.Sprite(spriteMaterial);
    this.billboard.scale.set(maxDim * 2, size3d.y * 2, 1);
    this.billboard.visible = false;

    this.levels[LOD_LEVELS.LOW] = this.billboard;
    this.group.add(this.billboard);
  }

  /**
   * Update LOD based on distance to camera
   * @param {THREE.Vector3} cameraPosition Camera position
   */
  updateLOD(cameraPosition) {
    const distance = this.group.position.distanceTo(cameraPosition);
    let newLevel;

    if (distance < LOD_DISTANCES.high) {
      newLevel = LOD_LEVELS.HIGH;
    } else if (distance < LOD_DISTANCES.medium) {
      newLevel = LOD_LEVELS.MEDIUM;
    } else if (distance < LOD_DISTANCES.low) {
      newLevel = LOD_LEVELS.LOW;
    } else {
      newLevel = LOD_LEVELS.CULLED;
    }

    if (newLevel !== this.currentLevel) {
      this.setLevel(newLevel);
    }
  }

  /**
   * Set the current LOD level
   * @param {number} level The LOD level to show
   */
  setLevel(level) {
    // Hide current level
    if (this.levels[this.currentLevel]) {
      this.levels[this.currentLevel].visible = false;
    }

    this.currentLevel = level;

    // Show new level (if not culled)
    if (level !== LOD_LEVELS.CULLED && this.levels[level]) {
      this.levels[level].visible = true;
    }

    // For billboard, make it face camera
    if (level === LOD_LEVELS.LOW && this.billboard) {
      // Sprites auto-face camera
    }
  }

  getObject() {
    return this.group;
  }

  dispose() {
    this.levels.forEach((mesh) => {
      if (mesh) {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      }
    });

    if (this.billboardTexture) {
      this.billboardTexture.dispose();
    }
  }
}

/**
 * LOD Manager
 * Manages multiple LOD objects and updates them efficiently
 */
export class LODManager {
  constructor(camera) {
    this.camera = camera;
    this.objects = [];
    this.updateInterval = 0.1; // Update every 100ms
    this.updateTimer = 0;

    // Spatial hash for efficient distance checking
    this.spatialHash = new Map();
    this.cellSize = LOD_DISTANCES.medium; // Cell size based on medium LOD distance
  }

  /**
   * Add an object to LOD management
   * @param {LODObject} lodObject The LOD object to manage
   */
  add(lodObject) {
    this.objects.push(lodObject);
    this.addToSpatialHash(lodObject);
  }

  /**
   * Add object to spatial hash
   */
  addToSpatialHash(lodObject) {
    const pos = lodObject.group.position;
    const cellX = Math.floor(pos.x / this.cellSize);
    const cellZ = Math.floor(pos.z / this.cellSize);
    const key = `${cellX},${cellZ}`;

    if (!this.spatialHash.has(key)) {
      this.spatialHash.set(key, []);
    }
    this.spatialHash.get(key).push(lodObject);
  }

  /**
   * Remove an object from LOD management
   * @param {LODObject} lodObject The LOD object to remove
   */
  remove(lodObject) {
    const index = this.objects.indexOf(lodObject);
    if (index !== -1) {
      this.objects.splice(index, 1);
    }
    // Note: Would also need to remove from spatial hash
  }

  /**
   * Create LOD versions of an existing mesh
   * @param {THREE.Mesh} mesh The original mesh
   * @param {THREE.Scene} scene The scene to add to
   * @returns {LODObject} The LOD object
   */
  createLOD(mesh, scene) {
    const lodObject = new LODObject({
      position: mesh.position.clone(),
      baseMesh: mesh,
    });

    // High LOD: Original mesh
    lodObject.addLevel(LOD_LEVELS.HIGH, mesh);

    // Medium LOD: Simplified mesh (for now, use same mesh)
    // In production, would use geometry simplification
    const mediumMesh = mesh.clone();
    lodObject.addLevel(LOD_LEVELS.MEDIUM, mediumMesh);

    // Low LOD: Would be billboard (created later with createBillboard)

    scene.add(lodObject.getObject());
    this.add(lodObject);

    return lodObject;
  }

  /**
   * Create simplified geometry for medium LOD
   * @param {THREE.BufferGeometry} geometry Original geometry
   * @param {number} targetRatio Target reduction ratio (0-1)
   * @returns {THREE.BufferGeometry} Simplified geometry
   */
  simplifyGeometry(geometry, targetRatio = 0.5) {
    // Basic vertex decimation
    // In production, would use a proper mesh simplification library

    const positions = geometry.getAttribute('position');
    const newPositions = [];

    // Simple skip-based reduction
    const skip = Math.max(1, Math.floor(1 / targetRatio));

    for (let i = 0; i < positions.count; i += skip) {
      newPositions.push(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i)
      );
    }

    const newGeometry = new THREE.BufferGeometry();
    newGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(newPositions, 3)
    );

    return newGeometry;
  }

  /**
   * Update LOD levels for all objects
   * @param {number} deltaTime Time since last frame
   */
  update(deltaTime) {
    this.updateTimer += deltaTime;

    if (this.updateTimer < this.updateInterval) {
      return;
    }
    this.updateTimer = 0;

    const cameraPosition = this.camera.position;

    // Get relevant cells based on camera position
    const cellX = Math.floor(cameraPosition.x / this.cellSize);
    const cellZ = Math.floor(cameraPosition.z / this.cellSize);

    // Check nearby cells (3x3 grid around camera)
    const nearbyObjects = new Set();

    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const key = `${cellX + dx},${cellZ + dz}`;
        const objects = this.spatialHash.get(key);
        if (objects) {
          objects.forEach((obj) => nearbyObjects.add(obj));
        }
      }
    }

    // Update LOD for nearby objects
    nearbyObjects.forEach((lodObject) => {
      lodObject.updateLOD(cameraPosition);
    });

    // Cull distant objects (not in nearby cells)
    this.objects.forEach((lodObject) => {
      if (!nearbyObjects.has(lodObject)) {
        lodObject.setLevel(LOD_LEVELS.CULLED);
      }
    });
  }

  /**
   * Force update all LOD levels immediately
   */
  forceUpdate() {
    const cameraPosition = this.camera.position;
    this.objects.forEach((lodObject) => {
      lodObject.updateLOD(cameraPosition);
    });
  }

  /**
   * Set custom LOD distances
   * @param {Object} distances { high, medium, low }
   */
  setDistances(distances) {
    if (distances.high !== undefined) LOD_DISTANCES.high = distances.high;
    if (distances.medium !== undefined) LOD_DISTANCES.medium = distances.medium;
    if (distances.low !== undefined) LOD_DISTANCES.low = distances.low;
    if (distances.culled !== undefined) LOD_DISTANCES.culled = distances.culled;
  }

  /**
   * Get statistics about current LOD state
   * @returns {Object} LOD statistics
   */
  getStats() {
    const stats = {
      total: this.objects.length,
      high: 0,
      medium: 0,
      low: 0,
      culled: 0,
    };

    this.objects.forEach((lodObject) => {
      switch (lodObject.currentLevel) {
        case LOD_LEVELS.HIGH:
          stats.high++;
          break;
        case LOD_LEVELS.MEDIUM:
          stats.medium++;
          break;
        case LOD_LEVELS.LOW:
          stats.low++;
          break;
        case LOD_LEVELS.CULLED:
          stats.culled++;
          break;
      }
    });

    return stats;
  }

  dispose() {
    this.objects.forEach((lodObject) => lodObject.dispose());
    this.objects = [];
    this.spatialHash.clear();
  }
}

export { LOD_DISTANCES, LOD_LEVELS };
