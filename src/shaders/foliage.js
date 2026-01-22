/**
 * foliage.js - Wind-Animated Vegetation Shader
 * Implements wind sway with vertex displacement based on height
 * Includes subsurface scattering approximation for leaves
 */

import * as THREE from 'three';

// Foliage colors
const LEAF_COLOR = new THREE.Color(0x4CAF50); // Base green
const SSS_COLOR = new THREE.Color(0x90EE90); // Light green for SSS

// Wind settings from spec
const WIND_STRENGTH = 0.15;
const WIND_SPEED_X = 2.0;
const WIND_SPEED_Z = 1.5;

// SSS settings from spec
const SSS_INTENSITY = 0.3;

/**
 * Foliage Shader with wind animation and subsurface scattering
 */
export const FoliageShader = {
  uniforms: {
    time: { value: 0.0 },
    baseColor: { value: LEAF_COLOR },
    sssColor: { value: SSS_COLOR },
    windStrength: { value: WIND_STRENGTH },
    windSpeedX: { value: WIND_SPEED_X },
    windSpeedZ: { value: WIND_SPEED_Z },
    sssIntensity: { value: SSS_INTENSITY },
    lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    // Cel-shading parameters
    shadowColor: { value: new THREE.Color(0x4A4063) },
    rimColor: { value: new THREE.Color(0xFFFFFF) },
    rimIntensity: { value: 0.4 },
    // Object transform for world-space wind
    worldMatrix: { value: new THREE.Matrix4() },
  },

  vertexShader: `
    uniform float time;
    uniform float windStrength;
    uniform float windSpeedX;
    uniform float windSpeedZ;
    uniform mat4 worldMatrix;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vSwayAmount;

    void main() {
      vUv = uv;
      vNormal = normalMatrix * normal;

      // Calculate world position for consistent wind
      vec4 worldPos = worldMatrix * vec4(position, 1.0);

      // Wind sway based on height (higher vertices sway more)
      // Using position.y as height mask
      float heightMask = smoothstep(0.0, 1.0, position.y);

      // Dual-frequency wind for more natural motion
      float windX = sin(worldPos.x * 0.5 + time * windSpeedX) *
                    cos(worldPos.z * 0.3 + time * windSpeedZ * 0.7);
      float windZ = cos(worldPos.x * 0.3 + time * windSpeedX * 0.6) *
                    sin(worldPos.z * 0.5 + time * windSpeedZ);

      // Add some turbulence
      float turbulence = sin(time * 3.0 + worldPos.x * 2.0) * 0.2 + 0.8;

      // Calculate displacement
      vec3 displacement = vec3(
        windX * windStrength * heightMask * turbulence,
        0.0,
        windZ * windStrength * heightMask * turbulence
      );

      vSwayAmount = length(displacement);

      vec3 pos = position + displacement;

      // Calculate view position for rim lighting
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,

  fragmentShader: `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 sssColor;
    uniform vec3 shadowColor;
    uniform vec3 rimColor;
    uniform float sssIntensity;
    uniform float rimIntensity;
    uniform vec3 lightDirection;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying float vSwayAmount;

    // Cel-shading bands
    float celShade(float ndotl) {
      if (ndotl > 0.8) return 1.0;      // Highlight
      if (ndotl > 0.4) return 0.7;      // Light
      if (ndotl > 0.1) return 0.5;      // Mid
      return 0.3;                        // Shadow
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(lightDirection);

      // Basic diffuse lighting
      float ndotl = dot(normal, lightDir);

      // Cel-shaded diffuse
      float shade = celShade(ndotl);

      // Subsurface scattering approximation
      // Light passing through leaves from behind
      float sss = max(0.0, -dot(normal, lightDir));
      sss = pow(sss, 2.0) * sssIntensity;

      // Add translucency based on view angle and light
      float translucency = max(0.0, dot(viewDir, -lightDir));
      translucency = pow(translucency, 4.0) * sssIntensity * 0.5;

      // Rim lighting
      float rim = 1.0 - max(0.0, dot(normal, viewDir));
      rim = pow(rim, 3.0) * rimIntensity;

      // Combine colors
      vec3 diffuseColor = mix(shadowColor, baseColor, shade);
      vec3 sssContribution = sssColor * (sss + translucency);
      vec3 rimContribution = rimColor * rim;

      // Add slight color variation based on UV and sway
      float colorVariation = sin(vUv.x * 10.0 + vSwayAmount * 5.0) * 0.1 + 0.9;

      vec3 finalColor = diffuseColor * colorVariation + sssContribution + rimContribution;

      // Slight alpha variation for leaf edges (optional)
      float alpha = 1.0;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

/**
 * Create a foliage material with proper settings
 * @param {Object} options Material options
 * @returns {THREE.ShaderMaterial} Foliage material
 */
export function createFoliageMaterial(options = {}) {
  const uniforms = THREE.UniformsUtils.clone(FoliageShader.uniforms);

  // Apply custom options
  if (options.baseColor) {
    uniforms.baseColor.value = new THREE.Color(options.baseColor);
  }
  if (options.sssColor) {
    uniforms.sssColor.value = new THREE.Color(options.sssColor);
  }
  if (options.windStrength !== undefined) {
    uniforms.windStrength.value = options.windStrength;
  }
  if (options.lightDirection) {
    uniforms.lightDirection.value.copy(options.lightDirection);
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: FoliageShader.vertexShader,
    fragmentShader: FoliageShader.fragmentShader,
    side: options.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });

  return material;
}

/**
 * Grass patch with wind animation
 */
export class GrassPatch {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.time = 0;
    this.meshes = [];

    const count = options.count || 100;
    const spread = options.spread || 5;
    const position = options.position || new THREE.Vector3(0, 0, 0);

    // Create instanced grass blades
    this.createGrassInstances(count, spread, position, options);
  }

  createGrassInstances(count, spread, position, options) {
    // Create a simple grass blade geometry
    const bladeWidth = options.bladeWidth || 0.05;
    const bladeHeight = options.bladeHeight || 0.3;

    // Blade geometry (triangle strip approximation)
    const geometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      // Base
      -bladeWidth / 2, 0, 0,
      bladeWidth / 2, 0, 0,
      // Mid
      -bladeWidth / 3, bladeHeight * 0.5, 0,
      bladeWidth / 3, bladeHeight * 0.5, 0,
      // Tip
      0, bladeHeight, 0,
    ]);

    const indices = [
      0, 1, 2,
      1, 3, 2,
      2, 3, 4,
    ];

    // Normals (all facing forward)
    const normals = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
    ]);

    // UVs for color variation
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0, 0.5,
      1, 0.5,
      0.5, 1,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);

    // Create instanced mesh
    this.material = createFoliageMaterial({
      baseColor: options.color || 0x4CAF50,
      sssColor: 0x90EE90,
      doubleSided: true,
      ...options,
    });

    this.instancedMesh = new THREE.InstancedMesh(geometry, this.material, count);

    // Position instances
    const dummy = new THREE.Object3D();
    const colors = [];

    for (let i = 0; i < count; i++) {
      // Random position within spread
      const x = position.x + (Math.random() - 0.5) * spread;
      const z = position.z + (Math.random() - 0.5) * spread;

      dummy.position.set(x, position.y, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.scale.setScalar(0.8 + Math.random() * 0.4);
      dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, dummy.matrix);

      // Color variation
      const shade = 0.7 + Math.random() * 0.3;
      colors.push(shade, shade, shade);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Store world matrix for wind calculation
    this.material.uniforms.worldMatrix.value = this.instancedMesh.matrixWorld;

    this.scene.add(this.instancedMesh);
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.worldMatrix.value.copy(this.instancedMesh.matrixWorld);
  }

  setLightDirection(direction) {
    this.material.uniforms.lightDirection.value.copy(direction).normalize();
  }

  dispose() {
    this.scene.remove(this.instancedMesh);
    this.instancedMesh.geometry.dispose();
    this.material.dispose();
  }
}

/**
 * Tree/Bush foliage with wind animation
 */
export class Foliage {
  constructor(scene, mesh, options = {}) {
    this.scene = scene;
    this.mesh = mesh;
    this.time = 0;

    // Replace mesh material with foliage material
    this.originalMaterial = mesh.material;
    this.material = createFoliageMaterial({
      baseColor: options.color || 0x4CAF50,
      sssColor: options.sssColor || 0x90EE90,
      windStrength: options.windStrength || WIND_STRENGTH,
      ...options,
    });

    mesh.material = this.material;

    // Store reference to update world matrix
    this.material.uniforms.worldMatrix.value = mesh.matrixWorld;
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;
    this.material.uniforms.worldMatrix.value.copy(this.mesh.matrixWorld);
  }

  setLightDirection(direction) {
    this.material.uniforms.lightDirection.value.copy(direction).normalize();
  }

  dispose() {
    this.mesh.material = this.originalMaterial;
    this.material.dispose();
  }
}

/**
 * Flower with subtle sway
 */
export class Flower {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.time = 0;

    const position = options.position || new THREE.Vector3(0, 0, 0);
    const color = options.color || 0xFF69B4; // Hot pink default

    // Create flower geometry
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const petalGeometry = new THREE.CircleGeometry(0.08, 8);

    // Stem material (green foliage)
    this.stemMaterial = createFoliageMaterial({
      baseColor: 0x228B22,
      windStrength: 0.1,
    });

    // Petal material (with color)
    this.petalMaterial = createFoliageMaterial({
      baseColor: color,
      sssColor: new THREE.Color(color).addScalar(0.3),
      windStrength: 0.1,
    });

    // Create stem
    this.stem = new THREE.Mesh(stemGeometry, this.stemMaterial);
    this.stem.position.copy(position);
    this.stem.position.y += 0.15;

    // Create petals (5 arranged in circle)
    this.petals = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const petal = new THREE.Mesh(petalGeometry, this.petalMaterial);
      const angle = (i / 5) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.04, 0, Math.sin(angle) * 0.04);
      petal.rotation.x = -Math.PI / 2;
      petal.rotation.z = angle;
      this.petals.add(petal);
    }
    this.petals.position.copy(position);
    this.petals.position.y += 0.3;

    // Center
    const centerGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 0.01;
    this.petals.add(center);

    this.scene.add(this.stem);
    this.scene.add(this.petals);
  }

  update(deltaTime) {
    this.time += deltaTime;
    this.stemMaterial.uniforms.time.value = this.time;
    this.petalMaterial.uniforms.time.value = this.time;
  }

  /**
   * Trigger sway animation (when walked through)
   */
  triggerSway() {
    // Temporarily increase wind strength
    const originalStrength = this.stemMaterial.uniforms.windStrength.value;
    this.stemMaterial.uniforms.windStrength.value = 0.4;
    this.petalMaterial.uniforms.windStrength.value = 0.4;

    // Reset after delay
    setTimeout(() => {
      this.stemMaterial.uniforms.windStrength.value = originalStrength;
      this.petalMaterial.uniforms.windStrength.value = originalStrength;
    }, 500);
  }

  setLightDirection(direction) {
    this.stemMaterial.uniforms.lightDirection.value.copy(direction).normalize();
    this.petalMaterial.uniforms.lightDirection.value.copy(direction).normalize();
  }

  dispose() {
    this.scene.remove(this.stem);
    this.scene.remove(this.petals);
    this.stem.geometry.dispose();
    this.stemMaterial.dispose();
    this.petalMaterial.dispose();
  }
}

export { LEAF_COLOR, SSS_COLOR, WIND_STRENGTH, WIND_SPEED_X, WIND_SPEED_Z, SSS_INTENSITY };
