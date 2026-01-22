/**
 * AssetManager.js - Centralized asset loading and management
 * Handles loading of 3D models, textures, and audio with fallbacks
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Asset manifest - defines all loadable assets with fallbacks
const ASSET_MANIFEST = {
  models: {
    // Character model - Robot from Three.js examples as demo
    character: {
      url: '/assets/models/character.glb',
      fallbackUrl: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
      type: 'character',
      scale: 0.5,
    },
    // Low-poly fox character as alternative
    fox: {
      url: '/assets/models/fox.glb',
      fallbackUrl: 'https://threejs.org/examples/models/gltf/Fox/glTF/Fox.gltf',
      type: 'character',
      scale: 0.02,
    },
    // Soldier character with animations
    soldier: {
      url: '/assets/models/soldier.glb',
      fallbackUrl: 'https://threejs.org/examples/models/gltf/Soldier.glb',
      type: 'character',
      scale: 1,
    },
  },
  textures: {},
  audio: {},
};

class AssetManager {
  constructor() {
    this.assets = new Map();
    this.loadingProgress = new Map();
    this.gltfLoader = null;
    this.textureLoader = null;
    this.audioLoader = null;
    this.onProgress = null;
  }

  /**
   * Initialize loaders
   */
  async init() {
    // Initialize GLTF loader with Draco support
    this.gltfLoader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    // Initialize texture loader
    this.textureLoader = new THREE.TextureLoader();

    // Initialize audio loader
    this.audioLoader = new THREE.AudioLoader();

    console.log('[AssetManager] Initialized');
  }

  /**
   * Load a specific asset by key
   * @param {string} category - 'models', 'textures', or 'audio'
   * @param {string} key - Asset key from manifest
   * @returns {Promise<any>} Loaded asset
   */
  async loadAsset(category, key) {
    const assetKey = `${category}/${key}`;

    // Return cached asset if already loaded
    if (this.assets.has(assetKey)) {
      return this.assets.get(assetKey);
    }

    const manifest = ASSET_MANIFEST[category]?.[key];
    if (!manifest) {
      throw new Error(`Asset not found in manifest: ${assetKey}`);
    }

    console.log(`[AssetManager] Loading ${assetKey}...`);

    let asset = null;

    switch (category) {
      case 'models':
        asset = await this.loadModel(manifest);
        break;
      case 'textures':
        asset = await this.loadTexture(manifest);
        break;
      case 'audio':
        asset = await this.loadAudio(manifest);
        break;
    }

    this.assets.set(assetKey, asset);
    console.log(`[AssetManager] Loaded ${assetKey}`);

    return asset;
  }

  /**
   * Load a 3D model with fallback support
   */
  async loadModel(manifest) {
    const { url, fallbackUrl, scale = 1 } = manifest;

    // Try primary URL first
    try {
      const gltf = await this.loadGLTF(url);
      gltf.scene.scale.setScalar(scale);
      return gltf;
    } catch (primaryError) {
      console.warn(`[AssetManager] Primary URL failed: ${url}`, primaryError.message);

      // Try fallback URL
      if (fallbackUrl) {
        console.log(`[AssetManager] Trying fallback: ${fallbackUrl}`);
        try {
          const gltf = await this.loadGLTF(fallbackUrl);
          gltf.scene.scale.setScalar(scale);
          return gltf;
        } catch (fallbackError) {
          console.error(`[AssetManager] Fallback also failed:`, fallbackError.message);
        }
      }

      return null;
    }
  }

  /**
   * Load GLTF file
   */
  loadGLTF(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => resolve(gltf),
        (progress) => {
          if (progress.lengthComputable) {
            const percent = (progress.loaded / progress.total) * 100;
            this.loadingProgress.set(url, percent);
            this.reportProgress();
          }
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * Load texture
   */
  async loadTexture(manifest) {
    const { url, fallbackUrl } = manifest;

    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          resolve(texture);
        },
        undefined,
        (error) => {
          if (fallbackUrl) {
            this.textureLoader.load(fallbackUrl, resolve, undefined, reject);
          } else {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Load audio
   */
  async loadAudio(manifest) {
    const { url, fallbackUrl } = manifest;

    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        resolve,
        undefined,
        (error) => {
          if (fallbackUrl) {
            this.audioLoader.load(fallbackUrl, resolve, undefined, reject);
          } else {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Report overall loading progress
   */
  reportProgress() {
    if (!this.onProgress) return;

    const values = Array.from(this.loadingProgress.values());
    if (values.length === 0) return;

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    this.onProgress(average / 100);
  }

  /**
   * Preload all essential assets
   */
  async preloadEssentials(onProgress) {
    this.onProgress = onProgress;

    await this.init();

    // Preload character model
    try {
      await this.loadAsset('models', 'soldier');
    } catch (e) {
      console.warn('[AssetManager] Could not preload soldier, trying robot...');
      try {
        await this.loadAsset('models', 'character');
      } catch (e2) {
        console.warn('[AssetManager] Could not preload any character model');
      }
    }

    this.onProgress = null;
  }

  /**
   * Get a loaded asset
   */
  get(category, key) {
    return this.assets.get(`${category}/${key}`);
  }

  /**
   * Check if an asset is loaded
   */
  has(category, key) {
    return this.assets.has(`${category}/${key}`);
  }

  /**
   * Get the asset manifest
   */
  getManifest() {
    return ASSET_MANIFEST;
  }

  /**
   * Dispose of all loaded assets
   */
  dispose() {
    this.assets.forEach((asset, key) => {
      if (asset?.scene) {
        asset.scene.traverse((child) => {
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
    });

    this.assets.clear();
    this.loadingProgress.clear();
  }
}

// Singleton instance
export const assetManager = new AssetManager();
export default assetManager;
