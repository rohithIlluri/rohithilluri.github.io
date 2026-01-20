import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingBase, Window, Door, PeakedRoof } from './BuildingBase';

/**
 * Post Office building for the Contact zone
 * A post office with mailbox and clock
 */
export default function PostOffice({ building, radius }) {
  const envelopeRef = useRef();
  const flagRef = useRef();
  const clockHandRef = useRef();
  const mailboxGlowRef = useRef();
  const { theta, phi, colors } = building;

  // Animate floating envelope, flag wave, and clock
  useFrame((state) => {
    if (envelopeRef.current) {
      envelopeRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      envelopeRef.current.position.y = 3.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
    if (flagRef.current) {
      flagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
    if (clockHandRef.current) {
      clockHandRef.current.rotation.z = -state.clock.elapsedTime * 0.5;
    }
    if (mailboxGlowRef.current) {
      // Gentle pulsing glow on mailbox - inviting visitors to connect
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
      mailboxGlowRef.current.intensity = pulse;
    }
  });

  return (
    <BuildingBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Main building body */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3, 2.4, 2]} />
        <meshToonMaterial color={colors.secondary} />
      </mesh>

      {/* Peaked roof */}
      <PeakedRoof
        width={3.3}
        depth={2.3}
        height={1}
        position={[0, 2.8, 0]}
        color={colors.primary}
      />

      {/* Clock on roof */}
      <group position={[0, 2.6, 1.05]}>
        {/* Clock face */}
        <mesh>
          <cylinderGeometry args={[0.35, 0.35, 0.1, 24]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Clock border */}
        <mesh>
          <torusGeometry args={[0.35, 0.04, 8, 24]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
        {/* Clock hand */}
        <group ref={clockHandRef} position={[0, 0.06, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.02, 0.25, 0.02]} />
            <meshToonMaterial color="#333333" />
          </mesh>
        </group>
        {/* Hour markers */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 0.25,
              0.06,
              Math.sin((i / 4) * Math.PI * 2) * 0.25,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <boxGeometry args={[0.03, 0.08, 0.02]} />
            <meshToonMaterial color="#333333" />
          </mesh>
        ))}
      </group>

      {/* Door */}
      <Door position={[0, 0.65, 1.01]} width={0.8} height={1.3} color={colors.primary} />

      {/* Windows */}
      <Window position={[-1, 1.2, 1.01]} />
      <Window position={[1, 1.2, 1.01]} />
      <Window position={[0, 1.2, -1.01]} width={0.6} />

      {/* Service window */}
      <mesh position={[-1.51, 1, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.8]} />
        <meshToonMaterial color="#A8D8DC" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-1.53, 1, 0]}>
        <boxGeometry args={[0.02, 0.7, 0.9]} />
        <meshToonMaterial color={colors.primary} />
      </mesh>

      {/* Mailbox with inviting glow */}
      <group position={[1.8, 0.6, 0.5]}>
        {/* Mailbox body */}
        <mesh>
          <boxGeometry args={[0.5, 0.9, 0.4]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
        {/* Inviting glow - "messages travel far from here" */}
        <pointLight
          ref={mailboxGlowRef}
          position={[0, 0.2, 0.3]}
          intensity={0.4}
          color={colors.accent}
          distance={2}
        />
        {/* Mailbox slot */}
        <mesh position={[0, 0.2, 0.21]}>
          <boxGeometry args={[0.3, 0.05, 0.02]} />
          <meshToonMaterial color="#1a1a2e" />
        </mesh>
        {/* Collection time sign */}
        <mesh position={[0, -0.2, 0.21]}>
          <boxGeometry args={[0.35, 0.2, 0.02]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Mailbox top */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 8, 1, false, 0, Math.PI]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
      </group>

      {/* Flag pole */}
      <group position={[1.8, 0, -0.5]}>
        {/* Pole */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 3, 8]} />
          <meshToonMaterial color="#C4C4C4" />
        </mesh>
        {/* Flag */}
        <group ref={flagRef} position={[0.25, 2.7, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.35, 0.02]} />
            <meshToonMaterial color={colors.accent} />
          </mesh>
        </group>
        {/* Pole top */}
        <mesh position={[0, 3.05, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshToonMaterial color="#FFD700" />
        </mesh>
      </group>

      {/* Floating envelope icon */}
      <group ref={envelopeRef} position={[0, 3.5, 0]}>
        {/* Envelope body */}
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.05]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Envelope flap */}
        <mesh position={[0, 0.15, 0]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.55, 0.25, 0.02]} />
          <meshToonMaterial color="#F5F5F5" />
        </mesh>
        {/* Stamp */}
        <mesh position={[0.2, 0.1, 0.03]}>
          <boxGeometry args={[0.12, 0.15, 0.01]} />
          <meshToonMaterial color={colors.accent} />
        </mesh>
        {/* Address lines */}
        {[-0.05, -0.1].map((y, i) => (
          <mesh key={i} position={[-0.1, y, 0.03]}>
            <boxGeometry args={[0.25, 0.02, 0.01]} />
            <meshToonMaterial color="#CCCCCC" />
          </mesh>
        ))}
        {/* Glow */}
        <pointLight intensity={0.5} color={colors.accent} distance={2} />
      </group>

      {/* "POST OFFICE" sign */}
      <group position={[0, 2.2, 1.02]}>
        <mesh>
          <boxGeometry args={[1.8, 0.35, 0.08]} />
          <meshToonMaterial color={colors.primary} />
        </mesh>
      </group>

      {/* Decorative postal stamp pattern on side */}
      <group position={[1.51, 1.5, 0]}>
        {[[-0.3, 0.3], [0.3, 0.3], [-0.3, -0.3], [0.3, -0.3]].map(([y, z], i) => (
          <mesh key={i} position={[0, y, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.25, 0.02]} />
            <meshToonMaterial color={colors.accent} transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Stepping stones to door */}
      {[0, 0.5, 1].map((z, i) => (
        <mesh key={i} position={[0, 0.02, 1.5 + z * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25 - i * 0.03, 8]} />
          <meshToonMaterial color={colors.secondary} />
        </mesh>
      ))}
    </BuildingBase>
  );
}
