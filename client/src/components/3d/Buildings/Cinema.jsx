import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingBase, Door } from './BuildingBase';

/**
 * Cinema building for the Movies zone
 * An art-deco style movie theater with marquee and poster frames
 */
export default function Cinema({ building, radius }) {
  const marqueeRef = useRef();
  const starRef = useRef();
  const { theta, phi, colors } = building;

  // Animate marquee lights and floating star
  useFrame((state) => {
    if (marqueeRef.current) {
      // Chase effect for marquee lights
      const children = marqueeRef.current.children;
      children.forEach((child, i) => {
        if (child.material) {
          const phase = (state.clock.elapsedTime * 3 + i * 0.3) % 1;
          child.material.opacity = 0.3 + phase * 0.7;
        }
      });
    }
    if (starRef.current) {
      starRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      starRef.current.position.y = 4.2 + Math.sin(state.clock.elapsedTime) * 0.15;
    }
  });

  return (
    <BuildingBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Main building body */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[4, 3, 3]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>

      {/* Art deco facade (front extension) */}
      <mesh position={[0, 2, 1.6]}>
        <boxGeometry args={[4.2, 3.5, 0.3]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>

      {/* Art deco stepped top */}
      <mesh position={[0, 3.9, 1.6]}>
        <boxGeometry args={[3.5, 0.3, 0.35]} />
        <meshToonMaterial color={colors.accent} />
      </mesh>
      <mesh position={[0, 4.1, 1.6]}>
        <boxGeometry args={[2.5, 0.2, 0.35]} />
        <meshToonMaterial color={colors.accent} />
      </mesh>

      {/* Marquee sign */}
      <group position={[0, 2.8, 1.9]}>
        {/* Main marquee board */}
        <mesh>
          <boxGeometry args={[3.5, 0.8, 0.15]} />
          <meshToonMaterial color="#1a1a2e" />
        </mesh>
        {/* Marquee text area */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[3.2, 0.6, 0.02]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Marquee border lights */}
        <group ref={marqueeRef}>
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh
              key={i}
              position={[-1.6 + i * 0.22, 0.5, 0.1]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={colors.accent} transparent opacity={0.8} />
            </mesh>
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh
              key={`b-${i}`}
              position={[-1.6 + i * 0.22, -0.5, 0.1]}
            >
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color={colors.accent} transparent opacity={0.8} />
            </mesh>
          ))}
        </group>
        {/* Marquee light */}
        <pointLight position={[0, 0, 0.5]} intensity={0.4} color="#FFF5DC" distance={3} />
      </group>

      {/* Double doors */}
      <Door position={[-0.4, 0.7, 1.76]} width={0.6} height={1.4} color="#3D3D3D" />
      <Door position={[0.4, 0.7, 1.76]} width={0.6} height={1.4} color="#3D3D3D" />

      {/* Poster frames */}
      {[-1.5, 1.5].map((x, i) => (
        <group key={i} position={[x, 1.2, 1.78]}>
          {/* Frame */}
          <mesh>
            <boxGeometry args={[0.8, 1.1, 0.08]} />
            <meshToonMaterial color="#8B4513" />
          </mesh>
          {/* Poster */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.65, 0.95, 0.02]} />
            <meshToonMaterial color={i === 0 ? '#2E4057' : '#8B2635'} />
          </mesh>
          {/* Poster highlight */}
          <mesh position={[0, 0.2, 0.07]}>
            <boxGeometry args={[0.5, 0.3, 0.01]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Ticket booth */}
      <mesh position={[2.3, 0.6, 1]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshToonMaterial color={colors.accent} />
      </mesh>
      {/* Ticket window */}
      <mesh position={[2.3, 0.8, 1.41]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshToonMaterial color="#A8D8DC" transparent opacity={0.7} />
      </mesh>

      {/* Floating star/film reel icon */}
      <group ref={starRef} position={[0, 4.2, 0]}>
        {/* Film reel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.08, 8, 16]} />
          <meshToonMaterial color="#333333" />
        </mesh>
        {/* Reel spokes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 0.2,
              0,
              Math.sin((i / 6) * Math.PI * 2) * 0.2,
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshToonMaterial color="#555555" />
          </mesh>
        ))}
        {/* Center */}
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshToonMaterial color={colors.accent} />
        </mesh>
        {/* Glow */}
        <pointLight intensity={0.5} color={colors.accent} distance={2} />
      </group>

      {/* Decorative film strip on side */}
      <group position={[-2.01, 1.5, 0]}>
        {[0, 0.4, 0.8, 1.2].map((y, i) => (
          <mesh key={i} position={[0, y - 0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.5, 0.3, 0.05]} />
            <meshToonMaterial color="#2D2D2D" />
          </mesh>
        ))}
      </group>

      {/* Red carpet area */}
      <mesh position={[0, 0.02, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 0.02]} />
        <meshToonMaterial color="#8B0000" />
      </mesh>
    </BuildingBase>
  );
}
