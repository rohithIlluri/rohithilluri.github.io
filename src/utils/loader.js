/**
 * loader.js - Asset Loading Utilities
 * Handles loading of 3D models, textures, and other assets
 */

import * as THREE from 'three';

// Loader instances (lazy loaded)
let gltfLoader = null;
let textureLoader = null;
let audioLoader = null;

/**
 * Get or create the GLTF loader
 * @returns {Promise<GLTFLoader>}
 */
async function getGLTFLoader() {
  if (!gltfLoader) {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');

    gltfLoader = new GLTFLoader();

    // Set up Draco decoder for compressed meshes
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  return gltfLoader;
}

/**
 * Get or create the texture loader
 * @returns {THREE.TextureLoader}
 */
function getTextureLoader() {
  if (!textureLoader) {
    textureLoader = new THREE.TextureLoader();
  }
  return textureLoader;
}

/**
 * Get or create the audio loader
 * @returns {THREE.AudioLoader}
 */
function getAudioLoader() {
  if (!audioLoader) {
    audioLoader = new THREE.AudioLoader();
  }
  return audioLoader;
}

/**
 * Load a GLTF/GLB model
 * @param {string} url Path to the model file
 * @param {Function} onProgress Progress callback (0-1)
 * @returns {Promise<THREE.Group>} The loaded model
 */
export async function loadModel(url, onProgress) {
  const loader = await getGLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        // Enable shadows on all meshes
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        resolve(gltf.scene);
      },
      (xhr) => {
        if (onProgress && xhr.lengthComputable) {
          onProgress(xhr.loaded / xhr.total);
        }
      },
      (error) => {
        console.error('Error loading model:', url, error);
        reject(error);
      }
    );
  });
}

/**
 * Load a texture
 * @param {string} url Path to the texture file
 * @returns {Promise<THREE.Texture>}
 */
export function loadTexture(url) {
  const loader = getTextureLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        // Default settings for better quality
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 4;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', url, error);
        reject(error);
      }
    );
  });
}

/**
 * Load an audio buffer
 * @param {string} url Path to the audio file
 * @returns {Promise<AudioBuffer>}
 */
export function loadAudio(url) {
  const loader = getAudioLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (buffer) => resolve(buffer),
      undefined,
      (error) => {
        console.error('Error loading audio:', url, error);
        reject(error);
      }
    );
  });
}

/**
 * Load multiple assets with progress tracking
 * @param {Array<{url: string, type: 'model'|'texture'|'audio'}>} assets
 * @param {Function} onProgress Overall progress callback (0-1)
 * @returns {Promise<Map<string, any>>} Map of url -> loaded asset
 */
export async function loadAssets(assets, onProgress) {
  const results = new Map();
  let loaded = 0;

  const promises = assets.map(async ({ url, type }) => {
    let asset;

    switch (type) {
      case 'model':
        asset = await loadModel(url);
        break;
      case 'texture':
        asset = await loadTexture(url);
        break;
      case 'audio':
        asset = await loadAudio(url);
        break;
      default:
        throw new Error(`Unknown asset type: ${type}`);
    }

    loaded++;
    if (onProgress) {
      onProgress(loaded / assets.length);
    }

    results.set(url, asset);
    return asset;
  });

  await Promise.all(promises);
  return results;
}

/**
 * Preload common assets
 * @returns {Promise<void>}
 */
export async function preloadCommonAssets() {
  // Initialize loaders in parallel
  await Promise.all([
    getGLTFLoader(),
    // Add other common preloads here
  ]);
}

/**
 * Dispose of a loaded model and its resources
 * @param {THREE.Object3D} object The object to dispose
 */
export function disposeObject(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => disposeMaterial(material));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

/**
 * Dispose of a material and its textures
 * @param {THREE.Material} material
 */
function disposeMaterial(material) {
  const textureProperties = [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'emissiveMap',
    'alphaMap',
    'bumpMap',
    'displacementMap',
    'envMap',
    'lightMap',
  ];

  textureProperties.forEach((prop) => {
    if (material[prop]) {
      material[prop].dispose();
    }
  });

  material.dispose();
}
