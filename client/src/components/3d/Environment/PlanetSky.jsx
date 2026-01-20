import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_COLORS } from '../../../constants/planetTheme';
import Clouds from './Clouds';

// Custom shader for golden hour gradient
const vertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 topColor;
  uniform vec3 middleColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition + offset).y;

    vec3 color;
    if (h > 0.3) {
      // Top to middle
      float t = (h - 0.3) / 0.7;
      color = mix(middleColor, topColor, pow(t, exponent));
    } else if (h > -0.2) {
      // Middle to bottom (horizon area)
      float t = (h + 0.2) / 0.5;
      color = mix(bottomColor, middleColor, t);
    } else {
      // Below horizon
      color = bottomColor;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Sun component
function Sun() {
  const sunRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (glowRef.current) {
      // Subtle pulsing
      const scale = 1 + Math.sin(time * 0.5) * 0.05;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[80, 25, -80]}>
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color={PLANET_COLORS.sky.sun} />
      </mesh>
      {/* Sun glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color={PLANET_COLORS.sky.middle} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Distant city silhouette
function DistantSkyline() {
  const buildings = useMemo(() => {
    const result = [];
    const count = 20;
    const radius = 150;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const height = 10 + Math.random() * 25;
      const width = 3 + Math.random() * 5;

      result.push({
        position: [
          Math.cos(angle) * radius,
          height / 2 - 5,
          Math.sin(angle) * radius,
        ],
        height,
        width,
        key: i,
      });
    }
    return result;
  }, []);

  return (
    <group>
      {buildings.map((b) => (
        <mesh key={b.key} position={b.position}>
          <boxGeometry args={[b.width, b.height, b.width * 0.8]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function PlanetSky() {
  const uniforms = useMemo(() => ({
    topColor: { value: new THREE.Color(PLANET_COLORS.sky.top) },
    middleColor: { value: new THREE.Color(PLANET_COLORS.sky.middle) },
    bottomColor: { value: new THREE.Color(PLANET_COLORS.sky.bottom) },
    offset: { value: 20 },
    exponent: { value: 0.6 },
  }), []);

  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Sun */}
      <Sun />

      {/* Distant skyline */}
      <DistantSkyline />

      {/* Floating clouds - Messenger style */}
      <Clouds
        count={8}
        radius={70}
        height={35}
        heightVariation={8}
      />

      {/* Fog for atmosphere */}
      <fog attach="fog" args={[PLANET_COLORS.sky.middle, 50, 180]} />
    </>
  );
}
