import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Animated floating music notes
 * Creates the "music in the air" atmosphere for the Record Store
 */
export default function FloatingMusicNotes({
  position = [0, 0, 0],
  noteCount = 5,
  color = '#F4D03F',
  secondaryColor = '#FFE082',
  spread = 1.5,
  floatHeight = 2,
  speed = 0.8,
}) {
  const notesRef = useRef([]);

  // Generate random note configurations
  const noteConfigs = useMemo(() => {
    return Array.from({ length: noteCount }).map((_, i) => ({
      // Starting position offset
      startX: (Math.random() - 0.5) * spread,
      startZ: (Math.random() - 0.5) * spread,
      // Animation parameters
      phase: Math.random() * Math.PI * 2,
      floatSpeed: speed * (0.8 + Math.random() * 0.4),
      sway: 0.3 + Math.random() * 0.3,
      swaySpeed: 0.8 + Math.random() * 0.4,
      // Visual
      size: 0.06 + Math.random() * 0.04,
      isQuarter: Math.random() > 0.5, // Quarter note vs eighth note
      useSecondary: i % 2 === 0,
    }));
  }, [noteCount, spread, speed]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    notesRef.current.forEach((noteGroup, i) => {
      if (!noteGroup) return;

      const config = noteConfigs[i];

      // Vertical float (loop up and fade, respawn at bottom)
      const cycleTime = (time * config.floatSpeed + config.phase) % 3;
      const progress = cycleTime / 3;
      const y = progress * floatHeight;

      // Horizontal sway
      const x = config.startX + Math.sin(time * config.swaySpeed + config.phase) * config.sway;
      const z = config.startZ + Math.cos(time * config.swaySpeed * 0.7 + config.phase) * config.sway * 0.5;

      noteGroup.position.set(x, y, z);

      // Rotation
      noteGroup.rotation.z = Math.sin(time + config.phase) * 0.3;
      noteGroup.rotation.y = time * 0.5 + config.phase;

      // Scale based on progress (grow then shrink)
      const scaleProgress = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      const scale = config.size * (0.5 + scaleProgress * 0.5);
      noteGroup.scale.setScalar(scale * 10); // Multiply for visibility

      // Opacity (fade in and out)
      noteGroup.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = Math.sin(progress * Math.PI) * 0.8;
        }
      });
    });
  });

  return (
    <group position={position}>
      {noteConfigs.map((config, i) => (
        <group
          key={i}
          ref={(el) => {
            notesRef.current[i] = el;
          }}
        >
          {/* Music note - simplified shape */}
          {config.isQuarter ? (
            // Quarter note (filled oval + stem)
            <>
              {/* Note head */}
              <mesh rotation={[0, 0, 0.3]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshToonMaterial
                  color={config.useSecondary ? secondaryColor : color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              {/* Stem */}
              <mesh position={[0.05, 0.15, 0]}>
                <boxGeometry args={[0.015, 0.25, 0.015]} />
                <meshToonMaterial
                  color={config.useSecondary ? secondaryColor : color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </>
          ) : (
            // Eighth note (with flag)
            <>
              {/* Note head */}
              <mesh rotation={[0, 0, 0.3]}>
                <sphereGeometry args={[0.07, 8, 6]} />
                <meshToonMaterial
                  color={config.useSecondary ? secondaryColor : color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              {/* Stem */}
              <mesh position={[0.04, 0.12, 0]}>
                <boxGeometry args={[0.012, 0.2, 0.012]} />
                <meshToonMaterial
                  color={config.useSecondary ? secondaryColor : color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
              {/* Flag */}
              <mesh position={[0.06, 0.18, 0]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.08, 0.02, 0.01]} />
                <meshToonMaterial
                  color={config.useSecondary ? secondaryColor : color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
