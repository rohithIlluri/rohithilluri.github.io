import { useState, useEffect, useRef, useCallback } from 'react';
import { YOUTUBE_PLAYLIST } from '../constants/playlist';

/**
 * useYouTubePlayer
 *
 * A React custom hook that uses the YouTube IFrame Player API to play
 * background music from a YouTube playlist. It picks a random subset of
 * tracks from the full playlist, loops them, and exposes the currently
 * playing track info.
 *
 * @returns {{ currentTrack: { title: string, author: string } | null, isPlaying: boolean }}
 */
export default function useYouTubePlayer() {
  // ---------------------------------------------------------------------------
  // State – exposed to consumers
  // ---------------------------------------------------------------------------
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ---------------------------------------------------------------------------
  // Refs – mutable values that must survive re-renders without triggering them
  // ---------------------------------------------------------------------------
  const playerRef = useRef(null);           // YT.Player instance
  const isMountedRef = useRef(false);       // guards against StrictMode double-mount
  const hasInitializedRef = useRef(false);  // prevents duplicate API bootstrap
  const interactionListenersRef = useRef([]); // stored so we can clean up

  // ---------------------------------------------------------------------------
  // Helper: pick `count` random items from an array (Fisher-Yates shuffle)
  // ---------------------------------------------------------------------------
  const pickRandom = useCallback((array, count) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }, []);

  // ---------------------------------------------------------------------------
  // Helper: wait for `player.getPlaylist()` to return a non-null value.
  // YouTube may not populate the playlist immediately after the player is
  // ready, so we retry every 500 ms for up to 5 seconds.
  // ---------------------------------------------------------------------------
  const waitForPlaylist = useCallback((player, maxAttempts = 10, interval = 500) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const check = () => {
        // Bail out if the component unmounted while we were waiting.
        if (!isMountedRef.current) {
          reject(new Error('Component unmounted'));
          return;
        }

        const playlist = player.getPlaylist();
        if (playlist && playlist.length > 0) {
          resolve(playlist);
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          reject(new Error('Timed out waiting for playlist data'));
          return;
        }

        setTimeout(check, interval);
      };

      check();
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Helper: attempt autoplay and register one-time user-interaction listeners
  // as a fallback for browsers that block autoplay.
  // ---------------------------------------------------------------------------
  const setupAutoplay = useCallback((player) => {
    // Optimistic attempt – will succeed if the browser allows autoplay.
    try {
      player.playVideo();
    } catch (_) {
      // Silently ignored; the interaction listeners below will handle it.
    }

    // One-time interaction listeners for browsers that block autoplay.
    const handleInteraction = () => {
      try {
        player.playVideo();
      } catch (_) {
        // Player may have been destroyed; ignore.
      }
      // Remove all interaction listeners after first trigger.
      interactionListenersRef.current.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
      interactionListenersRef.current = [];
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true });
      interactionListenersRef.current.push({ event, handler: handleInteraction });
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Core: initialise the player once the YT IFrame API is ready
  // ---------------------------------------------------------------------------
  const initializePlayer = useCallback(() => {
    // Ensure the container div exists. Create it if it does not.
    if (!document.getElementById('yt-bg-player')) {
      const div = document.createElement('div');
      div.id = 'yt-bg-player';
      // Keep the player completely hidden.
      div.style.position = 'absolute';
      div.style.width = '0';
      div.style.height = '0';
      div.style.overflow = 'hidden';
      div.style.pointerEvents = 'none';
      document.body.appendChild(div);
    }

    playerRef.current = new window.YT.Player('yt-bg-player', {
      height: '0',
      width: '0',
      playerVars: {
        listType: 'playlist',
        list: YOUTUBE_PLAYLIST.id,
        autoplay: 0,       // we handle autoplay manually
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: handlePlayerReady,
        onStateChange: handleStateChange,
        onError: handleError,
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // (the handlers below are stable because they only use refs)

  // ---------------------------------------------------------------------------
  // Event: onReady
  // ---------------------------------------------------------------------------
  const handlePlayerReady = useCallback(async (event) => {
    const player = event.target;

    try {
      // Wait until YouTube populates the playlist metadata.
      const fullPlaylist = await waitForPlaylist(player);

      // Pick a random subset of video IDs from the full playlist.
      const selectedIds = pickRandom(fullPlaylist, YOUTUBE_PLAYLIST.trackCount);

      // Re-cue the player with only the selected subset.
      player.cuePlaylist(selectedIds);

      // Loop the subset indefinitely.
      player.setLoop(true);

      // Try to start playback (may be blocked by the browser).
      setupAutoplay(player);
    } catch (error) {
      // If the playlist never loaded we still try to play whatever is cued.
      console.warn('[useYouTubePlayer] Could not load playlist:', error.message);
      setupAutoplay(player);
    }
  }, [waitForPlaylist, pickRandom, setupAutoplay]);

  // ---------------------------------------------------------------------------
  // Event: onStateChange
  // ---------------------------------------------------------------------------
  const handleStateChange = useCallback((event) => {
    if (!isMountedRef.current) return;

    switch (event.data) {
      // YT.PlayerState.PLAYING === 1
      case 1: {
        setIsPlaying(true);
        try {
          const videoData = event.target.getVideoData();
          if (videoData) {
            setCurrentTrack({
              title: videoData.title || 'Unknown Title',
              author: videoData.author || 'Unknown Artist',
            });
          }
        } catch (_) {
          // getVideoData may not be available in all embed scenarios.
        }
        break;
      }

      // YT.PlayerState.PAUSED === 2
      case 2: {
        setIsPlaying(false);
        break;
      }

      default:
        break;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Event: onError – skip to the next video on any playback error
  // ---------------------------------------------------------------------------
  const handleError = useCallback(() => {
    try {
      playerRef.current?.nextVideo();
    } catch (_) {
      // Player may have been destroyed; ignore.
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Effect: load the YouTube IFrame API and bootstrap the player
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Guard: React 18 StrictMode fires effects twice in development.
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    isMountedRef.current = true;

    /**
     * Called once the IFrame API script has loaded and is ready. If
     * `window.YT` already existed (e.g. another component loaded it),
     * we call this immediately.
     */
    const onYTReady = () => {
      if (!isMountedRef.current) return;
      initializePlayer();
    };

    if (window.YT && window.YT.Player) {
      // API already available – initialise straight away.
      onYTReady();
    } else {
      // Stash any existing callback so we do not clobber other consumers.
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        // Honour any callback that was registered before us.
        if (typeof previousCallback === 'function') {
          previousCallback();
        }
        onYTReady();
      };

      // Only inject the script tag if it has not been added yet.
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
      }
    }

    // -----------------------------------------------------------------------
    // Cleanup on unmount
    // -----------------------------------------------------------------------
    return () => {
      isMountedRef.current = false;

      // Remove user-interaction listeners.
      interactionListenersRef.current.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
      interactionListenersRef.current = [];

      // Destroy the player instance.
      try {
        playerRef.current?.destroy();
      } catch (_) {
        // Ignore errors during teardown.
      }
      playerRef.current = null;

      // Clean up the global callback if it is still ours.
      if (typeof window.onYouTubeIframeAPIReady === 'function') {
        window.onYouTubeIframeAPIReady = undefined;
      }

      // Allow re-initialisation if the component remounts.
      hasInitializedRef.current = false;
    };
  }, [initializePlayer]);

  // ---------------------------------------------------------------------------
  // Player controls – exposed to consumers
  // ---------------------------------------------------------------------------
  const togglePlayPause = useCallback(() => {
    try {
      if (!playerRef.current) return;
      const state = playerRef.current.getPlayerState();
      // 1 = PLAYING
      if (state === 1) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (_) {
      // Player may not be ready yet; ignore.
    }
  }, []);

  const nextTrack = useCallback(() => {
    try {
      playerRef.current?.nextVideo();
    } catch (_) {}
  }, []);

  const previousTrack = useCallback(() => {
    try {
      playerRef.current?.previousVideo();
    } catch (_) {}
  }, []);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack };
}
