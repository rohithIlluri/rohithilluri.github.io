import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Park bench for environmental storytelling
 * "Sometimes I sit and think"
 */
export default function Bench({ theta, phi, radius, heightOffset = 0, rotation = 0 }) {
  // Calculate position and orientation on sphere
  const { position, quaternion } = useMemo(() => {
    const pos = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const normal = pos.clone().normalize();

    // Base orientation to stand on sphere
    const baseQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );

    // Apply additional rotation around the up axis (normal)
    const rotationQuat = new THREE.Quaternion().setFromAxisAngle(
      normal,
      rotation
    );

    const finalQuat = rotationQuat.multiply(baseQuat);

    if (heightOffset > 0) {
      pos.add(normal.clone().multiplyScalar(heightOffset));
    }

    return { position: pos, quaternion: finalQuat };
  }, [theta, phi, radius, heightOffset, rotation]);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Seat - wooden planks */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.08, 0.4]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 0.65, -0.15]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.1, 0.35, 0.06]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>

      {/* Left leg frame */}
      <group position={[-0.45, 0, 0]}>
        {/* Vertical support */}
        <mesh position={[0, 0.18, 0.12]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshToonMaterial color="#424242" />
        </mesh>
        <mesh position={[0, 0.18, -0.12]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshToonMaterial color="#424242" />
        </mesh>
        {/* Horizontal connector */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.3]} />
          <meshToonMaterial color="#424242" />
        </mesh>
      </group>

      {/* Right leg frame */}
      <group position={[0.45, 0, 0]}>
        {/* Vertical support */}
        <mesh position={[0, 0.18, 0.12]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshToonMaterial color="#424242" />
        </mesh>
        <mesh position={[0, 0.18, -0.12]}>
          <boxGeometry args={[0.06, 0.36, 0.06]} />
          <meshToonMaterial color="#424242" />
        </mesh>
        {/* Horizontal connector */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.3]} />
          <meshToonMaterial color="#424242" />
        </mesh>
      </group>

      {/* Armrests */}
      <mesh position={[-0.52, 0.45, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.35]} />
        <meshToonMaterial color="#5D4037" />
      </mesh>
      <mesh position={[0.52, 0.45, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.35]} />
        <meshToonMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}
