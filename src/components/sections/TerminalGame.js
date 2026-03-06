import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';

const W = 700;
const H = 200;
const GROUND_Y = 160;
const GRAVITY = 0.6;
const JUMP_VY = -13;
const INITIAL_SPEED = 5;

// Pixel-art dino (each row is a list of [x, y, w, h] rects relative to dino origin)
// We'll draw it procedurally
const drawDino = (ctx, x, y, frame, isDead) => {
  const color = isDead ? '#ef4444' : '#4ade80';
  const shade = isDead ? '#b91c1c' : '#16a34a';

  ctx.fillStyle = color;

  // Body
  ctx.fillRect(x + 4, y, 18, 22);
  // Head
  ctx.fillRect(x + 12, y - 12, 16, 14);
  // Eye
  ctx.fillStyle = '#0d1117';
  ctx.fillRect(x + 23, y - 10, 3, 3);
  // Mouth
  ctx.fillStyle = shade;
  ctx.fillRect(x + 26, y - 4, 4, 2);

  // Neck
  ctx.fillStyle = color;
  ctx.fillRect(x + 12, y, 6, 8);

  // Tail
  ctx.fillRect(x, y + 8, 6, 6);
  ctx.fillRect(x - 4, y + 12, 4, 4);

  // Legs (animated)
  ctx.fillStyle = color;
  if (!isDead) {
    if (frame % 2 === 0) {
      ctx.fillRect(x + 6,  y + 22, 5, 10);
      ctx.fillRect(x + 14, y + 22, 5, 6);
    } else {
      ctx.fillRect(x + 6,  y + 22, 5, 6);
      ctx.fillRect(x + 14, y + 22, 5, 10);
    }
  } else {
    ctx.fillRect(x + 6,  y + 22, 5, 8);
    ctx.fillRect(x + 14, y + 22, 5, 8);
  }

  // Arm stub
  ctx.fillStyle = shade;
  ctx.fillRect(x + 20, y + 4, 5, 4);
};

const CACTUS_TYPES = [
  { w: 12, h: 30, arms: [{ y: 10, side: 'left', w: 8, h: 5 }] },
  { w: 16, h: 38, arms: [{ y: 12, side: 'left', w: 10, h: 5 }, { y: 16, side: 'right', w: 8, h: 5 }] },
  { w: 10, h: 24, arms: [] },
];

const drawCactus = (ctx, x, type) => {
  const t = CACTUS_TYPES[type % CACTUS_TYPES.length];
  ctx.fillStyle = '#f97316';
  ctx.shadowColor = '#f97316';
  ctx.shadowBlur = 4;
  // Main stem
  ctx.fillRect(x, GROUND_Y - t.h, t.w, t.h);
  // Arms
  t.arms.forEach(arm => {
    if (arm.side === 'left') {
      ctx.fillRect(x - arm.w, GROUND_Y - t.h + arm.y, arm.w, arm.h);
      ctx.fillRect(x - arm.w, GROUND_Y - t.h + arm.y - 8, arm.h, 8);
    } else {
      ctx.fillRect(x + t.w, GROUND_Y - t.h + arm.y, arm.w, arm.h);
      ctx.fillRect(x + t.w, GROUND_Y - t.h + arm.y - 8, arm.h, 8);
    }
  });
  ctx.shadowBlur = 0;
};

const drawCloud = (ctx, x, y) => {
  ctx.fillStyle = 'rgba(0,255,70,0.06)';
  ctx.fillRect(x, y, 40, 8);
  ctx.fillRect(x + 8, y - 6, 24, 8);
  ctx.fillRect(x + 14, y - 10, 12, 6);
};

const drawStars = (ctx, stars) => {
  ctx.fillStyle = 'rgba(0,255,70,0.25)';
  stars.forEach(s => ctx.fillRect(s.x, s.y, 2, 2));
};

const genStars = () =>
  Array.from({ length: 40 }, () => ({
    x: Math.random() * W,
    y: Math.random() * (GROUND_Y - 40),
  }));

const genClouds = () =>
  Array.from({ length: 4 }, (_, i) => ({
    x: 100 + i * 180,
    y: 20 + Math.random() * 40,
    speed: 0.3 + Math.random() * 0.3,
  }));

const Cursor = () => (
  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5 align-middle" />
);

const TerminalGame = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [uiState, setUiState] = useState({ status: 'idle', score: 0, highScore: 0 });

  const initGameState = useCallback(() => ({
    status: 'idle',
    dino: { x: 60, y: GROUND_Y - 32, vy: 0, onGround: true, frame: 0, frameTimer: 0 },
    cacti: [],
    clouds: genClouds(),
    stars: genStars(),
    speed: INITIAL_SPEED,
    score: 0,
    highScore: stateRef.current?.highScore || 0,
    nextCactusIn: 80,
    tick: 0,
    flashTimer: 0,
  }), []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;
    if (s.status === 'idle' || s.status === 'dead') {
      const fresh = initGameState();
      fresh.status = 'playing';
      stateRef.current = fresh;
      setUiState({ status: 'playing', score: 0, highScore: fresh.highScore });
      return;
    }
    if (s.status === 'playing' && s.dino.onGround) {
      s.dino.vy = JUMP_VY;
      s.dino.onGround = false;
    }
  }, [initGameState]);

  // Main loop
  useEffect(() => {
    stateRef.current = initGameState();
    stateRef.current.status = 'idle';

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      if (!s) { rafRef.current = requestAnimationFrame(loop); return; }

      // --- Update ---
      if (s.status === 'playing') {
        s.tick++;
        s.score += 1;
        s.speed = INITIAL_SPEED + Math.floor(s.score / 300) * 0.8;

        // Dino physics
        const d = s.dino;
        if (!d.onGround) {
          d.vy += GRAVITY;
          d.y += d.vy;
          if (d.y >= GROUND_Y - 32) {
            d.y = GROUND_Y - 32;
            d.vy = 0;
            d.onGround = true;
          }
        }
        // Leg animation
        if (d.onGround) {
          d.frameTimer++;
          if (d.frameTimer > 6) { d.frame ^= 1; d.frameTimer = 0; }
        }

        // Clouds
        s.clouds.forEach(c => {
          c.x -= c.speed;
          if (c.x < -60) { c.x = W + 20; c.y = 20 + Math.random() * 40; }
        });

        // Spawn cacti
        s.nextCactusIn--;
        if (s.nextCactusIn <= 0) {
          s.cacti.push({ x: W + 10, type: Math.floor(Math.random() * CACTUS_TYPES.length) });
          s.nextCactusIn = 60 + Math.floor(Math.random() * 80) - Math.floor(s.speed * 4);
        }

        // Move & collision
        const dinoBox = { x: d.x + 6, y: d.y, w: 18, h: 32 };
        s.cacti = s.cacti.filter(c => {
          c.x -= s.speed;
          const t = CACTUS_TYPES[c.type % CACTUS_TYPES.length];
          const cBox = { x: c.x + 2, y: GROUND_Y - t.h, w: t.w - 4, h: t.h };
          const hit =
            dinoBox.x < cBox.x + cBox.w &&
            dinoBox.x + dinoBox.w > cBox.x &&
            dinoBox.y < cBox.y + cBox.h &&
            dinoBox.y + dinoBox.h > cBox.y;
          if (hit) {
            const hs = Math.max(s.score, s.highScore);
            s.highScore = hs;
            s.status = 'dead';
            s.flashTimer = 12;
            setUiState({ status: 'dead', score: Math.floor(s.score / 10), highScore: Math.floor(hs / 10) });
          }
          return c.x > -30;
        });

        if (s.flashTimer > 0) s.flashTimer--;

        if (s.status === 'playing') {
          setUiState(u =>
            Math.floor(s.score / 10) !== u.score
              ? { ...u, score: Math.floor(s.score / 10) }
              : u
          );
        }
      }

      // --- Draw ---
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);

      drawStars(ctx, s.stars);
      s.clouds.forEach(c => drawCloud(ctx, c.x, c.y));

      // Ground line
      ctx.fillStyle = 'rgba(0,255,70,0.18)';
      ctx.fillRect(0, GROUND_Y + 1, W, 2);

      // Ground dashes
      ctx.fillStyle = 'rgba(0,255,70,0.1)';
      for (let i = 0; i < W; i += 20) ctx.fillRect(i, GROUND_Y + 5, 12, 2);

      // Cacti
      s.cacti.forEach(c => drawCactus(ctx, c.x, c.type));

      // Dino
      const flash = s.status === 'dead' && s.flashTimer % 2 === 0;
      if (!flash) {
        drawDino(ctx, s.dino.x, s.dino.y, s.dino.frame, s.status === 'dead');
      }

      // Idle overlay
      if (s.status === 'idle') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#4ade80';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DINO JUMP', W / 2, H / 2 - 14);
        ctx.fillStyle = '#8b949e';
        ctx.font = '13px monospace';
        ctx.fillText('Press Space / Enter / Click to start', W / 2, H / 2 + 12);
        ctx.textAlign = 'left';
      }

      // Dead overlay
      if (s.status === 'dead' && s.flashTimer <= 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
        ctx.fillStyle = '#8b949e';
        ctx.font = '13px monospace';
        ctx.fillText('Space / Enter / Click to restart', W / 2, H / 2 + 14);
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [initGameState]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  return (
    <section id="terminal-game" className={COMPONENT_STYLES.section.base} aria-label="Terminal game">
      <div className={COMPONENT_STYLES.section.container}>
        <h2 className={COMPONENT_STYLES.section.heading}>Terminal Game</h2>

        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl bg-[#0d1117] font-mono">

          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
            <span className="ml-3 text-xs text-[#8b949e] select-none">dino-jump.exe</span>
            <div className="ml-auto flex items-center gap-4 text-xs text-[#8b949e]">
              <span>score: <span className="text-green-400 tabular-nums">{String(uiState.score).padStart(5, '0')}</span></span>
              <span>best: <span className="text-orange-400 tabular-nums">{String(uiState.highScore).padStart(5, '0')}</span></span>
            </div>
          </div>

          {/* Terminal prompt */}
          <div className="px-4 pt-3 pb-1 text-xs text-[#8b949e] leading-5 select-none">
            <p>
              <span className="text-green-500">rohith@portfolio</span>
              <span className="text-[#8b949e]">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-[#8b949e]">$ </span>
              <span className="text-white">./dino-jump.exe</span>
            </p>
            <p className="text-[#8b949e] text-[11px]">
              {uiState.status === 'idle' && (
                <>
                  Press{' '}
                  <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-white">Space</kbd>
                  {' '}or{' '}
                  <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-white">↑</kbd>
                  {' '}to jump over cacti. Don't get impaled!<Cursor />
                </>
              )}
              {uiState.status === 'playing' && (
                <>
                  Running at speed {(INITIAL_SPEED + Math.floor(uiState.score / 30) * 0.8).toFixed(1)}x — dodge the <span className="text-orange-400">cacti</span>!<Cursor />
                </>
              )}
              {uiState.status === 'dead' && (
                <>
                  <span className="text-red-400">Segmentation fault (core dumped)</span> — score: <span className="text-green-400">{uiState.score}</span>. Press <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-white">Space</kbd> to respawn.<Cursor />
                </>
              )}
            </p>
          </div>

          {/* Canvas */}
          <div
            className="flex justify-center px-4 pb-3 cursor-pointer"
            onClick={jump}
          >
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="rounded-lg border border-[#30363d] w-full max-w-[700px]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Bottom hint bar */}
          <div className="px-4 py-2 bg-[#161b22] border-t border-[#30363d] flex items-center gap-4 text-[10px] text-[#8b949e] select-none">
            <span>Space / ↑ / Click — jump</span>
            <span className="text-[#484f58]">|</span>
            <span>avoid orange cacti</span>
            <span className="ml-auto">speed increases over time</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TerminalGame);
