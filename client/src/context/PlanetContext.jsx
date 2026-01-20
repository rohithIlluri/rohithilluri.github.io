import React, { createContext, useContext, useState, useCallback } from 'react';
import { LANDMARKS, PLANET_CONFIG } from '../constants/planetTheme';

const PlanetContext = createContext(null);

export function PlanetProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [nearbyLandmark, setNearbyLandmark] = useState(null);
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [showControls, setShowControls] = useState(true);

  // Character state
  const [characterPosition, setCharacterPosition] = useState(null);
  const [characterRotation, setCharacterRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // Dialogue state - controls whether movement is disabled
  const [isInDialogue, setIsInDialogue] = useState(false);

  // Check if near a landmark (NPC or other)
  const checkNearbyLandmark = useCallback((position, threshold = PLANET_CONFIG.interactionDistance) => {
    if (!position) return;

    for (const landmark of LANDMARKS) {
      const landmarkPos = sphericalToCartesian(
        landmark.theta,
        landmark.phi,
        PLANET_CONFIG.radius + 0.9
      );
      const distance = Math.sqrt(
        Math.pow(position.x - landmarkPos[0], 2) +
        Math.pow(position.y - landmarkPos[1], 2) +
        Math.pow(position.z - landmarkPos[2], 2)
      );

      if (distance < threshold) {
        setNearbyLandmark(landmark);
        return landmark;
      }
    }
    setNearbyLandmark(null);
    return null;
  }, []);

  // Get nearby NPC info for messenger system
  const getNearbyNPC = useCallback(() => {
    if (!nearbyLandmark) return null;
    if (nearbyLandmark.type !== 'npc') return null;
    return {
      id: nearbyLandmark.id,
      npcType: nearbyLandmark.npcType,
      label: nearbyLandmark.label,
      color: nearbyLandmark.color,
    };
  }, [nearbyLandmark]);

  // Interact with current landmark
  const interactWithLandmark = useCallback(() => {
    if (!nearbyLandmark) return null;

    // For NPCs, return the NPC type for dialogue handling
    if (nearbyLandmark.type === 'npc' && nearbyLandmark.interaction === 'dialogue') {
      return {
        type: 'dialogue',
        npcType: nearbyLandmark.npcType,
        npcId: nearbyLandmark.id,
      };
    }

    // Legacy: handle link interactions
    if (nearbyLandmark.interaction === 'link' && nearbyLandmark.link) {
      window.open(nearbyLandmark.link, '_blank');
      return { type: 'link' };
    }

    // Legacy: handle panel interactions
    if (nearbyLandmark.interaction === 'panel') {
      setActiveLandmark(nearbyLandmark);
      return { type: 'panel' };
    }

    return null;
  }, [nearbyLandmark]);

  // Close panel
  const closePanel = useCallback(() => {
    setActiveLandmark(null);
  }, []);

  // Hide controls hint after delay
  const hideControlsHint = useCallback(() => {
    setTimeout(() => setShowControls(false), 5000);
  }, []);

  // Enter/exit dialogue mode (disables movement)
  const enterDialogueMode = useCallback(() => {
    setIsInDialogue(true);
  }, []);

  const exitDialogueMode = useCallback(() => {
    setIsInDialogue(false);
  }, []);

  const value = {
    // Loading state
    isLoaded,
    setIsLoaded,

    // Landmark interaction
    nearbyLandmark,
    setNearbyLandmark,
    activeLandmark,
    setActiveLandmark,
    checkNearbyLandmark,
    interactWithLandmark,
    closePanel,

    // NPC helpers
    getNearbyNPC,

    // Controls
    showControls,
    setShowControls,
    hideControlsHint,

    // Character state
    characterPosition,
    setCharacterPosition,
    characterRotation,
    setCharacterRotation,
    isMoving,
    setIsMoving,

    // Dialogue mode
    isInDialogue,
    enterDialogueMode,
    exitDialogueMode,
  };

  return (
    <PlanetContext.Provider value={value}>
      {children}
    </PlanetContext.Provider>
  );
}

export function usePlanet() {
  const context = useContext(PlanetContext);
  if (!context) {
    throw new Error('usePlanet must be used within a PlanetProvider');
  }
  return context;
}

// Helper function
function sphericalToCartesian(theta, phi, radius) {
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

export default PlanetContext;
