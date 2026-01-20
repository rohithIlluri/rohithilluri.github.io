import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Base component for positioning props on sphere surface
 */
export function PropBase({ theta, phi, radius, heightOffset = 0, children }) {
  const { position, quaternion } = useMemo(() => {
    const pos = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const normal = pos.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );

    if (heightOffset > 0) {
      pos.add(normal.clone().multiplyScalar(heightOffset));
    }

    return { position: pos, quaternion: quat };
  }, [theta, phi, radius, heightOffset]);

  return (
    <group position={position} quaternion={quaternion}>
      {children}
    </group>
  );
}

/**
 * Get offset position from building theta
 */
export function getOffsetTheta(buildingTheta, offset) {
  return buildingTheta + offset;
}

export default PropBase;
