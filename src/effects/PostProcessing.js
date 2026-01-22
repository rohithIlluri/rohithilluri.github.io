/**
 * PostProcessing.js - Full Post-Processing Pipeline
 * Implements animated sketch outlines, color grading, and FXAA
 * Style matching messenger.abeto.co
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { MESSENGER_PALETTE } from '../constants/colors.js';

// Visual quality constants - messenger.abeto.co style
const BLOOM_THRESHOLD = 0.95;     // Higher threshold - subtle bloom only
const BLOOM_INTENSITY = 0.1;      // Reduced for cleaner look
const BLOOM_RADIUS = 0.3;         // Tighter bloom
const VIGNETTE_INTENSITY = 0.08;  // Very subtle vignette
const VIGNETTE_COLOR = new THREE.Color(MESSENGER_PALETTE.SHADOW_TINT);
const OUTLINE_COLOR = new THREE.Color(MESSENGER_PALETTE.OUTLINE_PRIMARY);
const OUTLINE_THICKNESS = 2.0;    // Sketch-style outlines

// SSAO settings - subtle blue-gray shadows
const SSAO_RADIUS = 0.4;          // Moderate radius
const SSAO_INTENSITY = 0.2;       // Subtle, not aggressive
const SSAO_BIAS = 0.02;
const SSAO_COLOR = new THREE.Color(MESSENGER_PALETTE.SHADOW_TINT); // Blue-gray, never black

// Color grading - messenger.abeto.co muted palette
const COLOR_GRADE = {
  saturation: 0.95,   // Slightly desaturated for muted look
  contrast: 1.02,     // Very subtle contrast
  shadowsLift: 0.02,  // Lifted shadows (no pure black)
  highlights: 0.98,   // Soft highlights
  temperature: 0.01,  // Very slight warmth
  tint: 0.005,        // Minimal tint
};

// Film grain - removed for cleaner messenger style
const FILM_GRAIN = {
  intensity: 0.0,     // Disabled - messenger has clean look
  size: 1.0,
};

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
 * Clean Static Outline Shader
 * Creates crisp, graphic novel-style outlines matching messenger.abeto.co
 * NO animation - clean, static lines
 */
const OutlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uOutlineColor: { value: OUTLINE_COLOR },
    uLineWidth: { value: OUTLINE_THICKNESS },
    uThreshold: { value: 0.12 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform vec3 uOutlineColor;
    uniform float uLineWidth;
    uniform float uThreshold;

    varying vec2 vUv;

    float getLuminance(vec3 color) {
      return dot(color, vec3(0.299, 0.587, 0.114));
    }

    void main() {
      vec2 texelSize = uLineWidth / uResolution;
      vec4 center = texture2D(tDiffuse, vUv);

      // Clean Sobel edge detection (no animation, no noise)
      float tl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, -texelSize.y)).rgb);
      float t  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, -texelSize.y)).rgb);
      float tr = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, -texelSize.y)).rgb);
      float l  = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, 0.0)).rgb);
      float r  = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, 0.0)).rgb);
      float bl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, texelSize.y)).rgb);
      float b  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, texelSize.y)).rgb);
      float br = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, texelSize.y)).rgb);

      // Sobel gradient calculation
      float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
      float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
      float edge = sqrt(gx*gx + gy*gy);

      // Clean threshold - no noise variation
      float lineMask = smoothstep(uThreshold - 0.02, uThreshold + 0.02, edge);

      // Mix outline color with original - clean, static result
      vec3 finalColor = mix(center.rgb, uOutlineColor, lineMask);

      gl_FragColor = vec4(finalColor, center.a);
    }
  `,
};

/**
 * Color Grading Shader
 * Applies saturation, contrast, color temperature, and tonal adjustments
 */
const ColorGradingShader = {
  uniforms: {
    tDiffuse: { value: null },
    saturation: { value: COLOR_GRADE.saturation },
    contrast: { value: COLOR_GRADE.contrast },
    shadowsLift: { value: COLOR_GRADE.shadowsLift },
    highlights: { value: COLOR_GRADE.highlights },
    temperature: { value: COLOR_GRADE.temperature },
    tint: { value: COLOR_GRADE.tint },
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
    uniform float saturation;
    uniform float contrast;
    uniform float shadowsLift;
    uniform float highlights;
    uniform float temperature;
    uniform float tint;

    varying vec2 vUv;

    vec3 adjustSaturation(vec3 color, float sat) {
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(vec3(luminance), color, sat);
    }

    vec3 adjustContrast(vec3 color, float con) {
      return (color - 0.5) * con + 0.5;
    }

    vec3 applyLift(vec3 color, float lift) {
      // Lift shadows more than highlights
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      float shadowAmount = 1.0 - smoothstep(0.0, 0.5, luminance);
      return color + lift * shadowAmount;
    }

    vec3 applyHighlights(vec3 color, float highlight) {
      // Reduce highlights
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      float highlightAmount = smoothstep(0.5, 1.0, luminance);
      return color * mix(1.0, highlight, highlightAmount);
    }

    vec3 applyTemperature(vec3 color, float temp) {
      // Warm shift: increase red, decrease blue
      color.r += temp;
      color.b -= temp * 0.5;
      return color;
    }

    vec3 applyTint(vec3 color, float t) {
      // Magenta tint: increase red and blue, decrease green
      color.r += t;
      color.g -= t;
      color.b += t;
      return color;
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 color = texel.rgb;

      // Apply adjustments in order
      color = adjustSaturation(color, saturation);
      color = adjustContrast(color, contrast);
      color = applyLift(color, shadowsLift);
      color = applyHighlights(color, highlights);
      color = applyTemperature(color, temperature);
      color = applyTint(color, tint);

      // Clamp to valid range
      color = clamp(color, 0.0, 1.0);

      gl_FragColor = vec4(color, texel.a);
    }
  `,
};

/**
 * Film Grain Shader
 * Adds subtle animated noise for lo-fi aesthetic
 */
const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    intensity: { value: FILM_GRAIN.intensity },
    size: { value: FILM_GRAIN.size },
    resolution: { value: new THREE.Vector2(1, 1) },
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
    uniform float time;
    uniform float intensity;
    uniform float size;
    uniform vec2 resolution;

    varying vec2 vUv;

    // Simple noise function
    float random(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);

      // Generate noise based on screen position and time
      vec2 noiseCoord = vUv * resolution / size;
      float noise = random(noiseCoord + time) * 2.0 - 1.0;

      // Apply luminance-only grain (no color noise)
      float luminance = dot(texel.rgb, vec3(0.299, 0.587, 0.114));

      // Reduce grain in very dark and very bright areas
      float grainMask = smoothstep(0.0, 0.2, luminance) * smoothstep(1.0, 0.8, luminance);

      // Apply grain
      vec3 finalColor = texel.rgb + noise * intensity * grainMask;

      gl_FragColor = vec4(finalColor, texel.a);
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

    // SSAO settings
    this.ssaoEnabled = true;
    this.ssaoRadius = SSAO_RADIUS;
    this.ssaoIntensity = SSAO_INTENSITY;

    // Color grading settings
    this.colorGradingEnabled = true;

    // Film grain settings
    this.filmGrainEnabled = true;
    this.filmGrainIntensity = FILM_GRAIN.intensity;

    // FXAA settings
    this.fxaaEnabled = true;

    // Composer and passes
    this.composer = null;
    this.renderPass = null;
    this.saoPass = null;
    this.bloomPass = null;
    this.outlinePass = null;
    this.colorGradingPass = null;
    this.filmGrainPass = null;
    this.vignettePass = null;
    this.fxaaPass = null;
    this.gammaPass = null;

    // Time for animated effects
    this.time = 0;

    this.init();
  }

  /**
   * Initialize post-processing pipeline
   */
  init() {
    try {
      const size = this.renderer.getSize(new THREE.Vector2());
      const pixelRatio = this.renderer.getPixelRatio();

      // Create effect composer with depth buffer for SSAO
      const renderTarget = new THREE.WebGLRenderTarget(
        size.x * pixelRatio,
        size.y * pixelRatio,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: false,
          depthBuffer: true,
          depthTexture: new THREE.DepthTexture(),
        }
      );
      renderTarget.depthTexture.format = THREE.DepthFormat;
      renderTarget.depthTexture.type = THREE.UnsignedShortType;

      this.composer = new EffectComposer(this.renderer, renderTarget);

      // 1. Render Pass - Base scene rendering
      this.renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(this.renderPass);

      // 2. SAO Pass - Screen-Space Ambient Occlusion
      try {
        this.saoPass = new SAOPass(this.scene, this.camera, false, true);
        this.saoPass.params.saoBias = SSAO_BIAS;
        this.saoPass.params.saoIntensity = SSAO_INTENSITY;
        this.saoPass.params.saoScale = SSAO_RADIUS * 100; // Scale for visible effect
        this.saoPass.params.saoKernelRadius = 100;
        this.saoPass.params.saoMinResolution = 0;
        this.saoPass.params.saoBlur = true;
        this.saoPass.params.saoBlurRadius = 8;
        this.saoPass.params.saoBlurStdDev = 4;
        this.saoPass.params.saoBlurDepthCutoff = 0.01;
        this.saoPass.enabled = this.ssaoEnabled;
        this.composer.addPass(this.saoPass);
      } catch (e) {
        console.warn('SAO Pass not available, skipping SSAO:', e);
        this.ssaoEnabled = false;
      }

      // 3. Outline Pass - Clean static outlines (graphic novel style)
      this.outlinePass = new ShaderPass(OutlineShader);
      this.outlinePass.uniforms.uResolution.value.set(size.x * pixelRatio, size.y * pixelRatio);
      this.outlinePass.uniforms.uLineWidth.value = this.outlineThickness;
      this.outlinePass.uniforms.uThreshold.value = this.outlineThreshold;
      this.outlinePass.enabled = this.outlineEnabled;
      this.composer.addPass(this.outlinePass);

      // 4. Bloom Pass - Subtle glow for emissive elements
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.x, size.y),
        this.bloomIntensity,
        this.bloomRadius,
        this.bloomThreshold
      );
      this.bloomPass.enabled = this.bloomEnabled;
      this.composer.addPass(this.bloomPass);

      // 5. Color Grading Pass - Lo-fi warm aesthetic
      this.colorGradingPass = new ShaderPass(ColorGradingShader);
      this.colorGradingPass.enabled = this.colorGradingEnabled;
      this.composer.addPass(this.colorGradingPass);

      // 6. Film Grain Pass - Subtle animated grain
      this.filmGrainPass = new ShaderPass(FilmGrainShader);
      this.filmGrainPass.uniforms.resolution.value.set(size.x * pixelRatio, size.y * pixelRatio);
      this.filmGrainPass.uniforms.intensity.value = this.filmGrainIntensity;
      this.filmGrainPass.enabled = this.filmGrainEnabled;
      this.composer.addPass(this.filmGrainPass);

      // 7. Vignette Pass - Edge darkening
      this.vignettePass = new ShaderPass(VignetteShader);
      this.vignettePass.uniforms.darkness.value = this.vignetteIntensity;
      this.vignettePass.uniforms.offset.value = 1.0;
      this.vignettePass.enabled = this.vignetteEnabled;
      this.composer.addPass(this.vignettePass);

      // 8. FXAA Pass - Anti-aliasing
      this.fxaaPass = new ShaderPass(FXAAShader);
      this.fxaaPass.uniforms['resolution'].value.set(
        1 / (size.x * pixelRatio),
        1 / (size.y * pixelRatio)
      );
      this.fxaaPass.enabled = this.fxaaEnabled;
      this.composer.addPass(this.fxaaPass);

      // 9. Gamma correction pass (for proper color output)
      this.gammaPass = new ShaderPass(GammaCorrectionShader);
      this.composer.addPass(this.gammaPass);

      this.enabled = true;
      console.log('Post-processing initialized with SSAO, color grading, film grain, and FXAA');
    } catch (error) {
      console.error('Failed to initialize post-processing:', error);
      this.enabled = false;
    }
  }

  /**
   * Set SSAO parameters
   * @param {Object} options SSAO options
   */
  setSSAO(options = {}) {
    if (options.enabled !== undefined) {
      this.ssaoEnabled = options.enabled;
      if (this.saoPass) this.saoPass.enabled = options.enabled;
    }
    if (options.radius !== undefined && this.saoPass) {
      this.ssaoRadius = options.radius;
      this.saoPass.params.saoScale = options.radius * 100;
    }
    if (options.intensity !== undefined && this.saoPass) {
      this.ssaoIntensity = options.intensity;
      this.saoPass.params.saoIntensity = options.intensity;
    }
  }

  /**
   * Set color grading parameters
   * @param {Object} options Color grading options
   */
  setColorGrading(options = {}) {
    if (options.enabled !== undefined) {
      this.colorGradingEnabled = options.enabled;
      if (this.colorGradingPass) this.colorGradingPass.enabled = options.enabled;
    }
    if (this.colorGradingPass) {
      if (options.saturation !== undefined) {
        this.colorGradingPass.uniforms.saturation.value = options.saturation;
      }
      if (options.contrast !== undefined) {
        this.colorGradingPass.uniforms.contrast.value = options.contrast;
      }
      if (options.temperature !== undefined) {
        this.colorGradingPass.uniforms.temperature.value = options.temperature;
      }
    }
  }

  /**
   * Set film grain parameters
   * @param {Object} options Film grain options
   */
  setFilmGrain(options = {}) {
    if (options.enabled !== undefined) {
      this.filmGrainEnabled = options.enabled;
      if (this.filmGrainPass) this.filmGrainPass.enabled = options.enabled;
    }
    if (options.intensity !== undefined) {
      this.filmGrainIntensity = options.intensity;
      if (this.filmGrainPass) {
        this.filmGrainPass.uniforms.intensity.value = options.intensity;
      }
    }
  }

  /**
   * Set FXAA parameters
   * @param {Object} options FXAA options
   */
  setFXAA(options = {}) {
    if (options.enabled !== undefined) {
      this.fxaaEnabled = options.enabled;
      if (this.fxaaPass) this.fxaaPass.enabled = options.enabled;
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
        this.outlinePass.uniforms.uLineWidth.value = options.thickness;
      }
    }
    if (options.threshold !== undefined) {
      this.outlineThreshold = options.threshold;
      if (this.outlinePass) {
        this.outlinePass.uniforms.uThreshold.value = options.threshold;
      }
    }
    if (options.color !== undefined) {
      if (this.outlinePass) {
        this.outlinePass.uniforms.uOutlineColor.value = new THREE.Color(options.color);
      }
    }
    // Outline is now static - no animation options needed
  }

  /**
   * Apply quality preset
   * @param {string} quality 'low', 'medium', or 'high'
   */
  setQualityPreset(quality) {
    switch (quality) {
      case 'low':
        this.setSSAO({ enabled: false });
        this.setBloom({ enabled: false });
        this.setOutline({ enabled: true, thickness: 1.0, threshold: 0.2 });
        this.setVignette({ enabled: true, intensity: 0.1 });
        this.setColorGrading({ enabled: true });
        this.setFilmGrain({ enabled: false });
        this.setFXAA({ enabled: false });
        break;

      case 'medium':
        this.setSSAO({ enabled: false }); // SSAO at half res would go here
        this.setBloom({
          enabled: true,
          threshold: 0.9,
          intensity: 0.1,
          radius: 0.3,
        });
        this.setOutline({ enabled: true, thickness: 1.5, threshold: 0.15 });
        this.setVignette({ enabled: true, intensity: 0.15 });
        this.setColorGrading({ enabled: true });
        this.setFilmGrain({ enabled: true, intensity: 0.02 });
        this.setFXAA({ enabled: true });
        break;

      case 'high':
      default:
        this.setSSAO({ enabled: true, radius: SSAO_RADIUS, intensity: SSAO_INTENSITY });
        this.setBloom({
          enabled: true,
          threshold: BLOOM_THRESHOLD,
          intensity: BLOOM_INTENSITY,
          radius: BLOOM_RADIUS,
        });
        this.setOutline({ enabled: true, thickness: OUTLINE_THICKNESS, threshold: 0.12 });
        this.setVignette({ enabled: true, intensity: VIGNETTE_INTENSITY });
        this.setColorGrading({ enabled: true });
        this.setFilmGrain({ enabled: true, intensity: FILM_GRAIN.intensity });
        this.setFXAA({ enabled: true });
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
    if (this.saoPass) {
      this.saoPass.camera = camera;
    }
  }

  /**
   * Update time-based effects (call every frame)
   * @param {number} deltaTime Time since last frame
   */
  update(deltaTime) {
    this.time += deltaTime;

    // Outline is now static - no time update needed

    // Update film grain time uniform
    if (this.filmGrainPass && this.filmGrainEnabled) {
      this.filmGrainPass.uniforms.time.value = this.time;
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
      this.outlinePass.uniforms.uResolution.value.set(
        width * pixelRatio,
        height * pixelRatio
      );
    }

    // Update film grain resolution
    if (this.filmGrainPass) {
      this.filmGrainPass.uniforms.resolution.value.set(
        width * pixelRatio,
        height * pixelRatio
      );
    }

    // Update FXAA resolution
    if (this.fxaaPass) {
      this.fxaaPass.uniforms['resolution'].value.set(
        1 / (width * pixelRatio),
        1 / (height * pixelRatio)
      );
    }

    // Update SAO pass
    if (this.saoPass) {
      this.saoPass.setSize(width, height);
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
    if (this.saoPass) {
      this.saoPass.dispose();
    }
  }
}

// Export shaders for potential reuse
export {
  VignetteShader,
  GammaCorrectionShader,
  OutlineShader,
  ColorGradingShader,
  FilmGrainShader,
};
