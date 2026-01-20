import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CONFIG } from '../../../../constants/planetTheme';

export default function NeonSign({ theta, phi, label, color = '#FF6B6B' }) {
  const groupRef = useRef();
  const glowRef = useRef();
  const textRef = useRef();
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

  // Neon flicker effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const flicker = 0.8 + Math.sin(time * 10 + Math.random() * 0.5) * 0.2;

    if (glowRef.current) {
      glowRef.current.material.opacity = flicker * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      <group position={[0, 2, 0]}>
        {/* Sign backing */}
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[label.length * 0.25 + 0.5, 0.8, 0.1]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>

        {/* Neon text */}
        <Text
          ref={textRef}
          position={[0, 0, 0.01]}
          fontSize={0.35}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>

        {/* Glow effect */}
        <mesh ref={glowRef} position={[0, 0, -0.05]}>
          <planeGeometry args={[label.length * 0.25 + 1, 1.2]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>

        {/* Point light for illumination */}
        <pointLight position={[0, 0, 0.5]} intensity={0.3} color={color} distance={3} />
      </group>
    </group>
  );
}
