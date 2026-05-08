import React, { useEffect, useRef, useState } from 'react';
import AsciiFrame from './AsciiFrame';
import { SCENES } from './scenes';

const FADE_MS = 400;

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function LuffyMascot({ onSceneChange }) {
  const [sceneIdx, setSceneIdx] = useState(() =>
    Math.floor(Math.random() * SCENES.length)
  );
  const [frameIdx, setFrameIdx] = useState(0);
  const [leaving, setLeaving] = useState(null);

  const sceneStartRef = useRef(performance.now());
  const rafRef = useRef(null);
  const reduced = useRef(prefersReducedMotion());

  // Notify parent on scene change
  useEffect(() => {
    onSceneChange?.(SCENES[sceneIdx], sceneIdx, SCENES.length);
  }, [sceneIdx, onSceneChange]);

  useEffect(() => {
    let cancelled = false;
    sceneStartRef.current = performance.now();
    setFrameIdx(0);

    const tick = () => {
      if (cancelled) return;
      const scene = SCENES[sceneIdx];
      const elapsed = performance.now() - sceneStartRef.current;
      const total = scene.frames.length;
      const next = Math.min(
        total - 1,
        Math.floor((elapsed / 1000) * scene.fps) % total
      );
      setFrameIdx((prev) => (prev !== next ? next : prev));

      if (elapsed >= scene.durationMs) {
        // crossfade transition
        setLeaving({ scene, frameIdx: next });
        const nextSceneIdx = (sceneIdx + 1) % SCENES.length;
        setSceneIdx(nextSceneIdx);
        setTimeout(() => {
          if (!cancelled) setLeaving(null);
        }, FADE_MS);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (reduced.current) {
      // Static: hold first frame, swap scene every duration
      const t = setTimeout(() => {
        if (cancelled) return;
        setLeaving({ scene: SCENES[sceneIdx], frameIdx: 0 });
        setSceneIdx((i) => (i + 1) % SCENES.length);
        setTimeout(() => {
          if (!cancelled) setLeaving(null);
        }, FADE_MS);
      }, SCENES[sceneIdx].durationMs);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }

    rafRef.current = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current && !cancelled) {
        sceneStartRef.current = performance.now() - 100;
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [sceneIdx]);

  const scene = SCENES[sceneIdx];
  const frame = scene.frames[frameIdx] || scene.frames[0];
  const leavingFrame = leaving ? leaving.scene.frames[leaving.frameIdx] : null;

  return (
    <div className="luffy-wrapper" aria-hidden="true">
      <div className="luffy-stage">
        {leavingFrame && (
          <AsciiFrame
            key={`leave-${leaving.scene.id}`}
            art={leavingFrame.art}
            colormap={leavingFrame.colormap}
            className="is-leaving"
          />
        )}
        <AsciiFrame
          key={`active-${scene.id}`}
          art={frame.art}
          colormap={frame.colormap}
          className="is-active"
        />
      </div>
      <div className="luffy-status tui-dim">
        <span className="luffy-status-name">{scene.name}</span>
        <span className="luffy-status-idx">
          {sceneIdx + 1}/{SCENES.length}
        </span>
      </div>
    </div>
  );
}
