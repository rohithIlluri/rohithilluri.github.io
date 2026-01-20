import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CONFIG, PLANET_COLORS } from '../../../../constants/planetTheme';

export default function Taxi({ theta, phi, label }) {
  const groupRef = useRef();
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

  // Subtle idle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={groupRef}>
        {/* Taxi body */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.8, 0.4, 1.6]} />
          <meshToonMaterial color={PLANET_COLORS.street.yellow} />
        </mesh>

        {/* Taxi roof */}
        <mesh position={[0, 0.7, -0.1]}>
          <boxGeometry args={[0.7, 0.35, 1]} />
          <meshToonMaterial color={PLANET_COLORS.street.yellow} />
        </mesh>

        {/* Wheels */}
        {[[-0.35, 0.15, 0.5], [0.35, 0.15, 0.5], [-0.35, 0.15, -0.5], [0.35, 0.15, -0.5]].map((pos, i) => (
          <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
            <meshToonMaterial color="#1a1a1a" />
          </mesh>
        ))}

        {/* TAXI sign on roof */}
        <mesh position={[0, 0.95, -0.1]}>
          <boxGeometry args={[0.4, 0.15, 0.2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Headlights */}
        <mesh position={[-0.25, 0.35, 0.81]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#FFFFCC" />
        </mesh>
        <mesh position={[0.25, 0.35, 0.81]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#FFFFCC" />
        </mesh>

        {/* Label floating above */}
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.25}
          color="#1DA1F2"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>

        {/* Light */}
        <pointLight position={[0, 1, 0.5]} intensity={0.2} color={PLANET_COLORS.street.yellow} distance={3} />
      </group>
    </group>
  );
}
