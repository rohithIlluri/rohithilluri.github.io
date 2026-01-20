import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingBase } from './BuildingBase';

/**
 * Welcome Arch for the Welcome zone
 * A decorative entrance arch with floating orb
 */
export default function WelcomeArch({ building, radius }) {
  const orbRef = useRef();
  const ringsRef = useRef();
  const { theta, phi, colors } = building;

  // Animate floating orb and rings
  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      orbRef.current.position.y = 4 + Math.sin(state.clock.elapsedTime) * 0.15;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <BuildingBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Left pillar */}
      <mesh position={[-1.5, 1.5, 0]}>
        <boxGeometry args={[0.6, 3, 0.6]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>
      {/* Left pillar cap */}
      <mesh position={[-1.5, 3.1, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>

      {/* Right pillar */}
      <mesh position={[1.5, 1.5, 0]}>
        <boxGeometry args={[0.6, 3, 0.6]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>
      {/* Right pillar cap */}
      <mesh position={[1.5, 3.1, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>

      {/* Arch beam */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[3.6, 0.4, 0.7]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>

      {/* Top decorative element */}
      <mesh position={[0, 3.8, 0]}>
        <boxGeometry args={[2, 0.3, 0.5]} />
        <meshToonMaterial color={colors.accent} />
      </mesh>

      {/* "WELCOME" sign area */}
      <group position={[0, 3.4, 0.4]}>
        <mesh>
          <boxGeometry args={[2.5, 0.3, 0.05]} />
          <meshToonMaterial color={colors.secondary} />
        </mesh>
        {/* Decorative elements to represent text */}
        {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.03]}>
            <boxGeometry args={[0.25, 0.2, 0.02]} />
            <meshToonMaterial color={colors.primary} />
          </mesh>
        ))}
      </group>

      {/* Decorative side elements */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.5, 2, 0.35]}>
          {/* Decorative diamond */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.25, 0.25, 0.05]} />
            <meshToonMaterial color={colors.accent} />
          </mesh>
        </group>
      ))}

      {/* Pillar base decorations */}
      {[-1.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.8]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
      ))}

      {/* Floating orb with rings */}
      <group ref={orbRef} position={[0, 4, 0]}>
        {/* Central orb */}
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
        {/* Inner glow */}
        <mesh>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.5} />
        </mesh>
        {/* Orbiting rings */}
        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.5, 0.03, 8, 32]} />
            <meshToonMaterial color={colors.accent} />
          </mesh>
          <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[0.55, 0.02, 8, 32]} />
            <meshToonMaterial color={colors.secondary} />
          </mesh>
        </group>
        {/* Light effect */}
        <pointLight intensity={0.8} color={colors.accent} distance={4} />
      </group>

      {/* Ground path markers */}
      <mesh position={[0, 0.02, 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshToonMaterial color={colors.accent} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0.02, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshToonMaterial color={colors.accent} transparent opacity={0.5} />
      </mesh>

      {/* Arrow indicators on ground pointing forward */}
      <group position={[0, 0.02, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <coneGeometry args={[0.15, 0.3, 3]} />
          <meshToonMaterial color={colors.primary} transparent opacity={0.6} />
        </mesh>
      </group>
      <group position={[0, 0.02, -1.5]} rotation={[-Math.PI / 2, Math.PI, 0]}>
        <mesh>
          <coneGeometry args={[0.15, 0.3, 3]} />
          <meshToonMaterial color={colors.primary} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Info board */}
      <group position={[2.2, 0.8, 0]}>
        {/* Post */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>
        {/* Board */}
        <mesh>
          <boxGeometry args={[0.8, 0.6, 0.05]} />
          <meshToonMaterial color={colors.secondary} />
        </mesh>
        {/* Arrow pointing direction */}
        <mesh position={[0.2, 0, 0.03]}>
          <coneGeometry args={[0.08, 0.2, 3]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
      </group>
    </BuildingBase>
  );
}
