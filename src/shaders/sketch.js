/**
 * sketch.js - Clean Static Outline Shader
 * Creates crisp, graphic novel-style outlines matching messenger.abeto.co
 *
 * IMPORTANT: This shader produces STATIC, clean outlines.
 * NO animation, NO wobble, NO noise distortion.
 * The "hand-drawn" quality comes from the artistic style, not from animating lines.
 */

import * as THREE from 'three';
import { MESSENGER_PALETTE } from '../constants/colors.js';

/**
 * Clean Static Outline Shader
 * Uses Sobel edge detection for crisp, consistent outlines
 *
 * Features:
 * - Sobel edge detection on luminance
 * - Consistent line thickness
 * - Soft outline color (#2A2A2A, never pure black)
 * - NO animation or noise
 */
export const CleanOutlineShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uOutlineColor: { value: new THREE.Color(MESSENGER_PALETTE.OUTLINE_PRIMARY) },
    uLineWidth: { value: 2.0 },
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

      // Sobel edge detection - clean, static
      float tl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, -texelSize.y)).rgb);
      float t  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, -texelSize.y)).rgb);
      float tr = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, -texelSize.y)).rgb);
      float l  = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, 0.0)).rgb);
      float r  = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, 0.0)).rgb);
      float bl = getLuminance(texture2D(tDiffuse, vUv + vec2(-texelSize.x, texelSize.y)).rgb);
      float b  = getLuminance(texture2D(tDiffuse, vUv + vec2(0.0, texelSize.y)).rgb);
      float br = getLuminance(texture2D(tDiffuse, vUv + vec2(texelSize.x, texelSize.y)).rgb);

      // Sobel gradient
      float gx = -tl - 2.0*l - bl + tr + 2.0*r + br;
      float gy = -tl - 2.0*t - tr + bl + 2.0*b + br;
      float edge = sqrt(gx*gx + gy*gy);

      // Clean threshold - no noise variation
      float lineMask = smoothstep(uThreshold - 0.02, uThreshold + 0.02, edge);

      // Mix outline with original
      vec3 finalColor = mix(center.rgb, uOutlineColor, lineMask);

      gl_FragColor = vec4(finalColor, center.a);
    }
  `,
};

/**
 * Create a clean outline shader pass for use with EffectComposer
 * @param {Object} options Configuration options
 * @returns {Object} Shader configuration for ShaderPass
 */
export function createCleanOutlinePass(options = {}) {
  const shader = { ...CleanOutlineShader };

  shader.uniforms = {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(
      options.width || window.innerWidth,
      options.height || window.innerHeight
    )},
    uOutlineColor: { value: new THREE.Color(
      options.outlineColor || MESSENGER_PALETTE.OUTLINE_PRIMARY
    )},
    uLineWidth: { value: options.lineWidth || 2.0 },
    uThreshold: { value: options.threshold || 0.12 },
  };

  return shader;
}

// Export for backward compatibility (renamed from SketchOutlineShader)
export const SketchOutlineShader = CleanOutlineShader;
export const SimpleSketchShader = CleanOutlineShader;

export default CleanOutlineShader;
