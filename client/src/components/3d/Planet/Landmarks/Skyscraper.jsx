import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CONFIG, PLANET_COLORS } from '../../../../constants/planetTheme';

export default function Skyscraper({ theta, phi, label, color = '#333333' }) {
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

  // Window positions
  const windows = useMemo(() => {
    const result = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 2; col++) {
        result.push({
          x: (col - 0.5) * 0.5,
          y: 0.8 + row * 0.7,
          key: `${row}-${col}`,
        });
      }
    }
    return result;
  }, []);

  return (
    <group position={position} quaternion={quaternion}>
      {/* Building base */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.2, 4, 0.8]} />
        <meshToonMaterial color={color} />
      </mesh>

      {/* Building top section */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.6]} />
        <meshToonMaterial color={color} />
      </mesh>

      {/* Windows */}
      {windows.map((w) => (
        <mesh key={w.key} position={[w.x, w.y, 0.41]}>
          <planeGeometry args={[0.25, 0.4]} />
          <meshBasicMaterial
            color={PLANET_COLORS.buildings.glass}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Label sign on building */}
      <mesh position={[0, 3.8, 0.45]}>
        <boxGeometry args={[1, 0.4, 0.05]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <Text
        position={[0, 3.8, 0.5]}
        fontSize={0.2}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>

      {/* Roof antenna */}
      <mesh position={[0, 5.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
      </mesh>

      {/* Window glow light */}
      <pointLight position={[0, 2, 1]} intensity={0.2} color={PLANET_COLORS.buildings.glass} distance={3} />
    </group>
  );
}
