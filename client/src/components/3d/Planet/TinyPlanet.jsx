import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_CONFIG, PLANET_COLORS, ZONE_COLORS } from '../../../constants/planetTheme';
import { ZONES } from '../../../constants/zones';

// Road stripe on sphere
function RoadStripe({ theta, length = 0.5, radius }) {
  const phi = Math.PI / 2;
  const pos = useMemo(() => {
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [theta, radius, phi]);

  const normal = pos.clone().normalize();

  return (
    <mesh position={pos} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)}>
      <boxGeometry args={[0.15, 0.02, length]} />
      <meshToonMaterial color={PLANET_COLORS.street.yellow} />
    </mesh>
  );
}

// Crosswalk on sphere
function Crosswalk({ theta, radius }) {
  const phi = Math.PI / 2;
  const pos = useMemo(() => {
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [theta, radius, phi]);

  const normal = pos.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  return (
    <group position={pos} quaternion={quat}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[(i - 2) * 0.3, 0.02, 0]}>
          <boxGeometry args={[0.2, 0.01, 0.8]} />
          <meshToonMaterial color={PLANET_COLORS.street.crosswalk} />
        </mesh>
      ))}
    </group>
  );
}

// Street lamp on sphere
function StreetLamp({ theta, radius }) {
  const phi = Math.PI / 2;
  const pos = useMemo(() => {
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [theta, radius, phi]);

  const normal = pos.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  return (
    <group position={pos} quaternion={quat}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 2, 8]} />
        <meshToonMaterial color={PLANET_COLORS.buildings.metal} />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#FFF5DC" />
      </mesh>
      {/* Light */}
      <pointLight position={[0, 2, 0]} intensity={0.3} color="#FFF5DC" distance={4} />
    </group>
  );
}

// Zone ground segment - colored section for each zone
function ZoneSegment({ zone, radius }) {
  const { thetaStart, thetaEnd, id } = zone;
  const zoneColor = ZONE_COLORS[id] || ZONE_COLORS.welcome;

  // Calculate the angular width of the segment
  const thetaWidth = thetaEnd - thetaStart;

  // Create a partial sphere geometry for this zone
  // phiStart at equator area (around π/2), small phiLength for a band
  const geometry = useMemo(() => {
    const segments = 32;
    const phiStart = Math.PI * 0.35; // Start above equator
    const phiLength = Math.PI * 0.3; // Band around equator
    return new THREE.SphereGeometry(
      radius + 0.005, // Slightly above base sphere
      segments,
      8,
      thetaStart, // Start angle
      thetaWidth, // Angular width
      phiStart,
      phiLength
    );
  }, [radius, thetaStart, thetaWidth]);

  return (
    <mesh geometry={geometry}>
      <meshToonMaterial
        color={zoneColor.ground}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// Zone border marker - subtle line between zones
function ZoneBorder({ theta, radius }) {
  const pos = useMemo(() => {
    const phi = Math.PI / 2;
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [theta, radius]);

  const normal = pos.clone().normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

  return (
    <group position={pos} quaternion={quat}>
      {/* Subtle border marker */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 8]} />
        <meshToonMaterial color="#D4C4B5" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export default function TinyPlanet() {
  const planetRef = useRef();
  const { radius, segments } = PLANET_CONFIG;

  // Generate road stripes around equator
  const roadStripes = useMemo(() => {
    const stripes = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      // Skip every other for dashed line effect
      if (i % 2 === 0) {
        stripes.push({ theta, key: i });
      }
    }
    return stripes;
  }, []);

  // Crosswalk positions
  const crosswalks = useMemo(() => [
    { theta: Math.PI * 0.2 },
    { theta: Math.PI * 0.6 },
    { theta: Math.PI * 1.0 },
    { theta: Math.PI * 1.4 },
    { theta: Math.PI * 1.8 },
  ], []);

  // Street lamp positions
  const streetLamps = useMemo(() => [
    { theta: Math.PI * 0.1 },
    { theta: Math.PI * 0.5 },
    { theta: Math.PI * 0.9 },
    { theta: Math.PI * 1.3 },
    { theta: Math.PI * 1.7 },
  ], []);

  // Zone border positions (at zone boundaries)
  const zoneBorders = useMemo(() => {
    return ZONES.map((zone) => ({
      theta: zone.thetaStart,
      key: `border-${zone.id}`,
    }));
  }, []);

  // Subtle rotation
  useFrame((state) => {
    if (planetRef.current) {
      // Very subtle wobble
      planetRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.002;
    }
  });

  return (
    <group ref={planetRef}>
      {/* Main planet sphere - asphalt base */}
      <mesh>
        <sphereGeometry args={[radius, segments, segments]} />
        <meshToonMaterial color={PLANET_COLORS.street.asphalt} />
      </mesh>

      {/* Zone colored ground segments */}
      {ZONES.map((zone) => (
        <ZoneSegment key={zone.id} zone={zone} radius={radius} />
      ))}

      {/* Zone border markers */}
      {zoneBorders.map(({ theta, key }) => (
        <ZoneBorder key={key} theta={theta} radius={radius + 0.01} />
      ))}

      {/* Sidewalk band around equator */}
      <mesh>
        <sphereGeometry args={[radius + 0.01, segments, segments, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.2]} />
        <meshToonMaterial color={PLANET_COLORS.street.sidewalk} side={THREE.DoubleSide} transparent opacity={0.3} />
      </mesh>

      {/* Road stripes (yellow center line) */}
      {roadStripes.map(({ theta, key }) => (
        <RoadStripe key={key} theta={theta} radius={radius + 0.02} />
      ))}

      {/* Crosswalks */}
      {crosswalks.map((cw, i) => (
        <Crosswalk key={i} theta={cw.theta} radius={radius + 0.02} />
      ))}

      {/* Street lamps */}
      {streetLamps.map((lamp, i) => (
        <StreetLamp key={i} theta={lamp.theta} radius={radius + 0.01} />
      ))}

      {/* Curb line */}
      <mesh>
        <torusGeometry args={[radius + 0.02, 0.03, 8, 64]} />
        <meshToonMaterial color={PLANET_COLORS.street.curb} />
      </mesh>
    </group>
  );
}
