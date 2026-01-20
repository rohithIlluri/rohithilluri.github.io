import React, { useState } from 'react';
import { useCollectibles } from '../../../context/CollectiblesContext';
import { usePlanet } from '../../../context/PlanetContext';

export default function CollectionProgress() {
  const {
    collectionStats,
    recentlyCollected,
    showCollectionNotification,
  } = useCollectibles();
  const { isLoaded, isInDialogue } = usePlanet();
  const [showDetails, setShowDetails] = useState(false);

  // Hide during dialogue
  if (!isLoaded || isInDialogue) return null;

  return (
    <>
      {/* Collection counter (bottom-right) */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: showDetails ? '16px' : '12px',
            padding: showDetails ? '16px' : '10px 14px',
            display: 'flex',
            flexDirection: showDetails ? 'column' : 'row',
            alignItems: showDetails ? 'stretch' : 'center',
            gap: showDetails ? '12px' : '10px',
            border: '1px solid rgba(93, 191, 184, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minWidth: showDetails ? '160px' : 'auto',
          }}
        >
          {/* Icon and count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                background: 'rgba(93, 191, 184, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              ✨
            </span>
            <span
              style={{
                color: '#5DBFB8',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {collectionStats.collected} / {collectionStats.total}
            </span>
          </div>

          {/* Expanded details */}
          {showDetails && (
            <>
              <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)' }} />

              {/* Progress bar */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '11px' }}>
                    Collection
                  </span>
                  <span style={{ color: '#5DBFB8', fontSize: '11px', fontWeight: 600 }}>
                    {collectionStats.percentComplete}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${collectionStats.percentComplete}%`,
                      background: 'linear-gradient(90deg, #5DBFB8, #98D8C8)',
                      borderRadius: '3px',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>

              {/* Score */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'rgba(0,0,0,0.5)', fontSize: '11px' }}>
                  Score
                </span>
                <span style={{ color: '#FFD93D', fontSize: '13px', fontWeight: 600 }}>
                  {collectionStats.score} pts
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Collection notification popup */}
      {showCollectionNotification && recentlyCollected && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 200,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            animation: 'collectPopup 0.5s ease-out',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              boxShadow: `0 8px 40px ${recentlyCollected.color || recentlyCollected.glowColor}40`,
              border: `2px solid ${recentlyCollected.color || recentlyCollected.glowColor}60`,
            }}
          >
            <span style={{ fontSize: '36px' }}>✨</span>
            <h3
              style={{
                color: recentlyCollected.color || recentlyCollected.glowColor,
                fontSize: '18px',
                fontWeight: 700,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {recentlyCollected.title}
            </h3>
            <p
              style={{
                color: 'rgba(0,0,0,0.6)',
                fontSize: '13px',
                margin: 0,
                textAlign: 'center',
                maxWidth: '250px',
              }}
            >
              {recentlyCollected.content}
            </p>
            <span
              style={{
                background: `${recentlyCollected.color || recentlyCollected.glowColor}20`,
                color: recentlyCollected.color || recentlyCollected.glowColor,
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {recentlyCollected.rarity}
            </span>
          </div>
        </div>
      )}

      {/* CSS animation */}
      <style>
        {`
          @keyframes collectPopup {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.5);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
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
