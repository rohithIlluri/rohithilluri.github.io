import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Simple procedural smoke effect using animated spheres
 * Creates the "someone was just here" feeling for the Workshop
 */
export default function SmokeEffect({ position = [0, 0, 0], color = '#CCCCCC', particleCount = 5 }) {
  const groupRef = useRef();
  const particles = useRef([]);

  // Initialize particle states
  const initialStates = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      startDelay: i * 0.4,
      speed: 0.3 + Math.random() * 0.2,
      sway: 0.2 + Math.random() * 0.15,
      swaySpeed: 1 + Math.random() * 0.5,
      maxHeight: 1.5 + Math.random() * 0.5,
      scale: 0.15 + Math.random() * 0.1,
    }));
  }, [particleCount]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    particles.current.forEach((particle, i) => {
      if (!particle) return;

      const config = initialStates[i];
      const adjustedTime = (time + config.startDelay) % 3; // 3 second cycle

      // Vertical rise
      const progress = adjustedTime / 3;
      particle.position.y = progress * config.maxHeight;

      // Horizontal sway
      particle.position.x = Math.sin(time * config.swaySpeed + i) * config.sway * progress;
      particle.position.z = Math.cos(time * config.swaySpeed * 0.7 + i) * config.sway * 0.5 * progress;

      // Scale and opacity based on progress
      const scale = config.scale * (1 + progress * 0.5);
      particle.scale.setScalar(scale);

      // Fade out as it rises
      if (particle.material) {
        particle.material.opacity = 0.6 * (1 - progress * 0.8);
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {initialStates.map((config, i) => (
        <mesh
          key={i}
          ref={(el) => {
            particles.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
