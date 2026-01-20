import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RARITY_CONFIG } from '../../../constants/collectibles';

/**
 * MemoryOrb - Glowing collectible sphere with animated effects
 */
export default function MemoryOrb({ collectible, radius }) {
  const groupRef = useRef();
  const orbRef = useRef();
  const ringsRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { theta, phi, heightOffset, color, glowColor, rarity } = collectible;
  const rarityConfig = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  // Calculate position on sphere
  const { position, quaternion } = useMemo(() => {
    const surfaceRadius = radius + heightOffset;
    const pos = new THREE.Vector3(
      surfaceRadius * Math.sin(phi) * Math.cos(theta),
      surfaceRadius * Math.cos(phi),
      surfaceRadius * Math.sin(phi) * Math.sin(theta)
    );

    const normal = pos.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );

    return { position: pos, quaternion: quat };
  }, [theta, phi, radius, heightOffset]);

  // Animation
  useFrame((state) => {
    if (groupRef.current) {
      // Floating motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }

    if (orbRef.current) {
      // Slow rotation
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5;

      // Scale pulse on hover
      const targetScale = hovered ? rarityConfig.scale * 1.2 : rarityConfig.scale;
      orbRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }

    if (ringsRef.current) {
      // Rings rotation
      ringsRef.current.rotation.x = state.clock.elapsedTime * 0.8;
      ringsRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={groupRef}>
        {/* Main orb */}
        <group
          ref={orbRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Outer glow sphere */}
          <mesh>
            <sphereGeometry args={[0.35, 32, 32]} />
            <meshBasicMaterial
              color={glowColor}
              transparent
              opacity={0.3 * rarityConfig.glow}
            />
          </mesh>

          {/* Inner solid orb */}
          <mesh>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshToonMaterial color={color} />
          </mesh>

          {/* Core glow */}
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>

          {/* Sparkle particles */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            const sparkleRadius = 0.3;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * sparkleRadius,
                  Math.sin(angle * 2) * 0.1,
                  Math.sin(angle) * sparkleRadius,
                ]}
              >
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            );
          })}
        </group>

        {/* Orbiting rings */}
        <group ref={ringsRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.4, 0.015, 8, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
            <torusGeometry args={[0.45, 0.01, 8, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.4} />
          </mesh>
        </group>

        {/* Point light for glow effect */}
        <pointLight
          intensity={rarityConfig.glow * 0.5}
          color={glowColor}
          distance={3}
        />

        {/* Ground glow ring */}
        <mesh position={[0, -heightOffset + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.5, 32]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
}
