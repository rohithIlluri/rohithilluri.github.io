import React, { useState, useEffect, useCallback } from 'react';
import { useCollectibles } from '../../../context/CollectiblesContext';
import { useMessenger } from '../../../context/MessengerContext';
import { COLLECTIBLES, COLLECTIBLE_TYPES } from '../../../constants/collectibles';

export default function CompletionCelebration({ onViewCollection }) {
  const { collectionStats, dismissCompletionCelebration, showCompletionCelebration } = useCollectibles();
  const { startDialogue } = useMessenger();
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showContent, setShowContent] = useState(false);

  // Generate confetti pieces
  useEffect(() => {
    if (showCompletionCelebration) {
      const pieces = [];
      const colors = ['#5DBFB8', '#FFD93D', '#FF6B6B', '#98D8C8', '#3B82F6', '#E8B4A0'];

      for (let i = 0; i < 100; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 2,
          duration: 2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 8,
          rotation: Math.random() * 360,
        });
      }
      setConfettiPieces(pieces);

      // Show content after initial animation
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showCompletionCelebration]);

  // Calculate stats
  const memoryOrbs = COLLECTIBLES.filter(c => c.type === COLLECTIBLE_TYPES.MEMORY_ORB).length;
  const photoFrames = COLLECTIBLES.filter(c => c.type === COLLECTIBLE_TYPES.PHOTO_FRAME).length;
  const postcards = COLLECTIBLES.filter(c => c.type === COLLECTIBLE_TYPES.POSTCARD).length;

  const handleTalkToGuide = useCallback(() => {
    dismissCompletionCelebration();
    setTimeout(() => {
      startDialogue('guide_completion');
    }, 300);
  }, [dismissCompletionCelebration, startDialogue]);

  const handleViewCollection = useCallback(() => {
    dismissCompletionCelebration();
    if (onViewCollection) {
      onViewCollection();
    }
  }, [dismissCompletionCelebration, onViewCollection]);

  const handleContinueExploring = useCallback(() => {
    dismissCompletionCelebration();
  }, [dismissCompletionCelebration]);

  if (!showCompletionCelebration) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.5s ease-out',
        }}
      />

      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            background: piece.color,
            borderRadius: '2px',
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confettiFall ${piece.duration}s ease-out ${piece.delay}s infinite`,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px 48px',
          maxWidth: '450px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          transform: showContent ? 'scale(1)' : 'scale(0.8)',
          opacity: showContent ? 1 : 0,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Trophy/Star icon */}
        <div
          style={{
            fontSize: '64px',
            marginBottom: '16px',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          *
        </div>

        {/* Title */}
        <h1
          style={{
            color: '#5DBFB8',
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
          }}
        >
          Journey Complete!
        </h1>

        <p
          style={{
            color: 'rgba(0, 0, 0, 0.6)',
            fontSize: '14px',
            margin: '0 0 24px 0',
          }}
        >
          You've discovered all the memories hidden in this world.
        </p>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: 'rgba(93, 191, 184, 0.1)',
              borderRadius: '12px',
              padding: '16px 8px',
            }}
          >
            <div style={{ fontSize: '24px', color: '#5DBFB8', fontWeight: 700 }}>
              {memoryOrbs}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginTop: '4px' }}>
              Memory Orbs
            </div>
          </div>
          <div
            style={{
              background: 'rgba(255, 217, 61, 0.1)',
              borderRadius: '12px',
              padding: '16px 8px',
            }}
          >
            <div style={{ fontSize: '24px', color: '#D4A50A', fontWeight: 700 }}>
              {photoFrames}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginTop: '4px' }}>
              Photo Frames
            </div>
          </div>
          <div
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '16px 8px',
            }}
          >
            <div style={{ fontSize: '24px', color: '#3B82F6', fontWeight: 700 }}>
              {postcards}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginTop: '4px' }}>
              Postcards
            </div>
          </div>
        </div>

        {/* Final score */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFD93D 0%, #FFB347 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ color: 'rgba(0,0,0,0.6)', fontSize: '12px', marginBottom: '4px' }}>
            Final Score
          </div>
          <div style={{ color: '#333', fontSize: '36px', fontWeight: 700 }}>
            {collectionStats.score} <span style={{ fontSize: '18px', fontWeight: 500 }}>pts</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleTalkToGuide}
            style={{
              background: 'linear-gradient(135deg, #5DBFB8 0%, #98D8C8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.02)';
              e.target.style.boxShadow = '0 4px 20px rgba(93, 191, 184, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Talk to The Guide
          </button>

          <button
            onClick={handleViewCollection}
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              color: '#333',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '14px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.05)';
            }}
          >
            View Collection
          </button>

          <button
            onClick={handleContinueExploring}
            style={{
              background: 'transparent',
              color: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseOver={(e) => {
              e.target.style.color = 'rgba(0, 0, 0, 0.8)';
            }}
            onMouseOut={(e) => {
              e.target.style.color = 'rgba(0, 0, 0, 0.5)';
            }}
          >
            Continue Exploring
          </button>
        </div>
      </div>

      {/* CSS animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </div>
  );
}
