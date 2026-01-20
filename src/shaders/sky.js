/**
 * sky.js - Enhanced Sky Gradient Shader
 * Creates a gradient sky with sun disc, glow effects, and day/night transitions
 * Colors from spec: Day #87CEEB, Night #1E3A5F
 */

import * as THREE from 'three';

export class SkyShader {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.material = null;
    this.sunDirection = new THREE.Vector3(0.5, 0.7, 0.5).normalize();

    this.init();
  }

  init() {
    // Create a large sphere for the sky
    const geometry = new THREE.SphereGeometry(500, 64, 64);

    // Custom shader for gradient sky with sun disc
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        // Day colors
        topColor: { value: new THREE.Color(0x87CEEB) }, // Sky blue (day)
        bottomColor: { value: new THREE.Color(0xE0F0FF) }, // Lighter horizon

        // Night colors
        nightTopColor: { value: new THREE.Color(0x1E3A5F) }, // Night sky
        nightBottomColor: { value: new THREE.Color(0x0D1B2A) }, // Darker horizon at night

        // Sun properties
        sunDirection: { value: this.sunDirection },
        sunColor: { value: new THREE.Color(0xFFE4B5) }, // Warm sun color
        sunSize: { value: 0.04 }, // Sun disc size
        sunGlowSize: { value: 0.2 }, // Glow around sun
        sunGlowIntensity: { value: 0.5 },

        // Moon properties (for night)
        moonColor: { value: new THREE.Color(0xE8E8E8) },
        moonSize: { value: 0.025 },

        // Time and transitions
        timeOfDay: { value: 0.0 }, // 0 = day, 1 = night
        offset: { value: 33 },
        exponent: { value: 0.6 },

        // Atmospheric scattering (subtle)
        atmosphereColor: { value: new THREE.Color(0xFFD700) },
        atmosphereIntensity: { value: 0.1 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vPosition;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 nightTopColor;
        uniform vec3 nightBottomColor;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform float sunSize;
        uniform float sunGlowSize;
        uniform float sunGlowIntensity;
        uniform vec3 moonColor;
        uniform float moonSize;
        uniform float timeOfDay;
        uniform float offset;
        uniform float exponent;
        uniform vec3 atmosphereColor;
        uniform float atmosphereIntensity;

        varying vec3 vWorldPosition;
        varying vec3 vPosition;

        void main() {
          // Calculate gradient based on height
          float h = normalize(vWorldPosition + offset).y;
          h = clamp(pow(max(h, 0.0), exponent), 0.0, 1.0);

          // Day colors
          vec3 dayColor = mix(bottomColor, topColor, h);

          // Night colors
          vec3 nightColor = mix(nightBottomColor, nightTopColor, h);

          // Mix based on time of day
          vec3 skyColor = mix(dayColor, nightColor, timeOfDay);

          // Sun disc calculation
          vec3 worldDir = normalize(vWorldPosition);

          // Sun position (moves based on time of day)
          vec3 currentSunDir = sunDirection;

          // Calculate distance from sun
          float sunDist = distance(worldDir, currentSunDir);

          // Sun disc with sharp edge (per spec)
          // float sun = smoothstep(0.05, 0.03, sunDist);
          float sun = smoothstep(sunSize + 0.01, sunSize - 0.01, sunDist);

          // Sun glow (soft halo around sun)
          float sunGlow = smoothstep(sunGlowSize, sunSize, sunDist) * sunGlowIntensity;

          // Apply sun disc and glow (fade during night)
          float sunVisibility = 1.0 - timeOfDay;
          vec3 sunContribution = sunColor * (sun + sunGlow) * sunVisibility;
          skyColor = mix(skyColor, sunColor, (sun + sunGlow) * sunVisibility);

          // Moon at night (opposite direction)
          vec3 moonDir = -currentSunDir;
          moonDir.y = abs(moonDir.y); // Keep moon above horizon
          float moonDist = distance(worldDir, moonDir);
          float moon = smoothstep(moonSize + 0.005, moonSize - 0.005, sunDist > 0.5 ? moonDist : 1.0);
          float moonGlow = smoothstep(0.1, 0.03, moonDist) * 0.3;

          // Apply moon (fade during day)
          float moonVisibility = timeOfDay;
          skyColor = mix(skyColor, moonColor, (moon + moonGlow) * moonVisibility);

          // Atmospheric scattering near horizon (sunset/sunrise effect)
          float horizonFactor = 1.0 - abs(h - 0.3);
          horizonFactor = max(0.0, horizonFactor);
          horizonFactor = pow(horizonFactor, 3.0);

          // Add warm atmosphere color during transitions
          float transitionFactor = 1.0 - abs(timeOfDay - 0.5) * 2.0; // Peak at 0.5
          vec3 atmosphere = atmosphereColor * horizonFactor * atmosphereIntensity * transitionFactor;
          skyColor += atmosphere;

          // Add subtle stars at night
          float starIntensity = timeOfDay * 0.3;
          float starNoise = fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233))) * 43758.5453);
          float star = step(0.998, starNoise) * starIntensity;
          skyColor += vec3(star);

          gl_FragColor = vec4(skyColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  /**
   * Set the time of day (affects sky gradient and sun position)
   * @param {number} time 0 = day, 1 = night
   */
  setTimeOfDay(time) {
    if (this.material) {
      this.material.uniforms.timeOfDay.value = time;

      // Animate sun position based on time
      // Sun moves from east to west as day progresses
      const sunAngle = time * Math.PI; // 0 to PI
      this.sunDirection.set(
        Math.cos(sunAngle) * 0.5,
        0.3 + (1.0 - Math.abs(time - 0.5) * 2) * 0.5, // Higher at noon
        Math.sin(sunAngle) * 0.5
      ).normalize();
      this.material.uniforms.sunDirection.value = this.sunDirection;
    }
  }

  /**
   * Set custom colors
   * @param {Object} colors Color configuration
   */
  setColors(colors) {
    if (this.material) {
      if (colors.dayTop) {
        this.material.uniforms.topColor.value = new THREE.Color(colors.dayTop);
      }
      if (colors.dayBottom) {
        this.material.uniforms.bottomColor.value = new THREE.Color(colors.dayBottom);
      }
      if (colors.nightTop) {
        this.material.uniforms.nightTopColor.value = new THREE.Color(colors.nightTop);
      }
      if (colors.nightBottom) {
        this.material.uniforms.nightBottomColor.value = new THREE.Color(colors.nightBottom);
      }
      if (colors.sun) {
        this.material.uniforms.sunColor.value = new THREE.Color(colors.sun);
      }
    }
  }

  /**
   * Set sun direction directly
   * @param {THREE.Vector3} direction Normalized direction to sun
   */
  setSunDirection(direction) {
    this.sunDirection.copy(direction).normalize();
    if (this.material) {
      this.material.uniforms.sunDirection.value = this.sunDirection;
    }
  }

  /**
   * Get the current sun direction (for use by lighting system)
   * @returns {THREE.Vector3}
   */
  getSunDirection() {
    return this.sunDirection.clone();
  }

  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.material.dispose();
      this.scene.remove(this.mesh);
    }
  }
}

/**
 * Create a simple sun/moon object (for adding to scene if desired)
 */
export function createCelestialBody(isSun = true) {
  const size = isSun ? 5 : 3;
  const color = isSun ? 0xFFD700 : 0xE8E8E8;

  const geometry = new THREE.SphereGeometry(size, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
  });

  const mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

/**
 * Create a procedural star field for night sky (optional enhancement)
 * @param {number} count Number of stars
 * @returns {THREE.Points}
 */
export function createStarField(count = 1000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Random position on sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 450; // Inside sky sphere

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)); // Only upper hemisphere
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    sizes[i] = Math.random() * 2 + 0.5;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 1,
    transparent: true,
    opacity: 0,
    sizeAttenuation: false,
  });

  const stars = new THREE.Points(geometry, material);
  stars.userData.material = material;

  return stars;
}
