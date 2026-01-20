import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlanet } from '../../../context/PlanetContext';
import { sphericalToCartesian, PLANET_CONFIG, NPC_TYPES } from '../../../constants/planetTheme';

// Base NPC component with customizable appearance
export default function NPC({
  npcType = 'guide',
  theta = 0,
  phi = Math.PI / 2,
  label = 'NPC',
}) {
  const groupRef = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const { characterPosition } = usePlanet();

  const npcConfig = NPC_TYPES[npcType] || NPC_TYPES.guide;
  const radius = PLANET_CONFIG.radius + 0.9; // Slightly above planet surface

  // Calculate position on sphere
  const position = useMemo(() => {
    return sphericalToCartesian(theta, phi, radius);
  }, [theta, phi, radius]);

  // Calculate up vector (normal to sphere at this point)
  const upVector = useMemo(() => {
    return new THREE.Vector3(...position).normalize();
  }, [position]);

  // Idle animation and face player
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Bobbing animation
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(time * 2) * 0.05;
    }

    // Head bobbing (slightly offset)
    if (headRef.current) {
      headRef.current.position.y = 0.9 + Math.sin(time * 2 + 0.5) * 0.03;
    }

    // Face towards player if nearby
    if (characterPosition) {
      const npcPos = new THREE.Vector3(...position);
      const charPos = new THREE.Vector3(
        characterPosition.x,
        characterPosition.y,
        characterPosition.z
      );

      const distance = npcPos.distanceTo(charPos);

      if (distance < 5) {
        // Calculate direction to player in local space
        const direction = charPos.clone().sub(npcPos);

        // Project onto tangent plane
        const up = upVector.clone();
        const tangentDir = direction.clone().sub(up.multiplyScalar(direction.dot(up)));

        if (tangentDir.length() > 0.01) {
          tangentDir.normalize();

          // Calculate target rotation
          const forward = new THREE.Vector3(1, 0, 0);
          const targetAngle = Math.atan2(tangentDir.z, tangentDir.x);

          // Smooth rotation towards player
          if (groupRef.current.userData.currentAngle === undefined) {
            groupRef.current.userData.currentAngle = 0;
          }

          const currentAngle = groupRef.current.userData.currentAngle;
          const angleDiff = targetAngle - currentAngle;
          const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
          groupRef.current.userData.currentAngle += normalizedDiff * 0.05;
        }
      }
    }
  });

  // Calculate orientation to stand on sphere surface
  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const targetUp = upVector.clone();
    const q = new THREE.Quaternion().setFromUnitVectors(up, targetUp);
    return q;
  }, [upVector]);

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      {/* Body - capsule shape */}
      <mesh ref={bodyRef} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial
          color={npcConfig.color}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Head - sphere */}
      <mesh ref={headRef} position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#FDBBB1"
          roughness={0.8}
          metalness={0}
        />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.08, 0.93, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#1F2937" />
      </mesh>
      <mesh position={[-0.08, 0.93, 0.18]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#1F2937" />
      </mesh>

      {/* Accent accessory based on NPC type */}
      <NPCAccessory npcType={npcType} color={npcConfig.accentColor} />

      {/* Floating name tag */}
      <FloatingLabel label={label} color={npcConfig.color} />

      {/* Glow ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial
          color={npcConfig.color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// NPC-specific accessories
function NPCAccessory({ npcType, color }) {
  switch (npcType) {
    case 'craftsman':
      // Tool/wrench
      return (
        <mesh position={[0.35, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.3, 0.04]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
      );

    case 'architect':
      // Blueprint roll
      return (
        <mesh position={[0.35, 0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.06, 0.06, 0.25, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );

    case 'musician':
      // Headphones
      return (
        <group position={[0, 1.05, 0]}>
          <mesh>
            <torusGeometry args={[0.18, 0.03, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#1F2937" />
          </mesh>
          <mesh position={[0.18, -0.08, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[-0.18, -0.08, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );

    case 'critic':
      // Popcorn box
      return (
        <mesh position={[0.35, 0.15, 0]}>
          <boxGeometry args={[0.12, 0.18, 0.08]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
      );

    case 'postmaster':
      // Envelope
      return (
        <mesh position={[0.35, 0.15, 0]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.18, 0.12, 0.02]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      );

    case 'guide':
    default:
      // Floating orb
      return (
        <mesh position={[0.35, 0.4, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
  }
}

// Floating label above NPC
function FloatingLabel({ label, color }) {
  const labelRef = useRef();

  useFrame((state) => {
    if (labelRef.current) {
      // Always face camera
      labelRef.current.lookAt(state.camera.position);
      // Subtle floating animation
      labelRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={labelRef} position={[0, 1.5, 0]}>
      {/* Background pill */}
      <mesh>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {/* We'll use HTML for text in the actual scene */}
    </group>
  );
}
