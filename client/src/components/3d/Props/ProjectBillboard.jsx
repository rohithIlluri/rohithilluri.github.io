import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PropBase } from './PropBase';

// Tech stack colors
const TECH_COLORS = {
  'Next.js': '#000000',
  'React': '#61DAFB',
  'Python': '#3776AB',
  'TypeScript': '#3178C6',
  'JavaScript': '#F7DF1E',
};

// Individual project billboard
function Billboard({ project, index, total }) {
  const glowRef = useRef();

  // Calculate position around building
  const angle = (index / total) * Math.PI * 1.2 - Math.PI * 0.6;
  const distance = 3;
  const x = Math.sin(angle) * distance;
  const z = Math.cos(angle) * distance;

  const techColor = TECH_COLORS[project.tech] || '#5DBFB8';

  useFrame((state) => {
    if (glowRef.current) {
      // Subtle pulsing glow
      const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      glowRef.current.intensity = pulse;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, -angle, 0]}>
      {/* Billboard stand */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 1.6, 8]} />
        <meshToonMaterial color="#4A4A4A" />
      </mesh>

      {/* Billboard frame */}
      <group position={[0, 1.8, 0]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[1.4, 1, 0.1]} />
          <meshToonMaterial color="#2D2D2D" />
        </mesh>

        {/* Screen background */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.25, 0.85, 0.02]} />
          <meshToonMaterial color="#1a1a2e" />
        </mesh>

        {/* Project name area */}
        <mesh position={[0, 0.25, 0.08]}>
          <boxGeometry args={[1.1, 0.25, 0.01]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Tech badge */}
        <mesh position={[0.4, -0.25, 0.08]}>
          <boxGeometry args={[0.4, 0.15, 0.01]} />
          <meshToonMaterial color={techColor} />
        </mesh>

        {/* Description lines (visual representation) */}
        {[-0.05, -0.15].map((y, i) => (
          <mesh key={i} position={[-0.15, y, 0.08]}>
            <boxGeometry args={[0.6 - i * 0.1, 0.06, 0.01]} />
            <meshToonMaterial color="#666666" />
          </mesh>
        ))}

        {/* Interactive indicator (if has URL) */}
        {project.url && (
          <mesh position={[-0.45, -0.3, 0.08]}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#4CAF50" />
          </mesh>
        )}

        {/* Glow light */}
        <pointLight
          ref={glowRef}
          position={[0, 0, 0.5]}
          intensity={0.3}
          color={techColor}
          distance={2}
        />
      </group>

      {/* Ground marker */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.3, 16]} />
        <meshToonMaterial color={techColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

/**
 * ProjectBillboard - Shows project info around the Pavilion building
 */
export default function ProjectBillboard({ building, radius, data }) {
  const { theta, phi } = building;

  if (!data?.projects) return null;

  return (
    <PropBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Central display pillar */}
      <group position={[0, 0, 0]}>
        {/* Base platform */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.8, 1, 0.1, 16]} />
          <meshToonMaterial color="#98D8C8" />
        </mesh>

        {/* Project count indicator */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.3, 8]} />
          <meshToonMaterial color="#5DBFB8" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>

        {/* Individual project billboards */}
        {data.projects.map((project, i) => (
          <Billboard
            key={project.name}
            project={project}
            index={i}
            total={data.projects.length}
          />
        ))}

        {/* Connecting lines on ground */}
        {data.projects.map((_, i) => {
          const angle = (i / data.projects.length) * Math.PI * 1.2 - Math.PI * 0.6;
          return (
            <mesh
              key={`line-${i}`}
              position={[Math.sin(angle) * 1.5, 0.02, Math.cos(angle) * 1.5]}
              rotation={[-Math.PI / 2, 0, angle]}
            >
              <boxGeometry args={[0.05, 1.5, 0.01]} />
              <meshToonMaterial color="#98D8C8" transparent opacity={0.4} />
            </mesh>
          );
        })}
      </group>
    </PropBase>
  );
}
