import React, { useEffect, useState, useRef } from 'react';
import { usePlanet } from '../../../context/PlanetContext';

export default function PlanetLoadingScreen() {
  const { isLoaded, setIsLoaded } = usePlanet();
  const [progress, setProgress] = useState(0);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);
  const startTimeRef = useRef(null);

  // Progress animation using requestAnimationFrame
  useEffect(() => {
    if (isLoaded || progress >= 100) return;

    let animationId;
    const duration = 2000;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isLoaded, progress]);

  // When progress reaches 100, start fade out after brief pause
  useEffect(() => {
    if (progress >= 100 && !shouldFadeOut) {
      const timer = setTimeout(() => {
        setShouldFadeOut(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, shouldFadeOut]);

  // When fade out starts, wait for transition then mark loaded
  useEffect(() => {
    if (shouldFadeOut && !isLoaded) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 600); // 500ms transition + 100ms buffer
      return () => clearTimeout(timer);
    }
  }, [shouldFadeOut, isLoaded, setIsLoaded]);

  // Don't render if fully loaded
  if (isLoaded) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        background: 'linear-gradient(180deg, #2B4F60 0%, #5DBFB8 50%, #98D8C8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        opacity: shouldFadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: shouldFadeOut ? 'none' : 'auto',
      }}
    >
      {/* Planet icon */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E8DFD3 0%, #D4C4B5 50%, #B8A89A 100%)',
          marginBottom: '32px',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset -10px -10px 30px rgba(0,0,0,0.15)',
          animation: 'planetSpin 20s linear infinite',
        }}
      >
        {/* Roads on planet */}
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '10%',
            right: '10%',
            height: '4px',
            background: '#5DBFB8',
            borderRadius: '2px',
            transform: 'rotate(-15deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20%',
            right: '5%',
            height: '4px',
            background: '#5DBFB8',
            borderRadius: '2px',
            transform: 'rotate(10deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '70%',
            left: '5%',
            right: '25%',
            height: '4px',
            background: '#5DBFB8',
            borderRadius: '2px',
            transform: 'rotate(-5deg)',
          }}
        />

        {/* Soft glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '80px',
            height: '80px',
            background: 'radial-gradient(circle, rgba(255,245,220,0.5) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em',
          textShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}
      >
        Rohith's World
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.8)',
          margin: '0 0 32px 0',
        }}
      >
        Loading the planet...
      </p>

      {/* Progress bar */}
      <div
        style={{
          width: '200px',
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #FFF5DC, #FFFFFF)',
            borderRadius: '2px',
          }}
        />
      </div>

      {/* Percentage */}
      <p
        style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)',
          margin: '12px 0 0 0',
        }}
      >
        {Math.round(progress)}%
      </p>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes planetSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
