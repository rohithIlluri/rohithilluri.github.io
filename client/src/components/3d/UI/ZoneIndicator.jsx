import React, { useState, useEffect, useRef } from 'react';
import { useWorld } from '../../../context/WorldContext';
import { usePlanet } from '../../../context/PlanetContext';

export default function ZoneIndicator() {
  const { currentZone, zoneTransitioning, explorationProgress } = useWorld();
  const { isLoaded, isInDialogue } = usePlanet();
  const [showZoneName, setShowZoneName] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const timeoutRef = useRef(null);

  // Show zone name when zone changes
  useEffect(() => {
    if (zoneTransitioning && currentZone) {
      setShowZoneName(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide after delay
      timeoutRef.current = setTimeout(() => {
        setShowZoneName(false);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [zoneTransitioning, currentZone]);

  if (!isLoaded || !currentZone) return null;

  // Hide during dialogue
  if (isInDialogue) return null;

  const progressPercent = Math.round(
    (explorationProgress.zonesVisited / explorationProgress.totalZones) * 100
  );

  return (
    <>
      {/* Zone name popup (appears on transition) */}
      {showZoneName && zoneTransitioning && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 150,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            animation: 'zonePopup 0.5s ease-out',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '24px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              boxShadow: `0 8px 40px ${currentZone.accentColor}30`,
              border: `2px solid ${currentZone.accentColor}40`,
            }}
          >
            <span style={{ fontSize: '32px' }}>{currentZone.icon}</span>
            <h2
              style={{
                color: currentZone.accentColor,
                fontSize: '20px',
                fontWeight: 700,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {currentZone.name}
            </h2>
            <p
              style={{
                color: 'rgba(0, 0, 0, 0.5)',
                fontSize: '13px',
                margin: 0,
              }}
            >
              {currentZone.description}
            </p>
          </div>
        </div>
      )}

      {/* Persistent zone indicator (top-left corner) */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 100,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: isExpanded ? '16px' : '12px',
            padding: isExpanded ? '16px' : '10px 14px',
            display: 'flex',
            flexDirection: isExpanded ? 'column' : 'row',
            alignItems: isExpanded ? 'stretch' : 'center',
            gap: isExpanded ? '12px' : '10px',
            border: `1px solid ${currentZone.accentColor}30`,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: isExpanded ? '180px' : 'auto',
          }}
        >
          {/* Zone icon and name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                background: `${currentZone.accentColor}20`,
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              {currentZone.icon}
            </span>
            <span
              style={{
                color: currentZone.accentColor,
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {currentZone.name}
            </span>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <>
              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  margin: '0 -4px',
                }}
              />

              {/* Exploration progress */}
              <div>
                <p
                  style={{
                    color: 'rgba(0, 0, 0, 0.5)',
                    fontSize: '11px',
                    margin: '0 0 6px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Exploration
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {/* Progress bar */}
                  <div
                    style={{
                      flex: 1,
                      height: '6px',
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: currentZone.accentColor,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: currentZone.accentColor,
                      fontSize: '12px',
                      fontWeight: 600,
                      minWidth: '36px',
                      textAlign: 'right',
                    }}
                  >
                    {progressPercent}%
                  </span>
                </div>
                <p
                  style={{
                    color: 'rgba(0, 0, 0, 0.4)',
                    fontSize: '11px',
                    margin: '4px 0 0 0',
                  }}
                >
                  {explorationProgress.zonesVisited} / {explorationProgress.totalZones} zones
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CSS animation for zone popup */}
      <style>
        {`
          @keyframes zonePopup {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.8);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.05);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}
      </style>
    </>
  );
}
