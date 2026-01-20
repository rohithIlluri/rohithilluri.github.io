import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { PLANET_CONFIG } from '../../../constants/planetTheme';
import { usePlanet } from '../../../context/PlanetContext';

export default function PlanetCameraRig() {
  const { camera } = useThree();
  const { characterPosition, setIsLoaded, hideControlsHint } = usePlanet();

  const targetPosition = useRef(new THREE.Vector3(0, 20, 20));
  const targetLookAt = useRef(new THREE.Vector3(0, 12, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 12, 0));

  const { cameraDistance, cameraHeight } = PLANET_CONFIG;

  // Initialize camera
  useEffect(() => {
    camera.position.set(0, 20, 20);
    camera.lookAt(0, 12, 0);

    // Mark as loaded after initial setup
    const timer = setTimeout(() => {
      setIsLoaded(true);
      hideControlsHint();
    }, 1000);

    return () => clearTimeout(timer);
  }, [camera, setIsLoaded, hideControlsHint]);

  useFrame((state, delta) => {
    if (!characterPosition) return;

    // Calculate camera position based on character
    const charPos = characterPosition;
    const up = charPos.clone().normalize();

    // Get character's forward direction (we'll approximate based on position)
    // For simplicity, use the tangent pointing "forward" on the sphere
    const tangent = new THREE.Vector3(1, 0, 0)
      .sub(up.clone().multiplyScalar(new THREE.Vector3(1, 0, 0).dot(up)))
      .normalize();

    // Camera position: behind and above character (relative to sphere surface)
    const behind = tangent.clone().negate().multiplyScalar(cameraDistance);
    const above = up.clone().multiplyScalar(cameraHeight);

    const newTargetPos = charPos.clone().add(behind).add(above);
    targetPosition.current.lerp(newTargetPos, 0.05);

    // Look at character
    targetLookAt.current.copy(charPos);

    // Smooth camera movement
    camera.position.lerp(targetPosition.current, delta * 3);
    currentLookAt.current.lerp(targetLookAt.current, delta * 3);

    // Update camera up vector to match sphere surface
    camera.up.copy(up);
    camera.lookAt(currentLookAt.current);

    // Subtle idle movement
    const time = state.clock.elapsedTime;
    camera.position.x += Math.sin(time * 0.3) * 0.005;
    camera.position.y += Math.sin(time * 0.5) * 0.003;
  });

  return null;
}
