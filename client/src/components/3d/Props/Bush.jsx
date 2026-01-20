import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Simple decorative bush/shrub
 * Adds natural detail to the environment
 */
export default function Bush({
  theta,
  phi,
  radius,
  heightOffset = 0,
  scale = 1,
  color = '#2E7D32',
}) {
  const bushRef = useRef();
  const swayPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  // Calculate position and orientation on sphere
  const { position, quaternion } = useMemo(() => {
    const pos = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const normal = pos.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );

    if (heightOffset > 0) {
      pos.add(normal.clone().multiplyScalar(heightOffset));
    }

    return { position: pos, quaternion: quat };
  }, [theta, phi, radius, heightOffset]);

  // Subtle wind sway
  useFrame((state) => {
    if (bushRef.current) {
      const time = state.clock.elapsedTime;
      bushRef.current.rotation.z = Math.sin(time * 0.6 + swayPhase) * 0.02;
    }
  });

  // Bush shape - cluster of spheres
  const spheres = useMemo(() => [
    { pos: [0, 0.25, 0], size: 0.35 },
    { pos: [0.2, 0.2, 0.1], size: 0.25 },
    { pos: [-0.15, 0.18, 0.15], size: 0.28 },
    { pos: [0.1, 0.22, -0.12], size: 0.22 },
    { pos: [-0.1, 0.3, -0.08], size: 0.2 },
  ], []);

  return (
    <group ref={bushRef} position={position} quaternion={quaternion} scale={scale}>
      {spheres.map((sphere, i) => (
        <mesh key={i} position={sphere.pos}>
          <sphereGeometry args={[sphere.size, 8, 6]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
