import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RARITY_CONFIG } from '../../../constants/collectibles';

/**
 * PhotoFrame - A scattered photo/memory collectible
 */
export default function PhotoFrame({ collectible, radius }) {
  const groupRef = useRef();
  const frameRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { theta, phi, heightOffset, frameColor, rarity } = collectible;
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
      // Gentle sway
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }

    if (frameRef.current) {
      // Hover effect
      const targetY = hovered ? 0.3 : 0;
      frameRef.current.position.y = THREE.MathUtils.lerp(
        frameRef.current.position.y,
        targetY,
        0.1
      );

      // Scale on hover
      const targetScale = hovered ? rarityConfig.scale * 1.15 : rarityConfig.scale;
      frameRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={groupRef}>
        <group
          ref={frameRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Photo frame - standing upright */}
          <group rotation={[0.2, 0, 0]}>
            {/* Frame border */}
            <mesh>
              <boxGeometry args={[0.6, 0.5, 0.05]} />
              <meshToonMaterial color={frameColor} />
            </mesh>

            {/* Inner frame (darker) */}
            <mesh position={[0, 0, 0.01]}>
              <boxGeometry args={[0.52, 0.42, 0.03]} />
              <meshToonMaterial color="#5A4A3A" />
            </mesh>

            {/* Photo area */}
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.45, 0.35, 0.01]} />
              <meshToonMaterial color="#F5F5DC" />
            </mesh>

            {/* Abstract photo content */}
            <mesh position={[-0.1, 0.05, 0.04]}>
              <circleGeometry args={[0.08, 16]} />
              <meshToonMaterial color="#87CEEB" transparent opacity={0.7} />
            </mesh>
            <mesh position={[0.05, -0.05, 0.04]}>
              <boxGeometry args={[0.15, 0.1, 0.005]} />
              <meshToonMaterial color="#90EE90" transparent opacity={0.6} />
            </mesh>

            {/* Shine effect */}
            <mesh position={[0.15, 0.12, 0.035]} rotation={[0, 0, -0.3]}>
              <boxGeometry args={[0.02, 0.15, 0.001]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Stand */}
          <mesh position={[0, -0.2, -0.15]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.3, 0.02, 0.25]} />
            <meshToonMaterial color={frameColor} />
          </mesh>

          {/* Glow effect when hovered */}
          {hovered && (
            <pointLight
              intensity={0.4 * rarityConfig.glow}
              color="#FFF5DC"
              distance={2}
            />
          )}
        </group>

        {/* Ground shadow/marker */}
        <mesh position={[0, -heightOffset + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25, 16]} />
          <meshToonMaterial color={frameColor} transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
