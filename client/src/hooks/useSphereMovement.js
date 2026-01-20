import { useRef, useCallback } from 'react';
import * as THREE from 'three';
import { PLANET_CONFIG } from '../constants/planetTheme';

export default function useSphereMovement() {
  const position = useRef(new THREE.Vector3(0, PLANET_CONFIG.radius, 0));
  const rotation = useRef(0); // Character facing direction (theta on sphere)
  const forward = useRef(new THREE.Vector3(0, 0, 1));

  // Move character on sphere surface
  const move = useCallback((movement, delta) => {
    const { walkSpeed, turnSpeed, radius } = PLANET_CONFIG;
    const speed = walkSpeed * delta * 60;
    const turn = turnSpeed * delta * 60;

    // Turn left/right
    if (movement.left) {
      rotation.current += turn;
    }
    if (movement.right) {
      rotation.current -= turn;
    }

    // Calculate forward direction on tangent plane
    const up = position.current.clone().normalize();

    // Create forward vector based on rotation
    const baseForward = new THREE.Vector3(
      Math.sin(rotation.current),
      0,
      Math.cos(rotation.current)
    );

    // Project forward onto tangent plane
    forward.current = baseForward.clone()
      .sub(up.clone().multiplyScalar(baseForward.dot(up)))
      .normalize();

    // Move forward/backward
    let moveDir = new THREE.Vector3();
    if (movement.forward) {
      moveDir.add(forward.current);
    }
    if (movement.backward) {
      moveDir.sub(forward.current);
    }

    if (moveDir.length() > 0) {
      moveDir.normalize();

      // Move along tangent plane
      const newPos = position.current.clone()
        .add(moveDir.multiplyScalar(speed));

      // Project back onto sphere surface
      position.current.copy(newPos.normalize().multiplyScalar(radius));
    }

    return {
      position: position.current.clone(),
      rotation: rotation.current,
      forward: forward.current.clone(),
      isMoving: movement.forward || movement.backward,
    };
  }, []);

  // Get current state
  const getState = useCallback(() => {
    return {
      position: position.current.clone(),
      rotation: rotation.current,
      forward: forward.current.clone(),
    };
  }, []);

  // Set initial position
  const setInitialPosition = useCallback((theta, phi) => {
    const { radius } = PLANET_CONFIG;
    position.current.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    rotation.current = theta;
  }, []);

  // Calculate character orientation quaternion for sphere surface
  const getOrientationQuaternion = useCallback(() => {
    const up = position.current.clone().normalize();
    const fwd = forward.current.clone();

    // Ensure forward is perpendicular to up
    const right = new THREE.Vector3().crossVectors(up, fwd).normalize();
    const correctedForward = new THREE.Vector3().crossVectors(right, up).normalize();

    // Create rotation matrix
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(right, up, correctedForward);

    // Convert to quaternion
    const quaternion = new THREE.Quaternion();
    quaternion.setFromRotationMatrix(matrix);

    return quaternion;
  }, []);

  return {
    move,
    getState,
    setInitialPosition,
    getOrientationQuaternion,
    position,
    rotation,
    forward,
  };
}
