import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingBase, Window, Door, PeakedRoof, Chimney } from './BuildingBase';
import SmokeEffect from '../Props/SmokeEffect';

/**
 * Workshop building for the Skills zone
 * A craftsman's workshop with tools and a peaked roof
 */
export default function Workshop({ building, radius }) {
  const toolRef = useRef();
  const { theta, phi, colors } = building;

  // Animate floating tool
  useFrame((state) => {
    if (toolRef.current) {
      toolRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      toolRef.current.position.y = 2.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <BuildingBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Main building body */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.5, 2.4, 2.5]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>

      {/* Peaked roof */}
      <PeakedRoof
        width={3.8}
        depth={2.8}
        height={1.2}
        position={[0, 2.8, 0]}
        color="#8B5A2B"
      />

      {/* Chimney */}
      <Chimney position={[1, 3.4, 0.5]} color="#6B4423" />
      {/* Animated smoke effect - "someone was just here" */}
      <SmokeEffect position={[1, 3.7, 0.5]} color="#D4D4D4" particleCount={4} />

      {/* Door */}
      <Door position={[0, 0.6, 1.3]} />

      {/* Windows */}
      <Window position={[-1.1, 1.3, 1.26]} />
      <Window position={[1.1, 1.3, 1.26]} />

      {/* Back window */}
      <Window position={[0, 1.3, -1.26]} width={0.6} height={0.5} />

      {/* Workbench outside */}
      <mesh position={[2.2, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.8, 1.5]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      {/* Tools on workbench */}
      <mesh position={[2.2, 0.85, 0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshToonMaterial color="#C4C4C4" />
      </mesh>
      <mesh position={[2.2, 0.85, -0.3]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshToonMaterial color="#C4C4C4" />
      </mesh>

      {/* Floating wrench icon */}
      <group ref={toolRef} position={[0, 2.8, 0]}>
        {/* Wrench handle */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.1, 0.6, 0.08]} />
          <meshToonMaterial color={colors.accent} />
        </mesh>
        {/* Wrench head */}
        <mesh position={[0.15, 0.25, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.2, 0.15, 0.08]} />
          <meshToonMaterial color={colors.accent} />
        </mesh>
        {/* Glow effect */}
        <pointLight intensity={0.5} color={colors.accent} distance={2} />
      </group>

      {/* Ground decoration - stepping stones */}
      <mesh position={[0, 0.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 8]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>
      <mesh position={[0.4, 0.02, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 8]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>

      {/* Sign */}
      <group position={[0, 2.5, 1.28]}>
        <mesh>
          <boxGeometry args={[1.2, 0.35, 0.08]} />
          <meshToonMaterial color={colors.secondary} />
        </mesh>
      </group>
    </BuildingBase>
  );
}
