import { useEffect, useRef, useCallback } from 'react';

export default function useKeyboardControls() {
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    interact: false,
  });

  const interactPressed = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for game controls
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'KeyE':
        case 'Space':
          if (!interactPressed.current) {
            keys.current.interact = true;
            interactPressed.current = true;
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
        case 'KeyE':
        case 'Space':
          keys.current.interact = false;
          interactPressed.current = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getMovement = useCallback(() => {
    return {
      forward: keys.current.forward,
      backward: keys.current.backward,
      left: keys.current.left,
      right: keys.current.right,
    };
  }, []);

  const getInteract = useCallback(() => {
    const interact = keys.current.interact;
    keys.current.interact = false; // Reset after reading
    return interact;
  }, []);

  const isMoving = useCallback(() => {
    return keys.current.forward || keys.current.backward ||
           keys.current.left || keys.current.right;
  }, []);

  return { keys, getMovement, getInteract, isMoving };
}
