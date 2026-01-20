import * as THREE from 'three';

/**
 * Cel-Shading Material System
 *
 * Creates a 4-band toon shader for the Messenger aesthetic:
 * - Light (100%) > 0.8
 * - Mid-light (70%) > 0.5
 * - Mid-dark (40%) > 0.25
 * - Dark (20%) <= 0.25
 */

// Vertex shader - passes normal and view direction to fragment
const celVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Fragment shader - 4-band cel shading with rim light
const celFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uLightDirection;
  uniform vec3 uRimColor;
  uniform float uRimPower;
  uniform float uAmbient;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // Normalize vectors
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(uLightDirection);
    vec3 viewDir = normalize(vViewPosition);

    // Calculate diffuse lighting
    float NdotL = dot(normal, lightDir);

    // 4-band cel shading
    float intensity;
    if (NdotL > 0.8) {
      intensity = 1.0;       // Light band
    } else if (NdotL > 0.5) {
      intensity = 0.7;       // Mid-light band
    } else if (NdotL > 0.25) {
      intensity = 0.4;       // Mid-dark band
    } else {
      intensity = 0.2;       // Dark band
    }

    // Add ambient light
    intensity = max(intensity, uAmbient);

    // Calculate rim lighting for edge glow
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, uRimPower);

    // Combine base color with intensity and rim
    vec3 celColor = uColor * intensity;
    vec3 rimContribution = uRimColor * rim * 0.3;

    gl_FragColor = vec4(celColor + rimContribution, 1.0);
  }
`;

/**
 * Creates a cel-shaded material
 * @param {Object} options - Material options
 * @param {string|number} options.color - Base color (hex or THREE.Color)
 * @param {string|number} options.rimColor - Rim light color (default: soft teal)
 * @param {number} options.rimPower - Rim light falloff (default: 3.0)
 * @param {number} options.ambient - Minimum brightness (default: 0.3)
 * @returns {THREE.ShaderMaterial} Cel-shaded material
 */
export function createCelMaterial({
  color = '#FFFFFF',
  rimColor = '#98D8C8',
  rimPower = 3.0,
  ambient = 0.3,
} = {}) {
  const baseColor = new THREE.Color(color);
  const rimColorVec = new THREE.Color(rimColor);

  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: baseColor },
      uLightDirection: { value: new THREE.Vector3(1, 1, 0.5).normalize() },
      uRimColor: { value: rimColorVec },
      uRimPower: { value: rimPower },
      uAmbient: { value: ambient },
    },
    vertexShader: celVertexShader,
    fragmentShader: celFragmentShader,
  });
}

/**
 * Hook-friendly cel material creator for React Three Fiber
 * Returns uniform update functions for dynamic color changes
 */
export function useCelMaterial(initialColor = '#FFFFFF', options = {}) {
  const material = createCelMaterial({ color: initialColor, ...options });

  return {
    material,
    setColor: (newColor) => {
      material.uniforms.uColor.value = new THREE.Color(newColor);
    },
    setLightDirection: (x, y, z) => {
      material.uniforms.uLightDirection.value.set(x, y, z).normalize();
    },
  };
}

/**
 * Simplified cel material using THREE's built-in toon shading
 * with custom gradient map for more control
 *
 * This is an alternative that's easier to integrate but less customizable
 */
export function createSimpleCelMaterial(color = '#FFFFFF') {
  // Create a 4-step gradient texture for toon shading
  const gradientColors = new Uint8Array([
    51,   // 0.2 * 255 - Dark
    102,  // 0.4 * 255 - Mid-dark
    178,  // 0.7 * 255 - Mid-light
    255,  // 1.0 * 255 - Light
  ]);

  const gradientMap = new THREE.DataTexture(
    gradientColors,
    4,
    1,
    THREE.RedFormat
  );
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;

  return new THREE.MeshToonMaterial({
    color: new THREE.Color(color),
    gradientMap,
  });
}

export default createCelMaterial;
