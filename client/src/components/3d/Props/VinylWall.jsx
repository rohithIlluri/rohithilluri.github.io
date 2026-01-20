import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PropBase } from './PropBase';

// Vinyl colors for different artists
const VINYL_COLORS = [
  '#FF6B6B', // Coral
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
];

// Individual vinyl record display
function VinylRecord({ artist, index, total }) {
  const vinylRef = useRef();
  const armRef = useRef();

  // Position in a row
  const spacing = 1.8;
  const startX = -((total - 1) * spacing) / 2;
  const x = startX + index * spacing;

  const color = VINYL_COLORS[index % VINYL_COLORS.length];

  useFrame((state) => {
    if (vinylRef.current) {
      // Slow rotation when "playing"
      vinylRef.current.rotation.z = state.clock.elapsedTime * 0.5 + index;
    }
    if (armRef.current) {
      // Gentle arm movement
      armRef.current.rotation.z = -0.3 + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05;
    }
  });

  return (
    <group position={[x, 0, 2.5]}>
      {/* Record player base */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 0.15, 1]} />
        <meshToonMaterial color="#3D3D3D" />
      </mesh>

      {/* Turntable surface */}
      <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshToonMaterial color="#1a1a1a" />
      </mesh>

      {/* Spinning vinyl */}
      <group ref={vinylRef} position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.02, 32]} />
          <meshToonMaterial color="#111111" />
        </mesh>
        {/* Label */}
        <mesh position={[0, 0.015, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.01, 32]} />
          <meshToonMaterial color={color} />
        </mesh>
        {/* Grooves */}
        {[0.18, 0.25, 0.32].map((r, i) => (
          <mesh key={i} position={[0, 0.015, 0]}>
            <torusGeometry args={[r, 0.003, 4, 32]} />
            <meshToonMaterial color="#222222" />
          </mesh>
        ))}
      </group>

      {/* Tone arm */}
      <group ref={armRef} position={[0.4, 0.45, -0.3]}>
        <mesh rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.03, 0.35, 0.03]} />
          <meshToonMaterial color="#C4C4C4" />
        </mesh>
        {/* Needle head */}
        <mesh position={[-0.12, -0.15, 0]}>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          <meshToonMaterial color="#333333" />
        </mesh>
      </group>

      {/* Artist name plate */}
      <group position={[0, 0.15, 0.6]}>
        <mesh>
          <boxGeometry args={[0.9, 0.25, 0.05]} />
          <meshToonMaterial color={color} />
        </mesh>
      </group>

      {/* Album cover display behind */}
      <group position={[0, 0.8, -0.3]} rotation={[0.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.8, 0.8, 0.05]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Album art (abstract pattern) */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[0.7, 0.7, 0.01]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh position={[0.15, 0.15, 0.04]}>
          <circleGeometry args={[0.2, 16]} />
          <meshToonMaterial color="#FFFFFF" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Speaker */}
      <group position={[0.8, 0.4, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.6, 0.25]} />
          <meshToonMaterial color="#2D2D2D" />
        </mesh>
        <mesh position={[0, 0.1, 0.13]}>
          <circleGeometry args={[0.08, 16]} />
          <meshToonMaterial color="#111111" />
        </mesh>
        <mesh position={[0, -0.1, 0.13]}>
          <circleGeometry args={[0.05, 16]} />
          <meshToonMaterial color="#111111" />
        </mesh>
      </group>
    </group>
  );
}

// Floating music notes
function MusicNotes() {
  const notesRef = useRef();

  useFrame((state) => {
    if (notesRef.current) {
      notesRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={notesRef} position={[0, 2.5, 2.5]}>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const r = 1.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * r,
              Math.sin(i * 0.5) * 0.3,
              Math.sin(angle) * r,
            ]}
          >
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshToonMaterial color={VINYL_COLORS[i]} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * VinylWall - Shows music artist displays around the Record Store
 */
export default function VinylWall({ building, radius, data }) {
  const { theta, phi } = building;

  if (!data?.artists) return null;

  return (
    <PropBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Vinyl record displays */}
      {data.artists.map((artist, i) => (
        <VinylRecord
          key={artist.name}
          artist={artist}
          index={i}
          total={data.artists.length}
        />
      ))}

      {/* Floating music notes */}
      <MusicNotes />

      {/* Ground pattern - sound waves */}
      {[1, 1.5, 2, 2.5].map((r, i) => (
        <mesh
          key={i}
          position={[0, 0.02, 2.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[r, r + 0.05, 32]} />
          <meshToonMaterial color="#FFD93D" transparent opacity={0.2 - i * 0.04} />
        </mesh>
      ))}
    </PropBase>
  );
}
