import React from 'react';
import { usePlanet } from '../../../context/PlanetContext';

export default function MinimalOverlay() {
  const { showControls, isLoaded } = usePlanet();

  if (!isLoaded) return null;

  return (
    <>
      {/* Name badge - top left */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 100,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#fff',
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em',
          }}
        >
          Rohith Illuri
        </h1>
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)',
            margin: '4px 0 0 0',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          Developer & Creator
        </p>
      </div>

      {/* Controls hint - bottom center */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <Key>W</Key>
              <div style={{ display: 'flex', gap: '2px' }}>
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key>
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Move</span>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key>E</Key>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>Interact</span>
          </div>
        </div>
      </div>
    </>
  );
}

function Key({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '4px',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
