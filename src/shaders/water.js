/**
 * water.js - Animated Water Material Shader
 * Implements animated wave displacement, fresnel transparency, and depth-based color
 * Per visual quality spec: Shallow #4FC3F7, Deep #0288D1
 */

import * as THREE from 'three';

// Water colors from spec
const SHALLOW_COLOR = new THREE.Color(0x4FC3F7);
const DEEP_COLOR = new THREE.Color(0x0288D1);
const FOAM_COLOR = new THREE.Color(0xFFFFFF);

// Wave settings from spec
const WAVE_SPEED = 0.8;
const WAVE_SCALE_X = 2.0;
const WAVE_SCALE_Z = 1.5;
const WAVE_HEIGHT = 0.1;

// Fresnel settings
const FRESNEL_MIN = 0.4;
const FRESNEL_MAX = 0.95;

/**
 * Custom Water Material
 * Animated waves with fresnel-based transparency and depth coloring
 */
export const WaterShader = {
  uniforms: {
    time: { value: 0.0 },
    shallowColor: { value: SHALLOW_COLOR },
    deepColor: { value: DEEP_COLOR },
    foamColor: { value: FOAM_COLOR },
    waveSpeed: { value: WAVE_SPEED },
    waveScaleX: { value: WAVE_SCALE_X },
    waveScaleZ: { value: WAVE_SCALE_Z },
    waveHeight: { value: WAVE_HEIGHT },
    fresnelMin: { value: FRESNEL_MIN },
    fresnelMax: { value: FRESNEL_MAX },
    foamThreshold: { value: 0.85 },
    foamIntensity: { value: 0.8 },
    // Depth texture for edge foam (optional)
    depthTexture: { value: null },
    cameraNear: { value: 0.1 },
    cameraFar: { value: 1000.0 },
    resolution: { value: new THREE.Vector2(1, 1) },
    // Lighting
    lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
  },

  vertexShader: `
    uniform float time;
    uniform float waveSpeed;
    uniform float waveScaleX;
    uniform float waveScaleZ;
    uniform float waveHeight;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vWaveHeight;

    void main() {
      vUv = uv;

      // Calculate wave displacement using dual sine waves
      vec3 pos = position;

      // Primary wave (larger, slower)
      float wave1 = sin(pos.x * waveScaleX + time * waveSpeed) *
                    cos(pos.z * waveScaleZ + time * waveSpeed * 0.8);

      // Secondary wave (smaller, faster, perpendicular)
      float wave2 = sin(pos.x * waveScaleX * 1.5 + time * waveSpeed * 1.2) *
                    sin(pos.z * waveScaleZ * 0.8 + time * waveSpeed * 0.6);

      // Combined wave height
      float wave = (wave1 * 0.6 + wave2 * 0.4) * waveHeight;
      pos.y += wave;
      vWaveHeight = wave;

      // Calculate normals for waves (approximate gradient)
      float dx = cos(pos.x * waveScaleX + time * waveSpeed) * waveHeight * waveScaleX;
      float dz = -sin(pos.z * waveScaleZ + time * waveSpeed * 0.8) * waveHeight * waveScaleZ;

      vec3 tangent = normalize(vec3(1.0, dx, 0.0));
      vec3 bitangent = normalize(vec3(0.0, dz, 1.0));
      vNormal = normalize(cross(bitangent, tangent));

      // World and view positions
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 shallowColor;
    uniform vec3 deepColor;
    uniform vec3 foamColor;
    uniform float fresnelMin;
    uniform float fresnelMax;
    uniform float foamThreshold;
    uniform float foamIntensity;
    uniform vec3 lightDirection;

    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vWaveHeight;

    void main() {
      // Normalize view direction
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // Fresnel effect for transparency
      float fresnel = dot(normal, viewDir);
      fresnel = clamp(fresnel, 0.0, 1.0);
      fresnel = pow(1.0 - fresnel, 2.0);
      float alpha = mix(fresnelMin, fresnelMax, fresnel);

      // Depth-based color (simulated with distance from center)
      float depth = length(vWorldPosition.xz) * 0.02;
      depth = clamp(depth, 0.0, 1.0);
      vec3 waterColor = mix(shallowColor, deepColor, depth);

      // Wave peak foam
      float foam = smoothstep(foamThreshold, 1.0, vWaveHeight / 0.1 * 0.5 + 0.5);

      // Edge foam (based on UV proximity to edges)
      float edgeFoam = 0.0;
      float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
      edgeFoam = 1.0 - smoothstep(0.0, 0.1, edgeDist);

      // Combine foams
      float totalFoam = max(foam, edgeFoam) * foamIntensity;

      // Simple lighting
      float ndotl = max(dot(normal, lightDirection), 0.0);
      float lighting = 0.5 + ndotl * 0.5;

      // Specular highlight
      vec3 halfDir = normalize(lightDirection + viewDir);
      float specular = pow(max(dot(normal, halfDir), 0.0), 64.0);

      // Final color
      vec3 finalColor = mix(waterColor * lighting, foamColor, totalFoam);
      finalColor += specular * 0.5;

      // Add slight blue tint to transparency
      alpha = max(alpha, totalFoam);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

/**
 * Create a water material with proper settings
 * @param {Object} options Material options
 * @returns {THREE.ShaderMaterial} Water material
 */
export function createWaterMaterial(options = {}) {
  const uniforms = THREE.UniformsUtils.clone(WaterShader.uniforms);

  // Apply custom options
  if (options.shallowColor) {
    uniforms.shallowColor.value = new THREE.Color(options.shallowColor);
  }
  if (options.deepColor) {
    uniforms.deepColor.value = new THREE.Color(options.deepColor);
  }
  if (options.waveHeight !== undefined) {
    uniforms.waveHeight.value = options.waveHeight;
  }
  if (options.waveSpeed !== undefined) {
    uniforms.waveSpeed.value = options.waveSpeed;
  }
  if (options.lightDirection) {
    uniforms.lightDirection.value.copy(options.lightDirection);
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: WaterShader.vertexShader,
    fragmentShader: WaterShader.fragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  return material;
}

/**
 * Water mesh class with update method
 */
export class Water {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.time = 0;

    // Default options
    const width = options.width || 20;
    const height = options.height || 20;
    const segments = options.segments || 32;

    // Create geometry
    this.geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    this.geometry.rotateX(-Math.PI / 2);

    // Create material
    this.material = createWaterMaterial(options);

    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(options.position || new THREE.Vector3(0, 0, 0));
    this.mesh.receiveShadow = true;

    // Add to scene
    this.scene.add(this.mesh);
  }

  /**
   * Update water animation
   * @param {number} deltaTime Time since last frame
   */
  update(deltaTime) {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;
  }

  /**
   * Set light direction
   * @param {THREE.Vector3} direction Light direction
   */
  setLightDirection(direction) {
    this.material.uniforms.lightDirection.value.copy(direction).normalize();
  }

  /**
   * Set water colors
   * @param {Object} colors { shallow, deep }
   */
  setColors(colors) {
    if (colors.shallow) {
      this.material.uniforms.shallowColor.value = new THREE.Color(colors.shallow);
    }
    if (colors.deep) {
      this.material.uniforms.deepColor.value = new THREE.Color(colors.deep);
    }
  }

  /**
   * Set wave parameters
   * @param {Object} params { speed, height, scaleX, scaleZ }
   */
  setWaveParams(params) {
    if (params.speed !== undefined) {
      this.material.uniforms.waveSpeed.value = params.speed;
    }
    if (params.height !== undefined) {
      this.material.uniforms.waveHeight.value = params.height;
    }
    if (params.scaleX !== undefined) {
      this.material.uniforms.waveScaleX.value = params.scaleX;
    }
    if (params.scaleZ !== undefined) {
      this.material.uniforms.waveScaleZ.value = params.scaleZ;
    }
  }

  /**
   * Get the mesh for positioning
   * @returns {THREE.Mesh} The water mesh
   */
  getMesh() {
    return this.mesh;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}

export { SHALLOW_COLOR, DEEP_COLOR, FOAM_COLOR, WAVE_SPEED, WAVE_HEIGHT };
