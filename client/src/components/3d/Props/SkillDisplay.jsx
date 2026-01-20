import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { PropBase } from './PropBase';

// Skill icon colors based on category
const SKILL_COLORS = {
  Languages: '#F7DF1E', // JavaScript yellow
  Frontend: '#61DAFB',  // React blue
  Backend: '#68A063',   // Node green
  Tools: '#F05032',     // Git orange
};

// Simple floating skill cube
function SkillCube({ skill, index, totalInCategory, categoryIndex, color }) {
  const meshRef = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 1.5 + offset) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 + offset;
    }
  });

  // Position in a arc around the building
  const angle = (index / totalInCategory) * Math.PI * 0.6 - Math.PI * 0.3;
  const distance = 2.2 + categoryIndex * 0.8;
  const x = Math.sin(angle) * distance;
  const z = Math.cos(angle) * distance;

  return (
    <group position={[x, 0, z]}>
      <mesh ref={meshRef}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshToonMaterial color={color} />
      </mesh>
      {/* Glow effect */}
      <pointLight intensity={0.2} color={color} distance={1.5} />
    </group>
  );
}

// Category ring display
function CategoryRing({ category, categoryIndex, totalCategories }) {
  const color = SKILL_COLORS[category.name] || '#5DBFB8';
  const ringRadius = 2.5 + categoryIndex * 0.6;

  return (
    <group>
      {/* Category ring on ground */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringRadius - 0.1, ringRadius + 0.1, 32]} />
        <meshToonMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Skill cubes */}
      {category.skills.map((skill, i) => (
        <SkillCube
          key={skill}
          skill={skill}
          index={i}
          totalInCategory={category.skills.length}
          categoryIndex={categoryIndex}
          color={color}
        />
      ))}
    </group>
  );
}

/**
 * SkillDisplay - Shows floating skill icons around the Workshop building
 */
export default function SkillDisplay({ building, radius, data }) {
  const { theta, phi } = building;

  if (!data?.categories) return null;

  return (
    <PropBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Central skill pillar */}
      <group position={[0, 0, 0]}>
        {/* Base */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.2, 16]} />
          <meshToonMaterial color="#E8DFD3" />
        </mesh>

        {/* Category rings */}
        {data.categories.map((category, i) => (
          <CategoryRing
            key={category.name}
            category={category}
            categoryIndex={i}
            totalCategories={data.categories.length}
          />
        ))}

        {/* Category labels (floating signs) */}
        {data.categories.map((category, i) => {
          const angle = (i / data.categories.length) * Math.PI * 2;
          const labelRadius = 3.5;
          const color = SKILL_COLORS[category.name] || '#5DBFB8';

          return (
            <group
              key={`label-${category.name}`}
              position={[
                Math.sin(angle) * labelRadius,
                0.5,
                Math.cos(angle) * labelRadius,
              ]}
              rotation={[0, -angle + Math.PI, 0]}
            >
              {/* Sign post */}
              <mesh position={[0, -0.25, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
                <meshToonMaterial color="#8B4513" />
              </mesh>
              {/* Sign board */}
              <mesh>
                <boxGeometry args={[0.8, 0.3, 0.05]} />
                <meshToonMaterial color={color} />
              </mesh>
            </group>
          );
        })}
      </group>
    </PropBase>
  );
}
