import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Low-poly procedural tree for environmental storytelling
 * "Even on a tiny planet, life finds a way"
 */
export default function Tree({ theta, phi, radius, heightOffset = 0, scale = 1 }) {
  const treeRef = useRef();
  const foliageRef = useRef();

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

  // Random phase for unique sway animation
  const swayPhase = useMemo(() => Math.random() * Math.PI * 2, []);

  // Gentle sway animation
  useFrame((state) => {
    if (foliageRef.current) {
      const time = state.clock.elapsedTime;
      const sway = Math.sin(time * 0.8 + swayPhase) * 0.03;
      foliageRef.current.rotation.z = sway;
      foliageRef.current.rotation.x = Math.sin(time * 0.5 + swayPhase) * 0.02;
    }
  });

  return (
    <group ref={treeRef} position={position} quaternion={quaternion} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 8]} />
        <meshToonMaterial color="#5D4037" />
      </mesh>

      {/* Foliage group - swaying */}
      <group ref={foliageRef} position={[0, 1.6, 0]}>
        {/* Bottom foliage layer (widest) */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.7, 1.0, 8]} />
          <meshToonMaterial color="#4CAF50" />
        </mesh>

        {/* Middle foliage layer */}
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.55, 0.8, 8]} />
          <meshToonMaterial color="#66BB6A" />
        </mesh>

        {/* Top foliage layer (smallest) */}
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.35, 0.6, 8]} />
          <meshToonMaterial color="#81C784" />
        </mesh>
      </group>
    </group>
  );
}
