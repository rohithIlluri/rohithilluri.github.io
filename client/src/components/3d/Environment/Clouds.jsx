import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Single low-poly cloud made of grouped spheres
 */
function Cloud({ position, scale = 1, rotationSpeed = 0.002, bobSpeed = 0.3, bobAmount = 0.5 }) {
  const cloudRef = useRef();
  const initialY = position[1];
  const phaseOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  // Cloud shape - cluster of spheres
  const spheres = useMemo(() => {
    const shapes = [];
    // Main body
    shapes.push({ pos: [0, 0, 0], size: 1.2 });
    shapes.push({ pos: [1.1, -0.1, 0], size: 0.9 });
    shapes.push({ pos: [-0.9, 0.1, 0], size: 1.0 });
    shapes.push({ pos: [0.5, 0.3, -0.3], size: 0.7 });
    shapes.push({ pos: [-0.4, 0.25, 0.3], size: 0.6 });
    // Puffs
    shapes.push({ pos: [1.6, -0.2, 0.2], size: 0.5 });
    shapes.push({ pos: [-1.5, 0, -0.1], size: 0.6 });
    return shapes;
  }, []);

  useFrame((state) => {
    if (cloudRef.current) {
      // Slow orbital rotation around Y axis (world center)
      cloudRef.current.rotation.y += rotationSpeed;

      // Subtle vertical bob
      const bob = Math.sin(state.clock.elapsedTime * bobSpeed + phaseOffset) * bobAmount;
      cloudRef.current.position.y = initialY + bob;
    }
  });

  return (
    <group ref={cloudRef} position={position} scale={scale}>
      {spheres.map((sphere, i) => (
        <mesh key={i} position={sphere.pos}>
          <sphereGeometry args={[sphere.size, 8, 6]} />
          <meshToonMaterial
            color="#FFFFFF"
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Cloud ring that orbits above the planet
 * Creates the Messenger-style floating cloud aesthetic
 */
export default function Clouds({
  count = 8,
  radius = 70,
  height = 30,
  heightVariation = 10,
}) {
  const clouds = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radiusVariation = radius + (Math.random() - 0.5) * 20;
      const yVariation = height + (Math.random() - 0.5) * heightVariation * 2;

      result.push({
        key: i,
        position: [
          Math.cos(angle) * radiusVariation,
          yVariation,
          Math.sin(angle) * radiusVariation,
        ],
        scale: 1.5 + Math.random() * 1.5,
        rotationSpeed: 0.001 + Math.random() * 0.002,
        bobSpeed: 0.2 + Math.random() * 0.3,
        bobAmount: 0.3 + Math.random() * 0.4,
      });
    }
    return result;
  }, [count, radius, height, heightVariation]);

  // Main group for all clouds - rotates slowly
  const cloudsGroupRef = useRef();

  useFrame(() => {
    if (cloudsGroupRef.current) {
      // Very slow rotation of the entire cloud layer
      cloudsGroupRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <group ref={cloudsGroupRef}>
      {clouds.map((cloud) => (
        <Cloud
          key={cloud.key}
          position={cloud.position}
          scale={cloud.scale}
          rotationSpeed={cloud.rotationSpeed}
          bobSpeed={cloud.bobSpeed}
          bobAmount={cloud.bobAmount}
        />
      ))}
    </group>
  );
}
