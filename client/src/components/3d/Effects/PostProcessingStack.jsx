import React, { useMemo } from 'react';
import {
  EffectComposer,
  Noise,
  Vignette,
  Bloom,
  ChromaticAberration,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { BlendFunction, Effect } from 'postprocessing';
import * as THREE from 'three';

/**
 * Custom Sobel Edge Detection Effect
 * Creates the Messenger-style outline aesthetic
 */
const edgeDetectionShader = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tDepth;
  uniform vec2 resolution;
  uniform vec3 edgeColor;
  uniform float edgeStrength;
  uniform float depthThreshold;
  uniform float normalThreshold;

  // Sobel kernels for edge detection
  const mat3 Gx = mat3(
    -1.0, 0.0, 1.0,
    -2.0, 0.0, 2.0,
    -1.0, 0.0, 1.0
  );

  const mat3 Gy = mat3(
    -1.0, -2.0, -1.0,
     0.0,  0.0,  0.0,
     1.0,  2.0,  1.0
  );

  float luminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 texel = 1.0 / resolution;

    // Sample 3x3 neighborhood for Sobel filter
    float samples[9];
    int idx = 0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y)) * texel;
        vec3 color = texture2D(inputBuffer, uv + offset).rgb;
        samples[idx] = luminance(color);
        idx++;
      }
    }

    // Apply Sobel operators
    float edgeX =
      Gx[0][0] * samples[0] + Gx[0][1] * samples[1] + Gx[0][2] * samples[2] +
      Gx[1][0] * samples[3] + Gx[1][1] * samples[4] + Gx[1][2] * samples[5] +
      Gx[2][0] * samples[6] + Gx[2][1] * samples[7] + Gx[2][2] * samples[8];

    float edgeY =
      Gy[0][0] * samples[0] + Gy[0][1] * samples[1] + Gy[0][2] * samples[2] +
      Gy[1][0] * samples[3] + Gy[1][1] * samples[4] + Gy[1][2] * samples[5] +
      Gy[2][0] * samples[6] + Gy[2][1] * samples[7] + Gy[2][2] * samples[8];

    // Calculate edge magnitude
    float edge = sqrt(edgeX * edgeX + edgeY * edgeY);

    // Apply threshold and strength
    edge = smoothstep(0.1, 0.3, edge) * edgeStrength;

    // Mix edge color with original
    vec3 finalColor = mix(inputColor.rgb, edgeColor, edge * 0.5);

    outputColor = vec4(finalColor, inputColor.a);
  }
`;

/**
 * Custom Edge Detection Effect class
 */
class EdgeDetectionEffect extends Effect {
  constructor({
    edgeColor = new THREE.Color('#3D5A6A'),
    edgeStrength = 1.0,
  } = {}) {
    super('EdgeDetectionEffect', edgeDetectionShader, {
      uniforms: new Map([
        ['resolution', { value: new THREE.Vector2(1, 1) }],
        ['edgeColor', { value: edgeColor }],
        ['edgeStrength', { value: edgeStrength }],
      ]),
    });
  }

  setSize(width, height) {
    this.uniforms.get('resolution').value.set(width, height);
  }
}

/**
 * React component wrapper for EdgeDetectionEffect
 */
function EdgeDetection({ edgeColor = '#3D5A6A', edgeStrength = 1.0 }) {
  const effect = useMemo(() => {
    return new EdgeDetectionEffect({
      edgeColor: new THREE.Color(edgeColor),
      edgeStrength,
    });
  }, [edgeColor, edgeStrength]);

  return <primitive object={effect} />;
}

export default function PostProcessingStack() {
  return (
    <EffectComposer>
      {/* Enhanced bloom for Messenger glow effect */}
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Custom edge detection for Messenger outline aesthetic */}
      <EdgeDetection
        edgeColor="#3D5A6A"
        edgeStrength={0.8}
      />

      {/* Subtle chromatic aberration for stylized look */}
      <ChromaticAberration
        offset={[0.0004, 0.0004]}
        radialModulation={false}
        modulationOffset={0}
      />

      {/* Slight brightness/contrast adjustment for warmth */}
      <BrightnessContrast
        brightness={0.02}
        contrast={0.05}
      />

      {/* Grainy film texture - Messenger signature style */}
      <Noise
        opacity={0.12}
        blendFunction={BlendFunction.SOFT_LIGHT}
      />

      {/* Enhanced vignette for cinematic depth */}
      <Vignette
        offset={0.35}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
