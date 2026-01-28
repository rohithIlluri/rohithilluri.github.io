/**
 * sky.js - Messenger-Style Sky Shader
 * Creates turquoise gradient sky with brush-stroke clouds
 * Colors from messenger.abeto.co: Primary #5BBFBA (turquoise)
 */

import * as THREE from 'three';
import { MESSENGER_PALETTE } from '../constants/colors.js';

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
    // Using messenger.abeto.co turquoise palette
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        // Day colors - messenger turquoise style
        topColor: { value: new THREE.Color(MESSENGER_PALETTE.SKY_PRIMARY) }, // #5BBFBA turquoise
        bottomColor: { value: new THREE.Color(MESSENGER_PALETTE.SKY_LIGHT) }, // #7DD1CD lighter teal

        // Night colors
        nightTopColor: { value: new THREE.Color(MESSENGER_PALETTE.NIGHT_ZENITH) }, // #1B2838
        nightBottomColor: { value: new THREE.Color(MESSENGER_PALETTE.NIGHT_HORIZON) }, // #2A3848

        // Sun properties - subtle, not overwhelming
        sunDirection: { value: this.sunDirection },
        sunColor: { value: new THREE.Color(0xFFF8E8) }, // Soft warm white
        sunSize: { value: 0.03 }, // Smaller sun disc
        sunGlowSize: { value: 0.15 }, // Smaller glow
        sunGlowIntensity: { value: 0.3 }, // Subtle glow

        // Moon properties (for night)
        moonColor: { value: new THREE.Color(0xE8E8E8) },
        moonSize: { value: 0.02 },

        // Time and transitions
        timeOfDay: { value: 0.0 }, // 0 = day, 1 = night
        offset: { value: 33 },
        exponent: { value: 0.4 }, // Flatter gradient for more solid turquoise

        // Atmospheric scattering (very subtle)
        atmosphereColor: { value: new THREE.Color(MESSENGER_PALETTE.YELLOW_ACCENT) },
        atmosphereIntensity: { value: 0.05 }, // Very subtle

        // Cloud properties - painterly brush-stroke style with dramatic presence
        uTime: { value: 0.0 },
        cloudColor: { value: new THREE.Color(MESSENGER_PALETTE.CLOUD_WHITE) }, // Pure white
        cloudShadowColor: { value: new THREE.Color(MESSENGER_PALETTE.CLOUD_SHADOW) }, // Light shadow
        cloudDensity: { value: 0.65 }, // More prominent clouds
        cloudSpeed: { value: 0.015 }, // Slower drift
        cloudScale: { value: 3.0 }, // Larger, more dramatic cloud forms
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

        // Cloud uniforms
        uniform float uTime;
        uniform vec3 cloudColor;
        uniform vec3 cloudShadowColor;
        uniform float cloudDensity;
        uniform float cloudSpeed;
        uniform float cloudScale;

        varying vec3 vWorldPosition;
        varying vec3 vPosition;

        // Simplex noise functions for brush-stroke clouds
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }

        // Fractal Brownian Motion for painterly cloud texture
        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;

          for (int i = 0; i < 5; i++) {
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          return value;
        }

        // Brush-stroke cloud function
        float brushStrokeClouds(vec3 pos, float time) {
          // Multiple layers for depth
          vec3 cloudPos = pos * cloudScale;
          cloudPos.x += time * cloudSpeed * 10.0;

          // Main cloud shape with brush-stroke distortion
          float cloud = fbm(cloudPos);

          // Add brush-stroke texture with varying frequencies
          float brushStroke = snoise(cloudPos * 2.5 + vec3(time * 0.1)) * 0.3;
          brushStroke += snoise(cloudPos * 5.0 - vec3(time * 0.05)) * 0.15;

          cloud += brushStroke;

          // Shape the clouds to be more puffy and painterly
          cloud = smoothstep(-0.2, 0.6, cloud);

          // Add wispy edges
          float wisp = snoise(cloudPos * 8.0 + vec3(0.0, time * 0.02, 0.0)) * 0.1;
          cloud = mix(cloud, cloud + wisp, 0.5);

          return cloud;
        }

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
          float sun = smoothstep(sunSize + 0.01, sunSize - 0.01, sunDist);

          // Sun glow (soft halo around sun)
          float sunGlow = smoothstep(sunGlowSize, sunSize, sunDist) * sunGlowIntensity;

          // Apply sun disc and glow (fade during night)
          float sunVisibility = 1.0 - timeOfDay;
          vec3 sunContribution = sunColor * (sun + sunGlow) * sunVisibility;
          skyColor = mix(skyColor, sunColor, (sun + sunGlow) * sunVisibility);

          // === BRUSH-STROKE CLOUDS ===
          // Only show clouds above horizon and during day
          float cloudHeight = smoothstep(0.1, 0.7, h); // Clouds in upper sky
          float cloudVisibility = (1.0 - timeOfDay) * cloudHeight; // Fade at night

          if (cloudVisibility > 0.01) {
            // Calculate cloud value
            float clouds = brushStrokeClouds(worldDir, uTime);
            clouds *= cloudDensity * cloudVisibility;

            // Create soft cloud shading (lit from sun direction)
            float cloudLighting = dot(worldDir, currentSunDir) * 0.5 + 0.5;
            cloudLighting = smoothstep(0.3, 0.8, cloudLighting);

            // Mix cloud color with shadow color based on lighting
            vec3 finalCloudColor = mix(cloudShadowColor, cloudColor, cloudLighting);

            // Apply clouds with soft blending (painterly effect)
            skyColor = mix(skyColor, finalCloudColor, clouds * 0.7);

            // Add subtle cloud highlight near sun
            float sunProximity = 1.0 - smoothstep(0.0, 0.5, sunDist);
            skyColor += finalCloudColor * clouds * sunProximity * 0.15;
          }

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

  /**
   * Update method for cloud animation
   * @param {number} deltaTime Time since last frame in seconds
   */
  update(deltaTime) {
    if (this.material && this.material.uniforms.uTime) {
      this.material.uniforms.uTime.value += deltaTime;
    }
  }

  /**
   * Set cloud parameters
   * @param {Object} params Cloud configuration
   */
  setCloudParams(params) {
    if (this.material) {
      if (params.density !== undefined) {
        this.material.uniforms.cloudDensity.value = params.density;
      }
      if (params.speed !== undefined) {
        this.material.uniforms.cloudSpeed.value = params.speed;
      }
      if (params.scale !== undefined) {
        this.material.uniforms.cloudScale.value = params.scale;
      }
      if (params.color) {
        this.material.uniforms.cloudColor.value = new THREE.Color(params.color);
      }
      if (params.shadowColor) {
        this.material.uniforms.cloudShadowColor.value = new THREE.Color(params.shadowColor);
      }
    }
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
