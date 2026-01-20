import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PropBase } from './PropBase';

// Movie poster accent colors
const POSTER_COLORS = [
  '#C41E3A', // Kill Bill red
  '#1a1a2e', // Dark Knight dark
  '#2E4057', // Interstellar blue
  '#8B0000', // Pulp Fiction red
];

// Individual movie poster stand
function PosterStand({ movie, index, total }) {
  const spotlightRef = useRef();

  // Position in semi-circle
  const angle = (index / (total - 1 || 1)) * Math.PI * 0.8 - Math.PI * 0.4;
  const distance = 3.5;
  const x = Math.sin(angle) * distance;
  const z = Math.cos(angle) * distance;

  const color = POSTER_COLORS[index % POSTER_COLORS.length];

  useFrame((state) => {
    if (spotlightRef.current) {
      // Flickering spotlight effect
      const flicker = 0.4 + Math.sin(state.clock.elapsedTime * 8 + index * 2) * 0.05;
      spotlightRef.current.intensity = flicker;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, -angle, 0]}>
      {/* Poster stand base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.4]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>

      {/* Poster stand pole */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>

      {/* Poster frame */}
      <group position={[0, 1.8, 0.1]}>
        {/* Ornate frame */}
        <mesh>
          <boxGeometry args={[1.1, 1.5, 0.12]} />
          <meshToonMaterial color="#C9A227" />
        </mesh>

        {/* Inner frame */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.95, 1.35, 0.08]} />
          <meshToonMaterial color="#8B4513" />
        </mesh>

        {/* Poster background */}
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[0.85, 1.25, 0.02]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* Title area */}
        <mesh position={[0, -0.4, 0.09]}>
          <boxGeometry args={[0.7, 0.2, 0.01]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Year badge */}
        <mesh position={[0.3, 0.5, 0.09]}>
          <boxGeometry args={[0.25, 0.12, 0.01]} />
          <meshToonMaterial color="#FFD700" />
        </mesh>

        {/* Abstract movie imagery */}
        <mesh position={[0, 0.15, 0.09]}>
          <circleGeometry args={[0.25, 32]} />
          <meshToonMaterial color="#FFFFFF" transparent opacity={0.2} />
        </mesh>

        {/* Film strip decoration */}
        <group position={[-0.35, 0, 0.09]}>
          {[-0.4, -0.2, 0, 0.2, 0.4].map((y, i) => (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[0.1, 0.12, 0.01]} />
              <meshToonMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Spotlight above */}
      <group position={[0, 2.8, 0.3]}>
        <mesh rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshToonMaterial color="#333333" />
        </mesh>
        <pointLight
          ref={spotlightRef}
          position={[0, -0.2, 0]}
          intensity={0.4}
          color="#FFF5DC"
          distance={2}
        />
      </group>

      {/* Red velvet rope posts */}
      {[-0.5, 0.5].map((xOffset) => (
        <group key={xOffset} position={[xOffset, 0, 0.6]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.7, 8]} />
            <meshToonMaterial color="#C9A227" />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshToonMaterial color="#C9A227" />
          </mesh>
        </group>
      ))}

      {/* Velvet rope */}
      <mesh position={[0, 0.6, 0.6]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <meshToonMaterial color="#8B0000" />
      </mesh>
    </group>
  );
}

// Film reel decoration
function FilmReelDecor() {
  const reelRef = useRef();

  useFrame((state) => {
    if (reelRef.current) {
      reelRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={[0, 2, 0]}>
      <group ref={reelRef}>
        {/* Reel */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.08, 8, 24]} />
          <meshToonMaterial color="#333333" />
        </mesh>
        {/* Spokes */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 0.3,
              0,
              Math.sin((i / 6) * Math.PI * 2) * 0.3,
            ]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshToonMaterial color="#555555" />
          </mesh>
        ))}
      </group>
      <pointLight intensity={0.3} color="#E8B4A0" distance={2} />
    </group>
  );
}

/**
 * PosterFrame - Shows movie poster displays around the Cinema
 */
export default function PosterFrame({ building, radius, data }) {
  const { theta, phi } = building;

  if (!data?.movies) return null;

  return (
    <PropBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Movie poster stands */}
      {data.movies.map((movie, i) => (
        <PosterStand
          key={movie.name}
          movie={movie}
          index={i}
          total={data.movies.length}
        />
      ))}

      {/* Central film reel decoration */}
      <FilmReelDecor />

      {/* Red carpet path */}
      <mesh position={[0, 0.02, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.5, 3, 0.02]} />
        <meshToonMaterial color="#8B0000" />
      </mesh>

      {/* Stars on the ground (walk of fame style) */}
      {data.movies.map((_, i) => {
        const angle = (i / (data.movies.length - 1 || 1)) * Math.PI * 0.8 - Math.PI * 0.4;
        const r = 2;
        return (
          <mesh
            key={`star-${i}`}
            position={[Math.sin(angle) * r, 0.03, Math.cos(angle) * r]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <circleGeometry args={[0.2, 5]} />
            <meshToonMaterial color="#FFD700" />
          </mesh>
        );
      })}
    </PropBase>
  );
}
