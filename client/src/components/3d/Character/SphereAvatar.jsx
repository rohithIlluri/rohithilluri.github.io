import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PLANET_COLORS, PLANET_CONFIG } from '../../../constants/planetTheme';
import useKeyboardControls from '../../../hooks/useKeyboardControls';
import useSphereMovement from '../../../hooks/useSphereMovement';
import { usePlanet } from '../../../context/PlanetContext';

export default function SphereAvatar() {
  const groupRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  const { getMovement, isMoving } = useKeyboardControls();
  const { move, setInitialPosition, getOrientationQuaternion } = useSphereMovement();
  const {
    setCharacterPosition,
    checkNearbyLandmark,
    setIsMoving,
    isInDialogue,
  } = usePlanet();

  // Set initial position on mount
  useEffect(() => {
    setInitialPosition(Math.PI * 0.1, Math.PI / 2);
  }, [setInitialPosition]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Disable movement when in dialogue
    const movement = isInDialogue
      ? { forward: false, backward: false, left: false, right: false }
      : getMovement();

    // Handle movement
    const result = move(movement, delta);

    // Update group position and orientation
    groupRef.current.position.copy(result.position);
    groupRef.current.quaternion.copy(getOrientationQuaternion());

    // Update context
    setCharacterPosition(result.position);
    setIsMoving(result.isMoving);
    checkNearbyLandmark(result.position);

    // Walking animation
    const moving = isMoving() && !isInDialogue;
    const time = state.clock.elapsedTime;
    const walkSpeed = 8;
    const walkAmount = moving ? 0.4 : 0;

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(time * walkSpeed) * walkAmount;
      rightLegRef.current.rotation.x = -Math.sin(time * walkSpeed) * walkAmount;
    }

    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = -Math.sin(time * walkSpeed) * walkAmount * 0.5;
      rightArmRef.current.rotation.x = Math.sin(time * walkSpeed) * walkAmount * 0.5;
    }

    // Idle breathing when not moving
    if (!moving && groupRef.current) {
      groupRef.current.position.y += Math.sin(time * 2) * 0.01;
    }
  });

  const colors = PLANET_COLORS.character;

  return (
    <group ref={groupRef}>
      {/* Offset to stand on surface */}
      <group position={[0, PLANET_CONFIG.characterHeight / 2, 0]}>
        {/* Head */}
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshToonMaterial color={colors.skin} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.8, -0.05]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshToonMaterial color={colors.hair} />
        </mesh>

        {/* Body */}
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.2, 0.4, 8, 16]} />
          <meshToonMaterial color={colors.shirt} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.3, 0.3, 0]}>
          <mesh>
            <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
            <meshToonMaterial color={colors.shirt} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshToonMaterial color={colors.skin} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.3, 0.3, 0]}>
          <mesh>
            <capsuleGeometry args={[0.06, 0.25, 8, 8]} />
            <meshToonMaterial color={colors.shirt} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshToonMaterial color={colors.skin} />
          </mesh>
        </group>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, -0.2, 0]}>
          <mesh>
            <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
            <meshToonMaterial color={colors.pants} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.3, 0.05]}>
            <boxGeometry args={[0.12, 0.08, 0.18]} />
            <meshToonMaterial color={colors.shoes} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, -0.2, 0]}>
          <mesh>
            <capsuleGeometry args={[0.08, 0.35, 8, 8]} />
            <meshToonMaterial color={colors.pants} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.3, 0.05]}>
            <boxGeometry args={[0.12, 0.08, 0.18]} />
            <meshToonMaterial color={colors.shoes} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
