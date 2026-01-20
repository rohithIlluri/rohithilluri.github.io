import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Base component for positioning buildings on sphere surface
 * Handles position calculation and orientation
 */
export function BuildingBase({ theta, phi, radius, heightOffset = 0, children }) {
  const { position, quaternion } = useMemo(() => {
    // Calculate position on sphere
    const pos = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    // Calculate normal (up direction on sphere surface)
    const normal = pos.clone().normalize();

    // Create quaternion to orient the building to stand on the sphere
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );

    // Apply height offset along normal
    if (heightOffset > 0) {
      pos.add(normal.multiplyScalar(heightOffset));
    }

    return { position: pos, quaternion: quat };
  }, [theta, phi, radius, heightOffset]);

  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  );
}

/**
 * Utility to create a simple box building shape
 */
export function SimpleBox({ width, height, depth, color, position = [0, 0, 0] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, depth]} />
      <meshToonMaterial color={color} />
    </mesh>
  );
}

/**
 * Utility to create a window
 */
export function Window({ width = 0.4, height = 0.5, position = [0, 0, 0], color = '#A8D8DC' }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, height, 0.05]} />
      <meshToonMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

/**
 * Utility to create a door
 */
export function Door({ width = 0.6, height = 1, position = [0, 0, 0], color = '#5A4A3A' }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshToonMaterial color={color} />
      </mesh>
      {/* Door handle */}
      <mesh position={[width * 0.3, 0, 0.06]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshToonMaterial color="#C4A000" />
      </mesh>
    </group>
  );
}

/**
 * Utility to create a peaked roof
 */
export function PeakedRoof({ width, depth, height = 0.8, position = [0, 0, 0], color = '#8B4513' }) {
  return (
    <mesh position={position} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[Math.max(width, depth) * 0.75, height, 4]} />
      <meshToonMaterial color={color} />
    </mesh>
  );
}

/**
 * Utility to create a flat roof with edge
 */
export function FlatRoof({ width, depth, position = [0, 0, 0], color = '#888888' }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width + 0.1, 0.15, depth + 0.1]} />
        <meshToonMaterial color={color} />
      </mesh>
    </group>
  );
}

/**
 * Utility to create a sign
 */
export function Sign({ text, width = 1.5, height = 0.4, position = [0, 0, 0], bgColor = '#FFFFFF', textColor = '#333333' }) {
  return (
    <group position={position}>
      {/* Sign background */}
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshToonMaterial color={bgColor} />
      </mesh>
    </group>
  );
}

/**
 * Utility to create a chimney
 */
export function Chimney({ position = [0, 0, 0], color = '#8B4513' }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.3, 0.6, 0.3]} />
      <meshToonMaterial color={color} />
    </mesh>
  );
}

export default BuildingBase;
