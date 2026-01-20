import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useScene } from '../../../context/SceneContext';
import { CAMERA_WAYPOINTS, CAMERA_CONFIG } from '../../../constants/cameraPath';

export default function CameraRig() {
  const { camera } = useThree();
  const { currentSection, navigateToSection, isTransitioning } = useScene();

  // Refs for smooth animation - initialize to first NYC waypoint (subway)
  const firstWaypoint = CAMERA_WAYPOINTS[0];
  const targetPosition = useRef(new THREE.Vector3(...firstWaypoint.position));
  const targetLookAt = useRef(new THREE.Vector3(...firstWaypoint.lookAt));
  const currentLookAt = useRef(new THREE.Vector3(...firstWaypoint.lookAt));

  // Handle scroll/wheel for navigation
  useEffect(() => {
    let scrollTimeout;
    let lastScrollTime = 0;
    const scrollCooldown = 800; // ms between section changes

    const handleWheel = (event) => {
      event.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) return;
      if (isTransitioning) return;

      const currentIndex = CAMERA_WAYPOINTS.findIndex(w => w.id === currentSection);

      if (event.deltaY > 0 && currentIndex < CAMERA_WAYPOINTS.length - 1) {
        // Scroll down - next section
        lastScrollTime = now;
        navigateToSection(CAMERA_WAYPOINTS[currentIndex + 1].id);
      } else if (event.deltaY < 0 && currentIndex > 0) {
        // Scroll up - previous section
        lastScrollTime = now;
        navigateToSection(CAMERA_WAYPOINTS[currentIndex - 1].id);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event) => {
      if (isTransitioning) return;

      const currentIndex = CAMERA_WAYPOINTS.findIndex(w => w.id === currentSection);

      if ((event.key === 'ArrowDown' || event.key === ' ') && currentIndex < CAMERA_WAYPOINTS.length - 1) {
        event.preventDefault();
        navigateToSection(CAMERA_WAYPOINTS[currentIndex + 1].id);
      } else if (event.key === 'ArrowUp' && currentIndex > 0) {
        event.preventDefault();
        navigateToSection(CAMERA_WAYPOINTS[currentIndex - 1].id);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [currentSection, navigateToSection, isTransitioning]);

  // Animate camera when section changes
  useEffect(() => {
    const waypoint = CAMERA_WAYPOINTS.find(w => w.id === currentSection);
    if (!waypoint) return;

    // Animate position
    gsap.to(targetPosition.current, {
      x: waypoint.position[0],
      y: waypoint.position[1],
      z: waypoint.position[2],
      duration: CAMERA_CONFIG.transitionDuration,
      ease: CAMERA_CONFIG.transitionEase,
    });

    // Animate look-at target
    gsap.to(targetLookAt.current, {
      x: waypoint.lookAt[0],
      y: waypoint.lookAt[1],
      z: waypoint.lookAt[2],
      duration: CAMERA_CONFIG.transitionDuration,
      ease: CAMERA_CONFIG.transitionEase,
    });
  }, [currentSection]);

  // Update camera every frame
  useFrame((state, delta) => {
    // Smoothly interpolate camera position
    camera.position.lerp(targetPosition.current, delta * 2);

    // Smoothly interpolate look-at target
    currentLookAt.current.lerp(targetLookAt.current, delta * 2);
    camera.lookAt(currentLookAt.current);

    // Add subtle idle movement
    const time = state.clock.elapsedTime;
    camera.position.y += Math.sin(time * 0.5) * 0.002;
    camera.position.x += Math.sin(time * 0.3) * 0.001;
  });

  return null;
}
