import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CONFIG, PLANET_COLORS } from '../../../../constants/planetTheme';

export default function SubwayEntrance({ theta, phi, label, color = '#FF6B6B' }) {
  const glowRef = useRef();
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

  // Pulsing glow
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      glowRef.current.material.opacity = pulse * 0.5;
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      {/* Entrance structure */}
      <group>
        {/* Side walls */}
        <mesh position={[-0.6, 0.6, 0]}>
          <boxGeometry args={[0.1, 1.2, 1]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>
        <mesh position={[0.6, 0.6, 0]}>
          <boxGeometry args={[0.1, 1.2, 1]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>

        {/* Top beam */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[1.3, 0.1, 1]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>

        {/* Subway sign globe */}
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial color="#00FF00" />
        </mesh>

        {/* Sign glow */}
        <mesh ref={glowRef} position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.3} />
        </mesh>

        {/* Steps going down (visual only) */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, -0.1 - i * 0.15, 0.3 + i * 0.2]}>
            <boxGeometry args={[1, 0.1, 0.3]} />
            <meshToonMaterial color={PLANET_COLORS.street.sidewalk} />
          </mesh>
        ))}

        {/* Handrails */}
        <mesh position={[-0.4, 0.3, 0.4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} rotation={[Math.PI / 4, 0, 0]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>
        <mesh position={[0.4, 0.3, 0.4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} rotation={[Math.PI / 4, 0, 0]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>

        {/* Label */}
        <Text
          position={[0, 2.1, 0]}
          fontSize={0.25}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>

        {/* Interior light */}
        <pointLight position={[0, 0.5, 0]} intensity={0.3} color="#FFFFCC" distance={3} />
      </group>
    </group>
  );
}
