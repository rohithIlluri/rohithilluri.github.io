/**
 * ToonModelHelper.js - Apply toon materials to loaded 3D models
 * Converts standard materials to messenger.abeto.co style cel-shading
 * with proper outlines and rim lighting
 */

import * as THREE from 'three';
import {
  createEnhancedToonMaterial,
  createToonMaterial,
  createOutlineMesh,
} from '../shaders/toon.js';
import { MESSENGER_PALETTE } from '../constants/colors.js';

/**
 * Apply toon shading to a loaded model
 * Replaces all materials with toon materials and adds outlines
 *
 * @param {THREE.Group} model - The loaded model to apply toon shading to
 * @param {Object} options - Configuration options
 * @param {boolean} options.isCharacter - Whether this is a character (stronger rim lighting)
 * @param {THREE.Vector3} options.lightDirection - Light direction for shading
 * @param {boolean} options.addOutlines - Whether to add outline meshes (default: true)
 * @param {number} options.outlineWidth - Outline width (default: 0.03 for characters, 0.05 for environment)
 * @param {Object} options.colorOverrides - Map of material names to override colors
 * @param {boolean} options.preserveColors - Try to preserve original model colors (default: true)
 * @returns {THREE.Group} The same model with toon materials applied
 */
export function applyToonShading(model, options = {}) {
  const {
    isCharacter = false,
    lightDirection = new THREE.Vector3(1, 1, 1).normalize(),
    addOutlines = true,
    outlineWidth = isCharacter ? 0.03 : 0.05,
    colorOverrides = {},
    preserveColors = true,
  } = options;

  // Track outline meshes to add after traversal
  const outlinesToAdd = [];

  model.traverse((child) => {
    if (child.isMesh) {
      // Get the original color from the material
      let originalColor = 0xffffff;
      const materialName = child.material?.name || '';

      // Check for color override
      if (colorOverrides[materialName]) {
        originalColor = colorOverrides[materialName];
      } else if (preserveColors && child.material) {
        // Try to extract color from original material
        if (child.material.color) {
          originalColor = child.material.color.getHex();
        } else if (child.material.map) {
          // If there's a texture, use a neutral color
          originalColor = 0xdddddd;
        }
      }

      // Create new toon material
      const toonMaterial = createEnhancedToonMaterial({
        color: originalColor,
        isCharacter,
        lightDirection,
      });

      // Store original material name for reference
      toonMaterial.name = materialName || 'toon';

      // Replace the material
      child.material = toonMaterial;

      // Enable shadows
      child.castShadow = true;
      child.receiveShadow = true;

      // Queue outline mesh for creation
      if (addOutlines) {
        outlinesToAdd.push({
          mesh: child,
          width: outlineWidth,
        });
      }
    }
  });

  // Add outline meshes (done after traversal to avoid infinite loop)
  outlinesToAdd.forEach(({ mesh, width }) => {
    try {
      const outline = createOutlineMesh(mesh, width);
      // Parent outline to same parent as original mesh
      if (mesh.parent) {
        outline.position.copy(mesh.position);
        outline.rotation.copy(mesh.rotation);
        outline.scale.copy(mesh.scale);
        mesh.parent.add(outline);
      }
    } catch (error) {
      // Some geometries might not work well with outlines
      console.warn('Could not create outline for mesh:', mesh.name, error.message);
    }
  });

  return model;
}

/**
 * Apply toon shading with color mapping from material names
 * Useful for models where material names indicate color intent
 *
 * @param {THREE.Group} model - The loaded model
 * @param {Object} colorMap - Map of material name patterns to colors
 * @param {Object} options - Additional options passed to applyToonShading
 * @returns {THREE.Group}
 *
 * @example
 * applyToonShadingWithColorMap(model, {
 *   'skin': 0xFFD5C8,
 *   'hair': 0x2A2A2A,
 *   'shirt': 0x1A1A2E,
 * });
 */
export function applyToonShadingWithColorMap(model, colorMap, options = {}) {
  const colorOverrides = {};

  // Build color overrides from pattern matching
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      const materialName = child.material.name?.toLowerCase() || '';
      const meshName = child.name?.toLowerCase() || '';

      // Check both material name and mesh name against patterns
      for (const [pattern, color] of Object.entries(colorMap)) {
        const lowerPattern = pattern.toLowerCase();
        if (materialName.includes(lowerPattern) || meshName.includes(lowerPattern)) {
          colorOverrides[child.material.name || meshName] = color;
          break;
        }
      }
    }
  });

  return applyToonShading(model, { ...options, colorOverrides });
}

/**
 * Apply character-specific toon shading with messenger.abeto.co colors
 * Uses the game's color palette for consistent character appearance
 *
 * @param {THREE.Group} model - Character model
 * @param {Object} appearance - Appearance configuration
 * @param {number} appearance.skinColor - Skin color hex
 * @param {number} appearance.hairColor - Hair color hex
 * @param {number} appearance.shirtColor - Shirt color hex
 * @param {number} appearance.pantsColor - Pants color hex
 * @param {number} appearance.shoeColor - Shoe color hex
 * @param {THREE.Vector3} lightDirection - Light direction
 * @returns {THREE.Group}
 */
export function applyCharacterToonShading(model, appearance = {}, lightDirection) {
  const {
    skinColor = 0xFFD5C8,
    hairColor = 0x2A2A2A,
    shirtColor = 0x1A1A2E,
    pantsColor = 0x4A4A4A,
    shoeColor = 0x2A2A2A,
    bagColor = 0x8B7355,
  } = appearance;

  // Common material name mappings for character models
  const colorMap = {
    'skin': skinColor,
    'body': skinColor,
    'face': skinColor,
    'hand': skinColor,
    'arm': skinColor,
    'leg': skinColor,
    'hair': hairColor,
    'shirt': shirtColor,
    'top': shirtColor,
    'jacket': shirtColor,
    'pants': pantsColor,
    'skirt': pantsColor,
    'bottom': pantsColor,
    'shoe': shoeColor,
    'foot': shoeColor,
    'boot': shoeColor,
    'bag': bagColor,
    'strap': bagColor,
  };

  return applyToonShadingWithColorMap(model, colorMap, {
    isCharacter: true,
    lightDirection,
    outlineWidth: 0.025,
  });
}

/**
 * Update light direction on all toon materials in a model
 * Call this when the sun position changes
 *
 * @param {THREE.Group} model - The model to update
 * @param {THREE.Vector3} lightDirection - New light direction
 */
export function updateModelLightDirection(model, lightDirection) {
  model.traverse((child) => {
    if (child.isMesh && child.material?.uniforms?.lightDirection) {
      child.material.uniforms.lightDirection.value.copy(lightDirection);
    }
  });
}

/**
 * Create a shadow blob for a character model
 * Messenger.abeto.co style: blue-gray ellipse under characters
 *
 * @param {number} radius - Shadow radius (default: 0.25)
 * @param {number} opacity - Shadow opacity (default: 0.25)
 * @returns {THREE.Mesh}
 */
export function createCharacterShadow(radius = 0.25, opacity = 0.25) {
  const shadowGeo = new THREE.CircleGeometry(radius, 16);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: MESSENGER_PALETTE.SHADOW_TINT,
    transparent: true,
    opacity,
    depthWrite: false,
  });

  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -1;

  return shadow;
}

/**
 * Set up animation mixer for a loaded model
 * Extracts animations stored in userData by ModelLoader
 *
 * @param {THREE.Group} model - The loaded model with animations
 * @returns {{mixer: THREE.AnimationMixer, actions: Object}|null}
 */
export function setupModelAnimations(model) {
  if (!model.userData.animations || model.userData.animations.length === 0) {
    return null;
  }

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};

  model.userData.animations.forEach((clip) => {
    const action = mixer.clipAction(clip);
    // Normalize animation name (remove common prefixes/suffixes)
    const name = clip.name
      .replace(/^(mixamo\.com|Armature\|)/, '')
      .toLowerCase();
    actions[name] = action;
  });

  return { mixer, actions };
}

/**
 * Dispose of toon materials and outlines in a model
 *
 * @param {THREE.Group} model - Model to dispose
 */
export function disposeToonModel(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}

/**
 * Get bounding box of a model for positioning
 *
 * @param {THREE.Group} model - The model
 * @returns {{box: THREE.Box3, size: THREE.Vector3, center: THREE.Vector3}}
 */
export function getModelBounds(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  return { box, size, center };
}

/**
 * Scale model to fit within target height
 * Useful for normalizing character sizes
 *
 * @param {THREE.Group} model - The model to scale
 * @param {number} targetHeight - Desired height in units
 * @returns {number} The scale factor applied
 */
export function scaleModelToHeight(model, targetHeight) {
  const { size } = getModelBounds(model);
  const scale = targetHeight / size.y;
  model.scale.setScalar(scale);
  return scale;
}

/**
 * Center model at origin with feet on ground plane
 *
 * @param {THREE.Group} model - The model to center
 */
export function centerModelAtGround(model) {
  const { box } = getModelBounds(model);
  // Move so bottom of bounding box is at y=0
  model.position.y = -box.min.y;
  // Center horizontally
  model.position.x = -(box.min.x + box.max.x) / 2;
  model.position.z = -(box.min.z + box.max.z) / 2;
}
