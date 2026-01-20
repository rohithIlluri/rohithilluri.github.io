import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RARITY_CONFIG } from '../../../constants/collectibles';

/**
 * Postcard - A collectible postcard/story piece
 */
export default function Postcard({ collectible, radius }) {
  const groupRef = useRef();
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { theta, phi, heightOffset, color, rarity } = collectible;
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
      // Floating and rotating
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }

    if (cardRef.current) {
      // Flip on hover
      const targetRotX = hovered ? 0.1 : 0.3;
      cardRef.current.rotation.x = THREE.MathUtils.lerp(
        cardRef.current.rotation.x,
        targetRotX,
        0.1
      );

      // Scale on hover
      const targetScale = hovered ? rarityConfig.scale * 1.2 : rarityConfig.scale;
      cardRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={groupRef}>
        <group
          ref={cardRef}
          rotation={[0.3, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Postcard base */}
          <mesh>
            <boxGeometry args={[0.7, 0.45, 0.02]} />
            <meshToonMaterial color="#FFFEF0" />
          </mesh>

          {/* Front side - image area */}
          <mesh position={[-0.1, 0.02, 0.015]}>
            <boxGeometry args={[0.4, 0.35, 0.005]} />
            <meshToonMaterial color={color} />
          </mesh>

          {/* Decorative pattern on image */}
          <mesh position={[-0.15, 0.1, 0.02]}>
            <circleGeometry args={[0.08, 8]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={0.3} />
          </mesh>
          <mesh position={[-0.05, -0.05, 0.02]}>
            <boxGeometry args={[0.12, 0.08, 0.005]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={0.2} />
          </mesh>

          {/* Stamp */}
          <mesh position={[0.25, 0.15, 0.015]}>
            <boxGeometry args={[0.12, 0.15, 0.005]} />
            <meshToonMaterial color={color} />
          </mesh>
          {/* Stamp perforations */}
          {[-0.05, 0, 0.05].map((y, i) => (
            <mesh key={i} position={[0.25, 0.15 + y, 0.02]}>
              <circleGeometry args={[0.015, 8]} />
              <meshToonMaterial color="#FFFEF0" />
            </mesh>
          ))}

          {/* Address lines */}
          {[0, -0.05, -0.1].map((y, i) => (
            <mesh key={`line-${i}`} position={[0.22, y, 0.015]}>
              <boxGeometry args={[0.2 - i * 0.03, 0.015, 0.003]} />
              <meshToonMaterial color="#CCCCCC" />
            </mesh>
          ))}

          {/* Message text lines (back visible through) */}
          <mesh position={[-0.1, -0.12, 0.015]}>
            <boxGeometry args={[0.35, 0.01, 0.003]} />
            <meshToonMaterial color="#666666" transparent opacity={0.5} />
          </mesh>

          {/* Corner decorations */}
          {[
            [-0.32, 0.2],
            [0.32, 0.2],
            [-0.32, -0.2],
            [0.32, -0.2],
          ].map(([x, y], i) => (
            <mesh key={`corner-${i}`} position={[x, y, 0.015]}>
              <circleGeometry args={[0.02, 6]} />
              <meshToonMaterial color={color} transparent opacity={0.5} />
            </mesh>
          ))}

          {/* Glow when hovered */}
          {hovered && (
            <pointLight
              intensity={0.3 * rarityConfig.glow}
              color={color}
              distance={2}
            />
          )}
        </group>

        {/* Ground marker */}
        <mesh position={[0, -heightOffset + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.3, 16]} />
          <meshToonMaterial color={color} transparent opacity={0.3} />
        </mesh>

        {/* Subtle up arrow hint */}
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.05, 0.1, 4]} />
          <meshBasicMaterial color={color} transparent opacity={hovered ? 0.8 : 0.3} />
        </mesh>
      </group>
    </group>
  );
}
