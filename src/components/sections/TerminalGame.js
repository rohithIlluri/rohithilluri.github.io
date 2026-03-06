import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { COMPONENT_STYLES } from '../../constants/theme';

const GRID_COLS = 20;
const GRID_ROWS = 14;
const CELL_SIZE = 20;
const TICK_INTERVAL = 130;

const Direction = { UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT' };

const DELTA = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y: 1  },
  LEFT:  { x: -1, y: 0  },
  RIGHT: { x: 1,  y: 0  },
};

const OPPOSITE = {
  UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT',
};

const randomFood = (snake) => {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_COLS),
      y: Math.floor(Math.random() * GRID_ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
};

const initState = () => {
  const snake = [
    { x: 10, y: 7 },
    { x: 9,  y: 7 },
    { x: 8,  y: 7 },
  ];
  return {
    snake,
    food: randomFood(snake),
    dir: Direction.RIGHT,
    pendingDir: Direction.RIGHT,
    score: 0,
    highScore: 0,
    status: 'idle', // 'idle' | 'playing' | 'dead'
  };
};

// Terminal-style blinking cursor
const Cursor = () => (
  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-0.5 align-middle" />
);

const TerminalGame = () => {
  const [game, setGame] = useState(initState);
  const gameRef = useRef(game);
  gameRef.current = game;

  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const highScoreRef = useRef(0);

  // Draw the game on canvas
  const draw = useCallback((state) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);

    // Grid dots (subtle)
    ctx.fillStyle = 'rgba(0, 255, 70, 0.05)';
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        ctx.fillRect(x * CELL_SIZE + CELL_SIZE / 2 - 1, y * CELL_SIZE + CELL_SIZE / 2 - 1, 2, 2);
      }
    }

    // Food — pulsing '@' style block
    const { food } = state;
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 8;
    ctx.fillRect(
      food.x * CELL_SIZE + 3,
      food.y * CELL_SIZE + 3,
      CELL_SIZE - 6,
      CELL_SIZE - 6
    );
    ctx.shadowBlur = 0;

    // Snake
    state.snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
      ctx.shadowColor = isHead ? '#4ade80' : 'transparent';
      ctx.shadowBlur = isHead ? 10 : 0;

      if (isHead) {
        // Rounded head
        const x = seg.x * CELL_SIZE + 2;
        const y = seg.y * CELL_SIZE + 2;
        const w = CELL_SIZE - 4;
        const h = CELL_SIZE - 4;
        const r = 4;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(
          seg.x * CELL_SIZE + 3,
          seg.y * CELL_SIZE + 3,
          CELL_SIZE - 6,
          CELL_SIZE - 6
        );
      }
    });
    ctx.shadowBlur = 0;

    // Dead overlay
    if (state.status === 'dead') {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, GRID_COLS * CELL_SIZE, GRID_ROWS * CELL_SIZE);
    }
  }, []);

  // Game tick
  const tick = useCallback(() => {
    setGame(prev => {
      if (prev.status !== 'playing') return prev;

      const dir = prev.pendingDir;
      const delta = DELTA[dir];
      const head = prev.snake[0];
      const newHead = { x: head.x + delta.x, y: head.y + delta.y };

      // Wall collision
      if (
        newHead.x < 0 || newHead.x >= GRID_COLS ||
        newHead.y < 0 || newHead.y >= GRID_ROWS
      ) {
        const hs = Math.max(prev.score, highScoreRef.current);
        highScoreRef.current = hs;
        return { ...prev, status: 'dead', highScore: hs };
      }

      // Self collision
      if (prev.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        const hs = Math.max(prev.score, highScoreRef.current);
        highScoreRef.current = hs;
        return { ...prev, status: 'dead', highScore: hs };
      }

      const ate = newHead.x === prev.food.x && newHead.y === prev.food.y;
      const newSnake = [newHead, ...prev.snake];
      if (!ate) newSnake.pop();

      const newScore = ate ? prev.score + 10 : prev.score;
      const newFood = ate ? randomFood(newSnake) : prev.food;

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        dir,
        score: newScore,
        highScore: Math.max(newScore, highScoreRef.current),
      };
    });
  }, []);

  // Start/restart
  const startGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const fresh = {
      ...initState(),
      status: 'playing',
      highScore: highScoreRef.current,
    };
    setGame(fresh);
    intervalRef.current = setInterval(tick, TICK_INTERVAL);
  }, [tick]);

  // Keyboard handler
  useEffect(() => {
    const handleKey = (e) => {
      const keyMap = {
        ArrowUp: Direction.UP,    w: Direction.UP,
        ArrowDown: Direction.DOWN, s: Direction.DOWN,
        ArrowLeft: Direction.LEFT, a: Direction.LEFT,
        ArrowRight: Direction.RIGHT, d: Direction.RIGHT,
      };
      const newDir = keyMap[e.key];

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const current = gameRef.current;
        if (current.status === 'idle' || current.status === 'dead') {
          startGame();
        }
        return;
      }

      if (!newDir) return;
      e.preventDefault();

      setGame(prev => {
        if (prev.status !== 'playing') return prev;
        if (newDir === OPPOSITE[prev.dir]) return prev;
        return { ...prev, pendingDir: newDir };
      });
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [startGame]);

  // Draw on state change
  useEffect(() => {
    draw(game);
  }, [game, draw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Mobile direction buttons
  const handleMobileDir = useCallback((dir) => {
    setGame(prev => {
      if (prev.status !== 'playing') return prev;
      if (dir === OPPOSITE[prev.dir]) return prev;
      return { ...prev, pendingDir: dir };
    });
  }, []);

  return (
    <section id="terminal-game" className={COMPONENT_STYLES.section.base} aria-label="Terminal game">
      <div className={COMPONENT_STYLES.section.container}>
        <h2 className={COMPONENT_STYLES.section.heading}>Terminal Game</h2>

        {/* Terminal window */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl bg-[#0d1117] font-mono">

          {/* Terminal title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
            <span className="ml-3 text-xs text-[#8b949e] select-none">snake.exe</span>
            <div className="ml-auto flex items-center gap-3 text-xs text-[#8b949e]">
              <span>score: <span className="text-green-400">{game.score}</span></span>
              <span>best: <span className="text-orange-400">{game.highScore}</span></span>
            </div>
          </div>

          {/* Game output lines */}
          <div className="px-4 pt-3 pb-1 text-xs text-[#8b949e] leading-5 select-none">
            <p>
              <span className="text-green-500">rohith@portfolio</span>
              <span className="text-[#8b949e]">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-[#8b949e]">$ </span>
              <span className="text-white">./snake.exe</span>
            </p>
            <p className="text-[#8b949e]">
              {game.status === 'idle' && (
                <>Press <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-white">Space</kbd> or <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-white">Enter</kbd> to start. Use arrow keys or WASD to move.<Cursor /></>
              )}
              {game.status === 'playing' && (
                <>Game running — eat the <span className="text-orange-400">orange</span> blocks. Don't hit walls or yourself!<Cursor /></>
              )}
              {game.status === 'dead' && (
                <><span className="text-red-400">Game over!</span> Score: <span className="text-green-400">{game.score}</span>. Press <kbd className="px-1 py-0.5 bg-[#21262d] border border-[#30363d] rounded text-[10px] text-white">Space</kbd> to retry.<Cursor /></>
              )}
            </p>
          </div>

          {/* Canvas */}
          <div className="flex justify-center px-4 pb-2">
            <canvas
              ref={canvasRef}
              width={GRID_COLS * CELL_SIZE}
              height={GRID_ROWS * CELL_SIZE}
              className="rounded-lg border border-[#30363d]"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Mobile controls */}
          <div className="flex flex-col items-center gap-1 pb-4 pt-1 sm:hidden select-none">
            {game.status === 'idle' || game.status === 'dead' ? (
              <button
                onClick={startGame}
                className="px-6 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {game.status === 'dead' ? 'Retry' : 'Start Game'}
              </button>
            ) : (
              <>
                <button
                  onPointerDown={() => handleMobileDir(Direction.UP)}
                  className="w-12 h-10 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-white text-lg flex items-center justify-center active:bg-[#388bfd]"
                >
                  ↑
                </button>
                <div className="flex gap-2">
                  <button
                    onPointerDown={() => handleMobileDir(Direction.LEFT)}
                    className="w-12 h-10 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-white text-lg flex items-center justify-center active:bg-[#388bfd]"
                  >
                    ←
                  </button>
                  <button
                    onPointerDown={() => handleMobileDir(Direction.DOWN)}
                    className="w-12 h-10 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-white text-lg flex items-center justify-center active:bg-[#388bfd]"
                  >
                    ↓
                  </button>
                  <button
                    onPointerDown={() => handleMobileDir(Direction.RIGHT)}
                    className="w-12 h-10 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-white text-lg flex items-center justify-center active:bg-[#388bfd]"
                  >
                    →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Start button for desktop idle/dead */}
          {(game.status === 'idle' || game.status === 'dead') && (
            <div className="hidden sm:flex justify-center pb-4">
              <button
                onClick={startGame}
                className="px-6 py-2 bg-green-800 hover:bg-green-700 text-green-300 text-sm font-mono rounded-lg border border-green-700 hover:border-green-500 transition-all duration-200"
              >
                {game.status === 'dead' ? '[ retry ]' : '[ start ]'}
              </button>
            </div>
          )}

          {/* Bottom bar */}
          <div className="px-4 py-2 bg-[#161b22] border-t border-[#30363d] flex items-center gap-4 text-[10px] text-[#8b949e]">
            <span>↑↓←→ / WASD move</span>
            <span className="hidden sm:inline">Space / Enter start</span>
            <span className="ml-auto">+10 pts per food</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TerminalGame);
