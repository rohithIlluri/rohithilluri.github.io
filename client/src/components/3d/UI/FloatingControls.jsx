import React, { useState } from 'react';
import { usePlanet } from '../../../context/PlanetContext';
import useBackgroundMusic from '../../../hooks/useBackgroundMusic';

export default function FloatingControls() {
  const { isLoaded, showControls, setShowControls } = usePlanet();
  const { isMuted, toggleMute, markInteracted } = useBackgroundMusic();
  const [showHelp, setShowHelp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (!isLoaded) return null;

  const handleMusicToggle = () => {
    markInteracted();
    toggleMute();
  };

  return (
    <>
      {/* Floating controls on right side */}
      <div
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Menu button */}
        <ControlButton
          onClick={() => setShowMenu(!showMenu)}
          active={showMenu}
          title="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </ControlButton>

        {/* Music toggle */}
        <ControlButton
          onClick={handleMusicToggle}
          active={!isMuted}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </ControlButton>

        {/* Help button */}
        <ControlButton
          onClick={() => setShowHelp(!showHelp)}
          active={showHelp}
          title="Help"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </ControlButton>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div
          style={{
            position: 'fixed',
            right: '80px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 99,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            width: '220px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <h3
            style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1F2937',
            }}
          >
            Controls
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ControlHint keys={['W', 'A', 'S', 'D']} label="Move around" />
            <ControlHint keys={['E']} label="Interact / Talk" />
            <ControlHint keys={['Space']} label="Next message" />
            <ControlHint keys={['ESC']} label="Close dialogue" />
          </div>

          <p
            style={{
              margin: '16px 0 0 0',
              fontSize: '11px',
              color: 'rgba(0,0,0,0.4)',
              lineHeight: 1.5,
            }}
          >
            Explore the planet and talk to characters to learn more!
          </p>
        </div>
      )}

      {/* Menu panel */}
      {showMenu && (
        <div
          style={{
            position: 'fixed',
            right: '80px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 99,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            width: '200px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <h3
            style={{
              margin: '0 0 16px 0',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1F2937',
            }}
          >
            Rohith's World
          </h3>

          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: '12px',
              color: 'rgba(0,0,0,0.6)',
              lineHeight: 1.5,
            }}
          >
            A tiny planet portfolio experience. Walk around and discover!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <MenuLink href="https://github.com/rohithIlluri" label="GitHub" />
            <MenuLink href="https://twitter.com/notforgrind" label="Twitter" />
            <MenuLink href="https://linkedin.com/in/sree-naga-illuri" label="LinkedIn" />
          </div>
        </div>
      )}

      {/* Initial controls hint */}
      {showControls && (
        <div
          style={{
            position: 'fixed',
            left: '20px',
            bottom: '20px',
            zIndex: 100,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            {['W', 'A', 'S', 'D'].map((key) => (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  background: '#5DBFB8',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {key}
              </span>
            ))}
          </div>
          <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
            to move
          </span>
          <button
            onClick={() => setShowControls(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(0,0,0,0.3)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

// Control button component
function ControlButton({ children, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        border: 'none',
        background: active ? '#5DBFB8' : 'rgba(255,255,255,0.9)',
        color: active ? '#fff' : '#1F2937',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

// Control hint component for help panel
function ControlHint({ keys, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {keys.map((key) => (
          <span
            key={key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '24px',
              height: '24px',
              padding: '0 6px',
              background: '#F3F4F6',
              borderRadius: '6px',
              color: '#1F2937',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {key}
          </span>
        ))}
      </div>
      <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)' }}>
        {label}
      </span>
    </div>
  );
}

// Menu link component
function MenuLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#F3F4F6',
        borderRadius: '8px',
        textDecoration: 'none',
        color: '#1F2937',
        fontSize: '12px',
        fontWeight: 500,
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#E5E7EB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#F3F4F6';
      }}
    >
      {label}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginLeft: 'auto' }}
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
