import React, { useEffect, useState, useCallback } from 'react';
import { usePlanet } from '../../../context/PlanetContext';
import { useMessenger } from '../../../context/MessengerContext';
import { MESSENGER_COLORS } from '../../../constants/planetTheme';

export default function InteractionPrompt() {
  const {
    nearbyLandmark,
    isLoaded,
    interactWithLandmark,
    getNearbyNPC,
    enterDialogueMode,
    exitDialogueMode,
  } = usePlanet();

  const {
    startDialogue,
    isDialogueActive,
    closeDialogue,
  } = useMessenger();

  const [visible, setVisible] = useState(false);

  // Get NPC info if nearby
  const nearbyNPC = getNearbyNPC();

  // Handle interaction
  const handleInteraction = useCallback(() => {
    if (isDialogueActive) return; // Don't interact if already in dialogue

    const result = interactWithLandmark();

    if (result && result.type === 'dialogue') {
      enterDialogueMode();
      startDialogue(result.npcType);
    }
  }, [interactWithLandmark, startDialogue, enterDialogueMode, isDialogueActive]);

  // Keyboard controls for interaction
  useEffect(() => {
    if (!isLoaded || isDialogueActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleInteraction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoaded, handleInteraction, isDialogueActive]);

  // Listen for dialogue close to exit dialogue mode
  useEffect(() => {
    if (!isDialogueActive) {
      exitDialogueMode();
    }
  }, [isDialogueActive, exitDialogueMode]);

  // Animate visibility
  useEffect(() => {
    if (nearbyLandmark && !isDialogueActive) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [nearbyLandmark, isDialogueActive]);

  if (!isLoaded) return null;

  // Don't show prompt if dialogue is active
  if (isDialogueActive) return null;

  return (
    <>
      {/* Nearby NPC/landmark prompt */}
      {visible && nearbyLandmark && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            opacity: nearbyLandmark ? 1 : 0,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          <div
            onClick={handleInteraction}
            style={{
              background: MESSENGER_COLORS.promptBackground,
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: `1px solid ${MESSENGER_COLORS.promptBorder}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            }}
          >
            {/* Key indicator */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: nearbyLandmark.color || '#5DBFB8',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: `0 2px 8px ${nearbyLandmark.color || '#5DBFB8'}40`,
              }}
            >
              E
            </span>

            {/* Info */}
            <div>
              <p
                style={{
                  color: '#1F2937',
                  fontSize: '14px',
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {nearbyLandmark.label}
              </p>
              <p
                style={{
                  color: 'rgba(0,0,0,0.5)',
                  fontSize: '12px',
                  margin: '2px 0 0 0',
                }}
              >
                {nearbyNPC ? 'Talk to character' : 'Interact'}
              </p>
            </div>

            {/* Arrow indicator */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={nearbyLandmark.color || '#5DBFB8'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
