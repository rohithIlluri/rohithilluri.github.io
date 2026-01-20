import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CONFIG, PLANET_COLORS } from '../../../../constants/planetTheme';

export default function Billboard({ theta, phi, label, sublabel }) {
  const groupRef = useRef();
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

  // Animate glow
  useFrame((state) => {
    if (glowRef.current) {
      const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      glowRef.current.material.opacity = pulse * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      {/* Billboard structure - elevated above surface */}
      <group position={[0, 3, 0]}>
        {/* Support poles */}
        <mesh position={[-1.5, -1, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 2, 8]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>
        <mesh position={[1.5, -1, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 2, 8]} />
          <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
        </mesh>

        {/* Billboard frame */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[4, 2.5, 0.2]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>

        {/* Billboard surface (lit) */}
        <mesh position={[0, 0.5, 0.11]}>
          <planeGeometry args={[3.6, 2.1]} />
          <meshBasicMaterial color="#2a2a4a" />
        </mesh>

        {/* Main text */}
        <Text
          position={[0, 0.7, 0.15]}
          fontSize={0.4}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.2}
        >
          {label}
        </Text>

        {/* Subtitle */}
        <Text
          position={[0, 0.2, 0.15]}
          fontSize={0.2}
          color="#888888"
          anchorX="center"
          anchorY="middle"
        >
          {sublabel}
        </Text>

        {/* Neon border glow */}
        <mesh ref={glowRef} position={[0, 0.5, 0.05]}>
          <planeGeometry args={[4.2, 2.7]} />
          <meshBasicMaterial
            color={PLANET_COLORS.buildings.neon}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Frame lights */}
        <pointLight position={[0, 1.5, 0.5]} intensity={0.4} color="#FFFFFF" distance={5} />
      </group>
    </group>
  );
}
