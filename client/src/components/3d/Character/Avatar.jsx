import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { NYC_COLORS } from '../../../constants/nycTheme';

// Simple stylized third-person character
export default function Avatar({ position = [0, 0, 0], isMoving = false }) {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  // Walking/idle animation
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    if (isMoving) {
      // Walking animation
      const walkSpeed = 8;
      const legSwing = Math.sin(time * walkSpeed) * 0.4;
      const armSwing = Math.sin(time * walkSpeed) * 0.3;

      if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;
    } else {
      // Idle animation - subtle breathing
      const idleSpeed = 2;
      const breathe = Math.sin(time * idleSpeed) * 0.02;

      groupRef.current.position.y = position[1] + breathe;

      // Reset limbs to neutral
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.9;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.9;
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.9;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshToonMaterial color={NYC_COLORS.character.skin} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.75, -0.05]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshToonMaterial color={NYC_COLORS.character.hair} />
      </mesh>

      {/* Body/Torso */}
      <mesh position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.2, 0.5, 8, 16]} />
        <meshToonMaterial color={NYC_COLORS.character.shirt} />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.3, 1.2, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
          <meshToonMaterial color={NYC_COLORS.character.shirt} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.45, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshToonMaterial color={NYC_COLORS.character.skin} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.3, 1.2, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
          <meshToonMaterial color={NYC_COLORS.character.shirt} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.45, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshToonMaterial color={NYC_COLORS.character.skin} />
        </mesh>
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.12, 0.6, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshToonMaterial color={NYC_COLORS.character.pants} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.55, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshToonMaterial color={NYC_COLORS.character.shoes} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.12, 0.6, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
          <meshToonMaterial color={NYC_COLORS.character.pants} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.55, 0.05]}>
          <boxGeometry args={[0.12, 0.1, 0.2]} />
          <meshToonMaterial color={NYC_COLORS.character.shoes} />
        </mesh>
      </group>
    </group>
  );
}
