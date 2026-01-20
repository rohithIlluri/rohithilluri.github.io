/**
 * toon.js - Enhanced Cel-Shading Material Factory
 * Creates toon-shaded materials with 4-band lighting, rim lighting, and purple shadows
 * Per visual quality spec: messenger.abeto.co parity
 */

import * as THREE from 'three';

// Visual quality constants from spec
const SHADOW_COLOR = 0x4A4063; // Purple shadow undertone (never pure black)
const OUTLINE_COLOR = 0x1A1A2E; // Dark blue-ish outline
const RIM_COLOR = 0xFFFFFF;
const RIM_INTENSITY_CHARACTER = 0.4;
const RIM_INTENSITY_ENVIRONMENT = 0.25;

/**
 * Create a basic toon material with cel-shading (for simple objects)
 * @param {Object} options Material options
 * @param {number} options.color Base color (hex)
 * @param {boolean} options.emissive Whether material is emissive
 * @param {number} options.emissiveIntensity Emissive intensity
 * @returns {THREE.MeshToonMaterial}
 */
export function createToonMaterial(options = {}) {
  const {
    color = 0xffffff,
    emissive = 0x000000,
    emissiveIntensity = 0,
  } = options;

  // Create gradient map for 4-band cel shading
  const gradientMap = createGradientMap();

  const material = new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    gradientMap: gradientMap,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: emissiveIntensity,
  });

  return material;
}

/**
 * Create a 4-band gradient map for DISCRETE cel shading
 * Per messenger.abeto.co style: hard color bands, NOT smooth transitions
 * - Highlight (brightest): 1.0
 * - Light: 0.75
 * - Mid: 0.5
 * - Shadow (darkest): 0.25
 */
function createGradientMap() {
  // 4 discrete values - NearestFilter ensures hard edges between bands
  const colors = new Uint8Array(4);
  colors[0] = 64;   // Shadow (0.25)
  colors[1] = 128;  // Mid (0.5)
  colors[2] = 191;  // Light (0.75)
  colors[3] = 255;  // Highlight (1.0)

  const gradientMap = new THREE.DataTexture(
    colors,
    colors.length,
    1,
    THREE.RedFormat
  );
  // CRITICAL: NearestFilter creates hard band edges (no interpolation)
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;

  return gradientMap;
}

/**
 * Create an emissive material for glowing objects (neon signs, lights)
 * @param {Object} options
 * @param {number} options.color Color
 * @param {number} options.intensity Glow intensity
 */
export function createGlowMaterial(options = {}) {
  const {
    color = 0xFFD54F, // Default accent color from spec
    intensity = 1,
  } = options;

  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: intensity,
  });
}

/**
 * Create outline mesh using inverted hull method
 * From spec: 2-4px outlines, color #1A1A2E
 * @param {THREE.Mesh} originalMesh The mesh to create outline for
 * @param {number} width Outline width (default 0.05 - increased for visibility)
 * @returns {THREE.Mesh} Outline mesh
 */
export function createOutlineMesh(originalMesh, width = 0.05) {
  const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float outlineWidth;

      void main() {
        vec3 newPosition = position + normal * outlineWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.102, 0.102, 0.180, 1.0); // #1A1A2E
      }
    `,
    uniforms: {
      outlineWidth: { value: width }
    },
    side: THREE.BackSide,
    depthWrite: true,
  });

  const outlineMesh = new THREE.Mesh(originalMesh.geometry.clone(), outlineMaterial);
  outlineMesh.renderOrder = -1; // Render behind the main mesh

  return outlineMesh;
}

/**
 * Create outline material for inverted hull method
 * From spec: 2-4px outlines, color #1A1A2E
 */
export function createOutlineMaterial(width = 0.05) {
  return new THREE.ShaderMaterial({
    vertexShader: `
      uniform float outlineWidth;

      void main() {
        vec3 newPosition = position + normal * outlineWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.102, 0.102, 0.180, 1.0); // #1A1A2E
      }
    `,
    uniforms: {
      outlineWidth: { value: width }
    },
    side: THREE.BackSide,
    depthWrite: true,
  });
}

/**
 * Enhanced toon material with DISCRETE cel-shading bands and rim lighting
 * This is the primary material for achieving messenger.abeto.co visual quality
 *
 * KEY CHANGE: Uses hard step() functions instead of smoothstep() for discrete bands
 *
 * @param {Object} options Material options
 * @param {number} options.color Base color (hex)
 * @param {boolean} options.isCharacter Whether this is for a character (stronger rim)
 * @param {THREE.Vector3} options.lightDirection Main light direction
 * @returns {THREE.ShaderMaterial}
 */
export function createEnhancedToonMaterial(options = {}) {
  const {
    color = 0xffffff,
    isCharacter = false,
    lightDirection = new THREE.Vector3(1, 1, 1).normalize(),
  } = options;

  const rimIntensity = isCharacter ? RIM_INTENSITY_CHARACTER : RIM_INTENSITY_ENVIRONMENT;

  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(color) },
      shadowColor: { value: new THREE.Color(SHADOW_COLOR) },
      rimColor: { value: new THREE.Color(RIM_COLOR) },
      rimIntensity: { value: rimIntensity },
      lightDirection: { value: lightDirection },
      ambientIntensity: { value: 0.15 }, // Lowered from 0.4 to allow darker shadows
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform vec3 shadowColor;
      uniform vec3 rimColor;
      uniform float rimIntensity;
      uniform vec3 lightDirection;
      uniform float ambientIntensity;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldNormal;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        vec3 lightDir = normalize(lightDirection);

        // Calculate base lighting (N dot L)
        float NdotL = dot(normal, lightDir);

        // ============================================
        // DISCRETE 4-BAND CEL-SHADING (messenger.abeto.co style)
        // Uses hard step() functions - NO smoothstep interpolation
        // ============================================
        float intensity;

        if (NdotL > 0.7) {
          intensity = 1.0;      // Highlight band
        } else if (NdotL > 0.35) {
          intensity = 0.75;     // Light band
        } else if (NdotL > 0.0) {
          intensity = 0.5;      // Mid band
        } else {
          intensity = 0.25;     // Shadow band (dark, visible)
        }

        // Add minimal ambient to prevent pure black
        intensity = max(intensity, ambientIntensity);

        // Mix base color with purple shadow color (never pure black per spec)
        vec3 shadedColor = mix(shadowColor, baseColor, intensity);

        // Rim lighting (Fresnel effect) - kept smooth for visual appeal
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        float rimAmount = smoothstep(0.5, 0.7, fresnel);

        // Only apply rim in lit areas
        rimAmount *= step(0.0, NdotL);

        vec3 rim = rimColor * rimAmount * rimIntensity;

        // Final color with rim lighting
        vec3 finalColor = shadedColor + rim;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    lights: false, // We handle lighting manually
  });
}

/**
 * Create an enhanced toon material that works with Three.js lighting system
 * Uses onBeforeCompile to inject custom shading into MeshStandardMaterial
 *
 * @param {Object} options Material options
 * @param {number} options.color Base color (hex)
 * @param {boolean} options.isCharacter Whether this is for a character
 * @returns {THREE.MeshStandardMaterial}
 */
export function createEnhancedToonMaterialLit(options = {}) {
  const {
    color = 0xffffff,
    isCharacter = false,
  } = options;

  const rimIntensity = isCharacter ? RIM_INTENSITY_CHARACTER : RIM_INTENSITY_ENVIRONMENT;
  const shadowColorVec = new THREE.Color(SHADOW_COLOR);

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 1.0,
    metalness: 0.0,
  });

  // Inject custom cel-shading into the shader
  material.onBeforeCompile = (shader) => {
    // Add uniforms
    shader.uniforms.shadowColor = { value: shadowColorVec };
    shader.uniforms.rimColor = { value: new THREE.Color(RIM_COLOR) };
    shader.uniforms.rimIntensity = { value: rimIntensity };

    // Modify fragment shader to add cel-shading and rim lighting
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform vec3 shadowColor;
      uniform vec3 rimColor;
      uniform float rimIntensity;
      `
    );

    // Add DISCRETE cel-shading and rim lighting before output
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      // DISCRETE cel-shading: hard quantize into 4 bands
      vec3 quantizedColor = gl_FragColor.rgb;
      float luminance = dot(quantizedColor, vec3(0.299, 0.587, 0.114));

      // 4-band DISCRETE quantization (no interpolation)
      float band;
      if (luminance > 0.7) band = 1.0;       // Highlight
      else if (luminance > 0.4) band = 0.75; // Light
      else if (luminance > 0.15) band = 0.5; // Mid
      else band = 0.25;                       // Shadow (visible dark)

      // Mix with purple shadow (never pure black)
      quantizedColor = mix(shadowColor, quantizedColor, band);

      // Rim lighting
      vec3 viewDir = normalize(cameraPosition - vViewPosition.xyz);
      float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
      float rimAmount = smoothstep(0.5, 0.7, fresnel) * step(0.1, luminance);
      quantizedColor += rimColor * rimAmount * rimIntensity;

      gl_FragColor = vec4(quantizedColor, gl_FragColor.a);

      #include <dithering_fragment>
      `
    );
  };

  return material;
}

/**
 * Custom toon shader with more control (legacy, kept for reference)
 * Includes rim lighting and shadow color adjustment
 */
export const ToonShaderMaterial = {
  uniforms: {
    color: { value: new THREE.Color(0xffffff) },
    shadowColor: { value: new THREE.Color(SHADOW_COLOR) },
    rimColor: { value: new THREE.Color(RIM_COLOR) },
    rimIntensity: { value: 0.4 },
    lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
  },

  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 color;
    uniform vec3 shadowColor;
    uniform vec3 rimColor;
    uniform float rimIntensity;
    uniform vec3 lightDirection;

    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Calculate light intensity
      float NdotL = dot(normal, lightDirection);

      // ============================================
      // DISCRETE 4-band cel-shading (no smoothstep)
      // ============================================
      float intensity;
      if (NdotL > 0.7) intensity = 1.0;       // Highlight
      else if (NdotL > 0.35) intensity = 0.75; // Light
      else if (NdotL > 0.0) intensity = 0.5;   // Mid
      else intensity = 0.25;                    // Shadow (visible dark)

      // Minimal ambient to prevent pure black
      intensity = max(intensity, 0.15);

      // Mix base color with shadow color (purple undertone per spec)
      vec3 shadedColor = mix(shadowColor, color, intensity);

      // Rim lighting
      float rimDot = 1.0 - max(dot(viewDir, normal), 0.0);
      float rimAmount = smoothstep(0.55, 0.7, rimDot);
      rimAmount *= smoothstep(0.0, 0.2, NdotL);
      vec3 rim = rimColor * rimAmount * rimIntensity;

      gl_FragColor = vec4(shadedColor + rim, 1.0);
    }
  `,
};

// Export constants for use in other modules
export const TOON_CONSTANTS = {
  SHADOW_COLOR,
  OUTLINE_COLOR,
  RIM_COLOR,
  RIM_INTENSITY_CHARACTER,
  RIM_INTENSITY_ENVIRONMENT,
};
