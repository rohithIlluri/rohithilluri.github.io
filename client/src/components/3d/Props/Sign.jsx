import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Directional waypoint sign for zone guidance
 * "Let me point you somewhere"
 */
export default function Sign({
  theta,
  phi,
  radius,
  heightOffset = 0,
  rotation = 0,
  color = '#F5E6D3',
  arrowColor = '#98D8C8',
}) {
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
      {/* Post */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.5, 8]} />
        <meshToonMaterial color="#5D4037" />
      </mesh>

      {/* Sign board */}
      <mesh position={[0.3, 1.4, 0]}>
        <boxGeometry args={[0.8, 0.3, 0.08]} />
        <meshToonMaterial color={color} />
      </mesh>

      {/* Arrow decoration */}
      <group position={[0.55, 1.4, 0.05]}>
        {/* Arrow body */}
        <mesh>
          <boxGeometry args={[0.2, 0.08, 0.02]} />
          <meshToonMaterial color={arrowColor} />
        </mesh>
        {/* Arrow head */}
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.12, 0.12, 0.02]} />
          <meshToonMaterial color={arrowColor} />
        </mesh>
      </group>

      {/* Decorative cap on post */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>

      {/* Base decoration */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 8]} />
        <meshToonMaterial color="#5D4037" />
      </mesh>
    </group>
  );
}
