import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingBase, Window, Door, FlatRoof } from './BuildingBase';
import FloatingMusicNotes from '../Props/FloatingMusicNotes';

/**
 * Record Store building for the Music zone
 * A music shop with vinyl displays and neon sign
 */
export default function RecordStore({ building, radius }) {
  const vinylRef = useRef();
  const neonRef = useRef();
  const { theta, phi, colors } = building;

  // Animate spinning vinyl and neon pulse
  useFrame((state) => {
    if (vinylRef.current) {
      vinylRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
    if (neonRef.current) {
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.4;
      neonRef.current.intensity = pulse;
    }
  });

  return (
    <BuildingBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Main building body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[3, 2, 2]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>

      {/* Flat roof */}
      <FlatRoof
        width={3.2}
        depth={2.2}
        position={[0, 2.1, 0]}
        color={colors.secondary}
      />

      {/* Awning */}
      <mesh position={[0, 1.9, 1.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[3.2, 0.05, 0.8]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>
      {/* Awning stripes */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[x * 0.8, 1.85, 1.3]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.4, 0.02, 0.7]} />
          <meshToonMaterial color={colors.accent} />
        </mesh>
      ))}

      {/* Door */}
      <Door position={[0, 0.6, 1.01]} width={0.8} height={1.2} color="#3D3D3D" />

      {/* Large display window */}
      <mesh position={[-1, 0.9, 1.01]}>
        <boxGeometry args={[0.9, 1.2, 0.05]} />
        <meshToonMaterial color="#1a1a2e" />
      </mesh>
      {/* Window frame */}
      <mesh position={[-1, 0.9, 1.03]}>
        <boxGeometry args={[1, 1.3, 0.02]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>

      {/* Vinyl records in window display */}
      {[-1.2, -0.8].map((x, i) => (
        <group key={i} position={[x, 0.8, 1.05]} rotation={[0, 0.3, 0]}>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
            <meshToonMaterial color="#111111" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshToonMaterial color={i === 0 ? colors.primary : colors.accent} />
          </mesh>
        </group>
      ))}

      {/* Side window */}
      <Window position={[1.51, 1, 0]} width={0.5} height={0.6} />

      {/* Neon sign "RECORDS" */}
      <group position={[0, 2.5, 1.1]}>
        {/* Sign backing */}
        <mesh>
          <boxGeometry args={[2.2, 0.5, 0.1]} />
          <meshToonMaterial color={colors.secondary} />
        </mesh>
        {/* Neon glow tubes */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.8, 0.25, 0.05]} />
          <meshBasicMaterial color={colors.primary} />
        </mesh>
        {/* Neon light */}
        <pointLight
          ref={neonRef}
          position={[0, 0, 0.3]}
          intensity={0.6}
          color={colors.primary}
          distance={3}
        />
      </group>

      {/* Floating spinning vinyl */}
      <group position={[0, 3.3, 0]}>
        <group ref={vinylRef}>
          {/* Vinyl disc */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.03, 32]} />
            <meshToonMaterial color="#111111" />
          </mesh>
          {/* Label */}
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
            <meshToonMaterial color={colors.primary} />
          </mesh>
          {/* Grooves effect (rings) */}
          {[0.2, 0.3, 0.4].map((r, i) => (
            <mesh key={i} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[r, 0.005, 8, 32]} />
              <meshToonMaterial color="#222222" />
            </mesh>
          ))}
        </group>
        {/* Glow */}
        <pointLight intensity={0.5} color={colors.primary} distance={2} />
      </group>

      {/* Animated floating music notes - "music in the air" */}
      <FloatingMusicNotes
        position={[0, 2.5, 0.5]}
        noteCount={6}
        color={colors.primary}
        secondaryColor={colors.accent}
        spread={2}
        floatHeight={2.5}
        speed={0.6}
      />

      {/* Speaker outside */}
      <mesh position={[1.8, 0.4, 0.5]}>
        <boxGeometry args={[0.5, 0.8, 0.4]} />
        <meshToonMaterial color="#2D2D2D" />
      </mesh>
      {/* Speaker cone */}
      <mesh position={[1.8, 0.4, 0.72]}>
        <circleGeometry args={[0.15, 16]} />
        <meshToonMaterial color="#111111" />
      </mesh>
    </BuildingBase>
  );
}
