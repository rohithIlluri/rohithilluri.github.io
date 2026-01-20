/**
 * PostProcessing.js - Full Post-Processing Pipeline
 * Implements bloom, vignette, and optional SSAO per visual quality spec
 * Using Three.js EffectComposer with custom passes
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Visual quality constants from spec
const BLOOM_THRESHOLD = 0.85;
const BLOOM_INTENSITY = 0.15;
const BLOOM_RADIUS = 0.4;
const VIGNETTE_INTENSITY = 0.15;
const VIGNETTE_COLOR = new THREE.Color(0x1A1A2E);
const OUTLINE_COLOR = new THREE.Color(0x1A1A2E); // Dark blue-ish outline per spec
const OUTLINE_THICKNESS = 1.5; // Thickness in pixels

/**
 * Custom Vignette Shader
 * Creates soft edge darkening with customizable color
 */
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 },
    vignetteColor: { value: VIGNETTE_COLOR },
    useColor: { value: true },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    uniform vec3 vignetteColor;
    uniform bool useColor;

    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);

      // Calculate vignette factor
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - dot(uv, uv);
      vignette = clamp(vignette, 0.0, 1.0);
      vignette = smoothstep(0.0, 1.0, vignette);

      // Apply vignette
      float vignetteAmount = 1.0 - (1.0 - vignette) * darkness;

      if (useColor) {
        // Blend with vignette color
        vec3 finalColor = mix(vignetteColor, texel.rgb, vignetteAmount);
        gl_FragColor = vec4(finalColor, texel.a);
      } else {
        // Simple darkening
        gl_FragColor = vec4(texel.rgb * vignetteAmount, texel.a);
      }
    }
  `,
};

/**
 * Edge Detection Outline Shader (Sobel filter on depth/luminance)
 * Creates thick black outlines on all objects - messenger.abeto.co style
 */
const OutlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    outlineColor: { value: OUTLINE_COLOR },
    thickness: { value: OUTLINE_THICKNESS },
    threshold: { value: 0.15 }, // Edge detection sensitivity
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform vec3 outlineColor;
    uniform float thickness;
    uniform float threshold;

    varying vec2 vUv;

    float getLuminance(vec3 color) {
      return dot(color, vec3(0.299, 0.587, 0.114));
    }

    void main() {
      vec2 texelSize = thickness / resolution;
      vec4 center = texture2D(tDiffuse, vUv);
      float centerLum = getLuminance(center.rgb);

      // Sobel edge detection kernel
      // Sample 8 neighboring pixels
      float tl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, -texelSize.y)).rgb);
      float t  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, -texelSize.y)).rgb);
      float tr = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, -texelSize.y)).rgb);
      float l  = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, 0.0)).rgb);
      float r  = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, 0.0)).rgb);
      float bl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, texelSize.y)).rgb);
      float b  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, texelSize.y)).rgb);
      float br = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, texelSize.y)).rgb);

      // Sobel operators
      float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
      float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;

      // Edge magnitude
      float edge = sqrt(gx*gx + gy*gy);

      // Apply threshold and create hard edge
      float edgeFactor = step(threshold, edge);

      // Mix outline color with original
      vec3 finalColor = mix(center.rgb, outlineColor, edgeFactor);

      gl_FragColor = vec4(finalColor, center.a);
    }
  `,
};

/**
 * Gamma correction shader (replaces OutputPass for compatibility)
 */
const GammaCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    varying vec2 vUv;

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      gl_FragColor = tex;
      gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
    }
  `,
};

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;

    // Effect parameters (per spec)
    this.bloomEnabled = true;
    this.bloomThreshold = BLOOM_THRESHOLD;
    this.bloomIntensity = BLOOM_INTENSITY;
    this.bloomRadius = BLOOM_RADIUS;

    this.vignetteEnabled = true;
    this.vignetteIntensity = VIGNETTE_INTENSITY;

    // Outline settings
    this.outlineEnabled = true;
    this.outlineThickness = OUTLINE_THICKNESS;
    this.outlineThreshold = 0.15;

    // Composer and passes
    this.composer = null;
    this.renderPass = null;
    this.bloomPass = null;
    this.outlinePass = null;
    this.vignettePass = null;
    this.gammaPass = null;

    this.init();
  }

  /**
   * Initialize post-processing pipeline
   */
  init() {
    try {
      const size = this.renderer.getSize(new THREE.Vector2());
      const pixelRatio = this.renderer.getPixelRatio();

      // Create effect composer
      this.composer = new EffectComposer(this.renderer);

      // 1. Render Pass - Base scene rendering
      this.renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(this.renderPass);

      // 2. Outline Pass - Thick black outlines (messenger.abeto.co style)
      this.outlinePass = new ShaderPass(OutlineShader);
      this.outlinePass.uniforms.resolution.value.set(size.x * pixelRatio, size.y * pixelRatio);
      this.outlinePass.uniforms.thickness.value = this.outlineThickness;
      this.outlinePass.uniforms.threshold.value = this.outlineThreshold;
      this.outlinePass.enabled = this.outlineEnabled;
      this.composer.addPass(this.outlinePass);

      // 3. Bloom Pass - Subtle glow for emissive elements
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.x, size.y),
        this.bloomIntensity,
        this.bloomRadius,
        this.bloomThreshold
      );
      this.bloomPass.enabled = this.bloomEnabled;
      this.composer.addPass(this.bloomPass);

      // 4. Vignette Pass - Edge darkening
      this.vignettePass = new ShaderPass(VignetteShader);
      this.vignettePass.uniforms.darkness.value = this.vignetteIntensity;
      this.vignettePass.uniforms.offset.value = 1.0;
      this.vignettePass.enabled = this.vignetteEnabled;
      this.composer.addPass(this.vignettePass);

      // 5. Gamma correction pass (for proper color output)
      this.gammaPass = new ShaderPass(GammaCorrectionShader);
      this.composer.addPass(this.gammaPass);

      this.enabled = true;
      console.log('Post-processing initialized successfully');
    } catch (error) {
      console.error('Failed to initialize post-processing:', error);
      this.enabled = false;
    }
  }

  /**
   * Set bloom parameters
   * @param {Object} options Bloom options
   */
  setBloom(options = {}) {
    if (options.enabled !== undefined) {
      this.bloomEnabled = options.enabled;
      if (this.bloomPass) this.bloomPass.enabled = options.enabled;
    }
    if (options.threshold !== undefined) {
      this.bloomThreshold = options.threshold;
      if (this.bloomPass) this.bloomPass.threshold = options.threshold;
    }
    if (options.intensity !== undefined) {
      this.bloomIntensity = options.intensity;
      if (this.bloomPass) this.bloomPass.strength = options.intensity;
    }
    if (options.radius !== undefined) {
      this.bloomRadius = options.radius;
      if (this.bloomPass) this.bloomPass.radius = options.radius;
    }
  }

  /**
   * Set vignette parameters
   * @param {Object} options Vignette options
   */
  setVignette(options = {}) {
    if (options.enabled !== undefined) {
      this.vignetteEnabled = options.enabled;
      if (this.vignettePass) this.vignettePass.enabled = options.enabled;
    }
    if (options.intensity !== undefined) {
      this.vignetteIntensity = options.intensity;
      if (this.vignettePass) {
        this.vignettePass.uniforms.darkness.value = options.intensity;
      }
    }
    if (options.color !== undefined) {
      if (this.vignettePass) {
        this.vignettePass.uniforms.vignetteColor.value = new THREE.Color(options.color);
      }
    }
  }

  /**
   * Set outline parameters
   * @param {Object} options Outline options
   */
  setOutline(options = {}) {
    if (options.enabled !== undefined) {
      this.outlineEnabled = options.enabled;
      if (this.outlinePass) this.outlinePass.enabled = options.enabled;
    }
    if (options.thickness !== undefined) {
      this.outlineThickness = options.thickness;
      if (this.outlinePass) {
        this.outlinePass.uniforms.thickness.value = options.thickness;
      }
    }
    if (options.threshold !== undefined) {
      this.outlineThreshold = options.threshold;
      if (this.outlinePass) {
        this.outlinePass.uniforms.threshold.value = options.threshold;
      }
    }
    if (options.color !== undefined) {
      if (this.outlinePass) {
        this.outlinePass.uniforms.outlineColor.value = new THREE.Color(options.color);
      }
    }
  }

  /**
   * Apply quality preset
   * @param {string} quality 'low', 'medium', or 'high'
   */
  setQualityPreset(quality) {
    switch (quality) {
      case 'low':
        this.setBloom({ enabled: false });
        this.setOutline({ enabled: true, thickness: 1.0, threshold: 0.2 });
        this.setVignette({ enabled: true, intensity: 0.1 });
        break;

      case 'medium':
        this.setBloom({
          enabled: true,
          threshold: 0.9,
          intensity: 0.1,
          radius: 0.3,
        });
        this.setOutline({ enabled: true, thickness: 1.5, threshold: 0.15 });
        this.setVignette({ enabled: true, intensity: 0.15 });
        break;

      case 'high':
      default:
        this.setBloom({
          enabled: true,
          threshold: BLOOM_THRESHOLD,
          intensity: BLOOM_INTENSITY,
          radius: BLOOM_RADIUS,
        });
        this.setOutline({ enabled: true, thickness: OUTLINE_THICKNESS, threshold: 0.12 });
        this.setVignette({ enabled: true, intensity: VIGNETTE_INTENSITY });
        break;
    }
  }

  /**
   * Enable or disable post-processing
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Update camera reference (needed after camera changes)
   * @param {THREE.Camera} camera
   */
  setCamera(camera) {
    this.camera = camera;
    if (this.renderPass) {
      this.renderPass.camera = camera;
    }
  }

  /**
   * Render with post-processing
   */
  render() {
    if (this.enabled && this.composer) {
      this.composer.render();
    } else {
      // Direct rendering fallback
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Handle window resize
   * @param {number} width
   * @param {number} height
   */
  onResize(width, height) {
    const pixelRatio = this.renderer.getPixelRatio();

    if (this.composer) {
      this.composer.setSize(width, height);
    }

    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }

    // Update outline pass resolution for consistent outline thickness
    if (this.outlinePass) {
      this.outlinePass.uniforms.resolution.value.set(
        width * pixelRatio,
        height * pixelRatio
      );
    }
  }

  dispose() {
    if (this.composer) {
      // Dispose render targets
      if (this.composer.renderTarget1) this.composer.renderTarget1.dispose();
      if (this.composer.renderTarget2) this.composer.renderTarget2.dispose();
    }

    // Dispose passes
    if (this.bloomPass) {
      this.bloomPass.dispose();
    }
  }
}

// Export shaders for potential reuse
export { VignetteShader, GammaCorrectionShader, OutlineShader };
