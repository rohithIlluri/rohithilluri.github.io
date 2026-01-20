import { useState, useEffect, useCallback, useRef } from 'react';

// Background music hook for ambient audio
export default function useBackgroundMusic() {
  const [isMuted, setIsMuted] = useState(() => {
    // Load mute state from localStorage
    const saved = localStorage.getItem('backgroundMusicMuted');
    return saved === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    // Create audio element with a royalty-free ambient track
    // Using a placeholder - in production, you'd use your own audio file
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = 'auto';

    // Using a placeholder silent audio to demonstrate the feature
    // Replace this with an actual lo-fi/ambient track URL
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Handle play state
  useEffect(() => {
    if (!audioRef.current) return;

    if (hasInteracted && !isMuted) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.log('Audio autoplay prevented:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isMuted, hasInteracted]);

  // Save mute state to localStorage
  useEffect(() => {
    localStorage.setItem('backgroundMusicMuted', isMuted.toString());
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  // Set volume
  const setVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Mark that user has interacted (required for autoplay)
  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  return {
    isMuted,
    isPlaying,
    toggleMute,
    setVolume,
    markInteracted,
  };
}
