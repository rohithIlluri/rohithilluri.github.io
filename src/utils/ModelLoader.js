/**
 * ModelLoader.js - Centralized 3D model loading with caching
 * Handles GLB/GLTF model loading using Three.js GLTFLoader with DRACOLoader
 * for compressed models and provides caching for reuse.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Singleton instance
let instance = null;

// Cache for loaded models
const modelCache = new Map();

// Loading promises for deduplication
const loadingPromises = new Map();

/**
 * ModelLoader - Singleton class for loading and caching 3D models
 */
export class ModelLoader {
  constructor() {
    if (instance) {
      return instance;
    }

    // Initialize GLTF loader
    this.gltfLoader = new GLTFLoader();

    // Initialize DRACO loader for compressed models
    this.dracoLoader = new DRACOLoader();
    // Use CDN for Draco decoder (avoids bundling large wasm files)
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for compatibility
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Base path for models
    this.basePath = '/assets/models/';

    instance = this;
  }

  /**
   * Set the base path for model loading
   * @param {string} path - Base path (e.g., '/assets/models/')
   */
  setBasePath(path) {
    this.basePath = path.endsWith('/') ? path : path + '/';
  }

  /**
   * Load a model from the given path
   * Returns cached model if already loaded, otherwise loads and caches
   * @param {string} path - Relative path to the model (e.g., 'characters/player.glb')
   * @param {Object} options - Loading options
   * @param {boolean} options.clone - If true, returns a clone of the cached model
   * @param {Function} options.onProgress - Progress callback
   * @returns {Promise<THREE.Group>} The loaded model
   */
  async load(path, options = {}) {
    const { clone = true, onProgress } = options;
    const fullPath = this.basePath + path;
    const cacheKey = fullPath;

    // Return cached model (cloned if requested)
    if (modelCache.has(cacheKey)) {
      const cached = modelCache.get(cacheKey);
      return clone ? this.cloneModel(cached) : cached;
    }

    // If already loading, wait for that promise
    if (loadingPromises.has(cacheKey)) {
      const model = await loadingPromises.get(cacheKey);
      return clone ? this.cloneModel(model) : model;
    }

    // Start loading
    const loadPromise = new Promise((resolve, reject) => {
      this.gltfLoader.load(
        fullPath,
        (gltf) => {
          const model = gltf.scene;

          // Store animations if present
          if (gltf.animations && gltf.animations.length > 0) {
            model.userData.animations = gltf.animations;
          }

          // Enable shadows on all meshes
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          // Cache the model
          modelCache.set(cacheKey, model);
          loadingPromises.delete(cacheKey);

          resolve(clone ? this.cloneModel(model) : model);
        },
        onProgress,
        (error) => {
          loadingPromises.delete(cacheKey);
          reject(new Error(`Failed to load model: ${fullPath} - ${error.message}`));
        }
      );
    });

    loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  /**
   * Load a model with a fallback if the primary model doesn't exist
   * @param {string} primaryPath - Primary model path
   * @param {Function} fallbackFn - Function that returns a THREE.Group as fallback
   * @param {Object} options - Loading options
   * @returns {Promise<{model: THREE.Group, isLoaded: boolean}>}
   */
  async loadWithFallback(primaryPath, fallbackFn, options = {}) {
    try {
      const model = await this.load(primaryPath, options);
      return { model, isLoaded: true };
    } catch (error) {
      console.log(`Model not found: ${primaryPath}, using fallback`);
      return { model: fallbackFn(), isLoaded: false };
    }
  }

  /**
   * Clone a model for reuse
   * Properly clones the model including materials and geometries
   * @param {THREE.Group} original - The original model to clone
   * @returns {THREE.Group} Cloned model
   */
  cloneModel(original) {
    const clone = original.clone();

    // Deep clone materials to allow independent modifications
    clone.traverse((child) => {
      if (child.isMesh) {
        // Clone material(s)
        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => m.clone());
        } else if (child.material) {
          child.material = child.material.clone();
        }
      }
    });

    // Copy animations reference
    if (original.userData.animations) {
      clone.userData.animations = original.userData.animations;
    }

    return clone;
  }

  /**
   * Preload multiple models
   * @param {string[]} paths - Array of model paths to preload
   * @param {Function} onProgress - Overall progress callback (loaded, total)
   * @returns {Promise<void>}
   */
  async preload(paths, onProgress) {
    let loaded = 0;
    const total = paths.length;

    const promises = paths.map(async (path) => {
      try {
        await this.load(path, { clone: false });
      } catch (error) {
        console.warn(`Preload failed for ${path}:`, error.message);
      }
      loaded++;
      if (onProgress) {
        onProgress(loaded, total);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Check if a model is cached
   * @param {string} path - Model path
   * @returns {boolean}
   */
  isCached(path) {
    return modelCache.has(this.basePath + path);
  }

  /**
   * Clear the model cache
   * @param {string} path - Optional specific path to clear, clears all if not provided
   */
  clearCache(path) {
    if (path) {
      const fullPath = this.basePath + path;
      if (modelCache.has(fullPath)) {
        const model = modelCache.get(fullPath);
        this.disposeModel(model);
        modelCache.delete(fullPath);
      }
    } else {
      modelCache.forEach((model) => {
        this.disposeModel(model);
      });
      modelCache.clear();
    }
  }

  /**
   * Dispose of a model's resources
   * @param {THREE.Group} model - Model to dispose
   */
  disposeModel(model) {
    model.traverse((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    });
  }

  /**
   * Get cache statistics
   * @returns {{count: number, keys: string[]}}
   */
  getCacheStats() {
    return {
      count: modelCache.size,
      keys: Array.from(modelCache.keys()),
    };
  }
}

/**
 * Get the ModelLoader singleton instance
 * @returns {ModelLoader}
 */
export function getModelLoader() {
  if (!instance) {
    instance = new ModelLoader();
  }
  return instance;
}

/**
 * Convenience function to load a model
 * @param {string} path - Model path
 * @param {Object} options - Loading options
 * @returns {Promise<THREE.Group>}
 */
export async function loadModel(path, options = {}) {
  return getModelLoader().load(path, options);
}

/**
 * Convenience function to load with fallback
 * @param {string} path - Model path
 * @param {Function} fallbackFn - Fallback function
 * @param {Object} options - Loading options
 * @returns {Promise<{model: THREE.Group, isLoaded: boolean}>}
 */
export async function loadModelWithFallback(path, fallbackFn, options = {}) {
  return getModelLoader().loadWithFallback(path, fallbackFn, options);
}
