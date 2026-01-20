import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CONFIG } from '../../../../constants/planetTheme';

export default function Monument({ theta, phi, label, color = '#0077B5' }) {
  const { radius } = PLANET_CONFIG;

  // Calculate position on sphere
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

    return { position: pos, quaternion: quat };
  }, [theta, phi, radius]);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.2, 8]} />
        <meshToonMaterial color="#4a4a4a" />
      </mesh>

      {/* Column base */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshToonMaterial color={color} />
      </mesh>

      {/* Main column */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 2, 8]} />
        <meshToonMaterial color={color} />
      </mesh>

      {/* Column top */}
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.5]} />
        <meshToonMaterial color={color} />
      </mesh>

      {/* Decorative sphere on top */}
      <mesh position={[0, 2.9, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>

      {/* Label plaque */}
      <mesh position={[0, 0.8, 0.35]}>
        <boxGeometry args={[0.5, 0.25, 0.05]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <Text
        position={[0, 0.8, 0.4]}
        fontSize={0.12}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Spotlight */}
      <pointLight position={[0, 3.5, 0]} intensity={0.3} color={color} distance={4} />
    </group>
  );
}
