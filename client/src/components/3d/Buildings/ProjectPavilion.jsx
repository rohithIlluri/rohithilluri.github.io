import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingBase, FlatRoof } from './BuildingBase';

/**
 * Project Pavilion building for the Projects zone
 * An open pavilion with columns and billboards to display projects
 */
export default function ProjectPavilion({ building, radius }) {
  const billboardRef = useRef();
  const { theta, phi, colors } = building;

  // Subtle billboard animation
  useFrame((state) => {
    if (billboardRef.current) {
      billboardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <BuildingBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4.5, 0.2, 3.5]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>

      {/* Columns */}
      {[
        [-1.8, 1.5, -1.4],
        [1.8, 1.5, -1.4],
        [-1.8, 1.5, 1.4],
        [1.8, 1.5, 1.4],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.15, 0.18, 2.8, 12]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
      ))}

      {/* Flat roof */}
      <FlatRoof
        width={4.2}
        depth={3.2}
        position={[0, 3, 0]}
        color={colors.primary}
      />

      {/* Roof edge decoration */}
      <mesh position={[0, 3.15, 0]}>
        <boxGeometry args={[4.4, 0.1, 3.4]} />
        <meshToonMaterial color={colors.accent} />
      </mesh>

      {/* Main billboard screen (back) */}
      <group ref={billboardRef} position={[0, 1.8, -1.2]}>
        {/* Screen frame */}
        <mesh>
          <boxGeometry args={[2.8, 1.8, 0.1]} />
          <meshToonMaterial color="#2D2D2D" />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.5, 1.5, 0.02]} />
          <meshBasicMaterial color="#1a1a2e" />
        </mesh>
        {/* Screen glow */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[2.4, 1.4, 0.01]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.3} />
        </mesh>
        {/* Code lines on screen */}
        {[-0.4, 0, 0.4].map((y, i) => (
          <mesh key={i} position={[-0.3 + i * 0.1, y, 0.09]}>
            <boxGeometry args={[1.2 - i * 0.2, 0.08, 0.01]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.8} />
          </mesh>
        ))}
      </group>

      {/* Side billboards */}
      {/* Left */}
      <group position={[-1.6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.2, 0.08]} />
          <meshToonMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.3, 1, 0.01]} />
          <meshBasicMaterial color={colors.primary} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Right */}
      <group position={[1.6, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.2, 0.08]} />
          <meshToonMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.3, 1, 0.01]} />
          <meshBasicMaterial color={colors.accent} transparent opacity={0.5} />
        </mesh>
      </group>

      {/* Blueprint icon floating above */}
      <group position={[0, 3.8, 0]}>
        {/* Blueprint paper */}
        <mesh rotation={[0.2, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.02]} />
          <meshToonMaterial color="#3B82F6" />
        </mesh>
        {/* Grid lines on blueprint */}
        {[-0.15, 0, 0.15].map((y, i) => (
          <mesh key={`h-${i}`} position={[0, y, 0.02]} rotation={[0.2, 0.3, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.01]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={0.7} />
          </mesh>
        ))}
        {[-0.2, 0, 0.2].map((x, i) => (
          <mesh key={`v-${i}`} position={[x, 0, 0.02]} rotation={[0.2, 0.3, 0]}>
            <boxGeometry args={[0.02, 0.5, 0.01]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={0.7} />
          </mesh>
        ))}
        {/* Glow */}
        <pointLight intensity={0.4} color={colors.accent} distance={2} />
      </group>

      {/* Information plaque */}
      <mesh position={[0, 0.5, 1.8]}>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>
    </BuildingBase>
  );
}
