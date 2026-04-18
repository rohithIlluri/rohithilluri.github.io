import React, { useState, useEffect, useRef } from "react";

export default function NowPlaying({ track, isPlaying, onTogglePlayPause, onNext, onPrevious }) {
  const [showToast, setShowToast] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const prevTrackRef = useRef(null);
  const toastTimer = useRef(null);
  const exitTimer = useRef(null);

  useEffect(() => {
    if (!track || !isPlaying) return;
    const prev = prevTrackRef.current;
    if (prev?.title === track.title && prev?.author === track.author) return;
    prevTrackRef.current = track;

    clearTimeout(toastTimer.current);
    clearTimeout(exitTimer.current);
    setToastExiting(false);
    setShowToast(true);

    toastTimer.current = setTimeout(() => {
      setToastExiting(true);
      exitTimer.current = setTimeout(() => {
        setShowToast(false);
        setToastExiting(false);
      }, 300);
    }, 4000);

    return () => {
      clearTimeout(toastTimer.current);
      clearTimeout(exitTimer.current);
    };
  }, [track, isPlaying]);

  if (!track) return null;

  return (
    <>
      {showToast && (
        <div className={`now-playing-toast ${toastExiting ? "now-playing-exit" : "now-playing-enter"}`}>
          <div className="now-playing-toast-inner">
            <span className="now-playing-toast-note">♪</span>
            <div className="now-playing-toast-text">
              <span className="now-playing-toast-label">now playing</span>
              <span className="now-playing-toast-title">{track.title}</span>
            </div>
          </div>
        </div>
      )}

      <div className="music-bar">
        <div className="music-bar-inner">
          <div className="music-bar-left">
            {/* EQ indicator */}
            <div className="music-bar-eq">
              <div className={`eq-bar ${isPlaying ? "" : "eq-bar-paused"}`} />
              <div className={`eq-bar ${isPlaying ? "" : "eq-bar-paused"}`} />
              <div className={`eq-bar ${isPlaying ? "" : "eq-bar-paused"}`} />
            </div>
            {/* Track info */}
            <div className="music-bar-info">
              <p className="music-bar-title">
                <span style={{ color: '#4ade80' }}>♪</span>{' '}{track.title}
              </p>
              {track.author && (
                <p className="music-bar-author">{track.author}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="music-bar-controls">
            <button className="music-bar-btn" onClick={onPrevious} aria-label="Previous track">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>
            <button className="music-bar-btn music-bar-btn-play" onClick={onTogglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button className="music-bar-btn" onClick={onNext} aria-label="Next track">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
