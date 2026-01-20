import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PropBase } from './PropBase';

// Social link icon colors
const LINK_COLORS = {
  github: '#333333',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  email: '#FF6B6B',
};

// Individual social link mailbox
function SocialMailbox({ link, index, total }) {
  const flagRef = useRef();
  const envelopeRef = useRef();

  // Position in arc
  const angle = (index / (total - 1 || 1)) * Math.PI * 0.6 - Math.PI * 0.3;
  const distance = 3;
  const x = Math.sin(angle) * distance;
  const z = Math.cos(angle) * distance;

  const color = LINK_COLORS[link.icon] || link.color || '#5DBFB8';

  useFrame((state) => {
    if (flagRef.current) {
      // Flag waving
      flagRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3 + index) * 0.1;
    }
    if (envelopeRef.current) {
      // Envelope floating
      envelopeRef.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      envelopeRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, -angle + Math.PI, 0]}>
      {/* Mailbox post */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>

      {/* Mailbox body */}
      <group position={[0, 1.1, 0]}>
        {/* Main box */}
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.35]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* Rounded top */}
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.175, 0.175, 0.6, 16, 1, false, 0, Math.PI]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* Mail slot */}
        <mesh position={[0, 0.05, 0.18]}>
          <boxGeometry args={[0.35, 0.03, 0.02]} />
          <meshToonMaterial color="#1a1a1a" />
        </mesh>

        {/* Flag */}
        <group position={[0.35, 0.1, 0]}>
          <mesh>
            <boxGeometry args={[0.02, 0.25, 0.02]} />
            <meshToonMaterial color="#C4C4C4" />
          </mesh>
          <group ref={flagRef} position={[0.08, 0.1, 0]}>
            <mesh>
              <boxGeometry args={[0.15, 0.12, 0.02]} />
              <meshToonMaterial color="#FF0000" />
            </mesh>
          </group>
        </group>

        {/* Icon indicator (circle with color) */}
        <mesh position={[0, -0.1, 0.18]}>
          <circleGeometry args={[0.1, 16]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, -0.1, 0.185]}>
          <circleGeometry args={[0.07, 16]} />
          <meshToonMaterial color={color} />
        </mesh>
      </group>

      {/* Floating envelope */}
      <group ref={envelopeRef} position={[0, 1.5, 0.4]}>
        <mesh>
          <boxGeometry args={[0.25, 0.15, 0.02]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
        {/* Envelope flap */}
        <mesh position={[0, 0.06, -0.005]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.23, 0.1, 0.01]} />
          <meshToonMaterial color="#F5F5F5" />
        </mesh>
        {/* Stamp */}
        <mesh position={[0.08, 0.03, 0.015]}>
          <boxGeometry args={[0.05, 0.05, 0.005]} />
          <meshToonMaterial color={color} />
        </mesh>
      </group>

      {/* Name plate */}
      <group position={[0, 0.15, 0.15]}>
        <mesh>
          <boxGeometry args={[0.5, 0.15, 0.02]} />
          <meshToonMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Ground ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 16]} />
        <meshToonMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Central contact hub
function ContactHub() {
  const globeRef = useRef();

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central pillar */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 1, 12]} />
        <meshToonMaterial color="#3B82F6" />
      </mesh>

      {/* Globe on top */}
      <group ref={globeRef} position={[0, 1.3, 0]}>
        <mesh>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshToonMaterial color="#60A5FA" transparent opacity={0.7} />
        </mesh>
        {/* Latitude lines */}
        {[-0.2, 0, 0.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.sqrt(0.35 * 0.35 - y * y), 0.01, 4, 24]} />
            <meshToonMaterial color="#FFFFFF" transparent opacity={0.5} />
          </mesh>
        ))}
        {/* Longitude line */}
        <mesh>
          <torusGeometry args={[0.35, 0.01, 4, 24]} />
          <meshToonMaterial color="#FFFFFF" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* "Connect" rays */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.8, 1.3, Math.sin(angle) * 0.8]}
            rotation={[0, -angle, Math.PI / 4]}
          >
            <boxGeometry args={[0.02, 0.5, 0.02]} />
            <meshBasicMaterial color="#60A5FA" transparent opacity={0.5} />
          </mesh>
        );
      })}

      <pointLight intensity={0.5} position={[0, 1.5, 0]} color="#60A5FA" distance={3} />
    </group>
  );
}

/**
 * MailboxDisplay - Shows contact link mailboxes around the Post Office
 */
export default function MailboxDisplay({ building, radius, data }) {
  const { theta, phi } = building;

  if (!data?.links) return null;

  return (
    <PropBase theta={theta} phi={phi} radius={radius} heightOffset={0.01}>
      {/* Central contact hub */}
      <ContactHub />

      {/* Social link mailboxes */}
      {data.links.map((link, i) => (
        <SocialMailbox
          key={link.name}
          link={link}
          index={i}
          total={data.links.length}
        />
      ))}

      {/* Connecting paths */}
      {data.links.map((_, i) => {
        const angle = (i / (data.links.length - 1 || 1)) * Math.PI * 0.6 - Math.PI * 0.3;
        const midX = Math.sin(angle) * 1.5;
        const midZ = Math.cos(angle) * 1.5;

        return (
          <mesh
            key={`path-${i}`}
            position={[midX, 0.02, midZ]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <boxGeometry args={[0.15, 1.8, 0.01]} />
            <meshToonMaterial color="#EEF4FF" />
          </mesh>
        );
      })}
    </PropBase>
  );
}
