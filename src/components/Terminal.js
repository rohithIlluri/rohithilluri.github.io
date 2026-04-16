import React, { useCallback } from 'react';
import { useTerminal } from '../hooks/useTerminal';
import useYouTubePlayer from '../hooks/useYouTubePlayer';

// ── Color map ─────────────────────────────────────────────────────────────
const COLOR = {
  green:   'var(--green)',
  yellow:  'var(--yellow)',
  blue:    'var(--blue)',
  cyan:    'var(--cyan)',
  red:     'var(--red)',
  orange:  'var(--orange)',
  magenta: 'var(--magenta)',
  muted:   'var(--muted)',
  white:   'var(--white)',
  dim:     'var(--dim)',
};

function color(c) {
  return COLOR[c] || 'var(--white)';
}

// ── Entry Renderers ───────────────────────────────────────────────────────

function CommandLine({ text }) {
  return (
    <div className="term-command-line">
      <span className="term-prompt-prefix">rohith@portfolio:~$&nbsp;</span>
      <span className="term-command-text">{text}</span>
    </div>
  );
}

function TextLine({ text, c }) {
  return (
    <span className="term-block" style={{ color: color(c) }}>
      {text}
    </span>
  );
}

function SectionHeader({ title }) {
  return (
    <span className="term-section-header">
      {`\n  ${title}`}
    </span>
  );
}

function DividerLine() {
  return (
    <span className="term-divider">
      {'  ' + '─'.repeat(56)}
    </span>
  );
}

function RowLine({ label, value, labelColor, valueColor }) {
  return (
    <div className="term-row">
      <span className="term-row-label" style={{ color: color(labelColor) }}>
        {label}
      </span>
      <span className="term-row-value" style={{ color: color(valueColor) }}>
        {value}
      </span>
    </div>
  );
}

function ErrorLine({ text }) {
  return (
    <span className="term-block" style={{ color: 'var(--red)' }}>
      {`  ✗ ${text}`}
    </span>
  );
}

function SystemLine({ text }) {
  return (
    <span className="term-block" style={{ color: 'var(--muted)' }}>
      {text}
    </span>
  );
}

function LoadingLine({ spinnerChar }) {
  return (
    <div className="term-loading">
      <span className="term-spinner-char">{spinnerChar || '⠋'}</span>
      <span>Fetching data…</span>
    </div>
  );
}

function BlankLine() {
  return <div className="term-blank" />;
}

// ── Main entry renderer ───────────────────────────────────────────────────

function renderEntry(entry, spinnerChar) {
  const key = entry.id;

  switch (entry.type) {
    case 'command':
      return <CommandLine key={key} text={entry.text} />;

    case 'text':
      return <TextLine key={key} text={entry.text} c={entry.color} />;

    case 'section':
      return <SectionHeader key={key} title={entry.title} />;

    case 'divider':
      return <DividerLine key={key} />;

    case 'row':
      return (
        <RowLine
          key={key}
          label={entry.label}
          value={entry.value}
          labelColor={entry.labelColor}
          valueColor={entry.valueColor}
        />
      );

    case 'error':
      return <ErrorLine key={key} text={entry.text} />;

    case 'system':
      return <SystemLine key={key} text={entry.text} />;

    case 'loading':
      return <LoadingLine key={key} spinnerChar={spinnerChar} />;

    case 'blank':
      return <BlankLine key={key} />;

    default:
      return null;
  }
}

// ── Title Bar ─────────────────────────────────────────────────────────────

function TitleBar() {
  return (
    <div className="terminal-titlebar">
      <div className="terminal-traffic-lights">
        <div className="traffic-light traffic-light-close" title="Close" />
        <div className="traffic-light traffic-light-min" title="Minimize" />
        <div className="traffic-light traffic-light-max" title="Maximize" />
      </div>
      <div className="terminal-title">rohith@portfolio — terminal</div>
      <div className="terminal-title-badges">
        <span className="terminal-badge green">● online</span>
        <span className="terminal-badge">bash</span>
      </div>
    </div>
  );
}

// ── Input Bar ─────────────────────────────────────────────────────────────

function InputBar({ inputValue, suggestion, isLoading, inputRef, onInput, onKeyDown }) {
  return (
    <div className="terminal-input-area">
      <span className="terminal-prompt-label">rohith@portfolio:~$&nbsp;</span>
      <div className="terminal-input-wrapper">
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          value={inputValue}
          onChange={onInput}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={isLoading ? 'Running…' : ''}
          aria-label="Terminal command input"
        />
        {suggestion && !isLoading && (
          <span className="terminal-input-suggestion">{suggestion}</span>
        )}
      </div>
    </div>
  );
}

// ── Music Bar ─────────────────────────────────────────────────────────────

function MusicBar({ currentTrack, isPlaying, onToggle, onNext, onPrevious }) {
  const stop = useCallback((fn) => (e) => {
    e.stopPropagation();
    fn();
  }, []);

  return (
    <div className="terminal-music-bar">
      <div className="music-bar-left">
        <div className="music-bar-eq">
          <div className={`eq-bar${!isPlaying ? ' eq-bar-paused' : ''}`} />
          <div className={`eq-bar${!isPlaying ? ' eq-bar-paused' : ''}`} />
          <div className={`eq-bar${!isPlaying ? ' eq-bar-paused' : ''}`} />
          <div className={`eq-bar${!isPlaying ? ' eq-bar-paused' : ''}`} />
        </div>
        {currentTrack ? (
          <div className="music-track-info">
            <div className="music-track-title">{currentTrack.title}</div>
            {currentTrack.author && (
              <div className="music-track-author">{currentTrack.author}</div>
            )}
          </div>
        ) : (
          <span className="music-no-track">
            No track — interact with the page to start playback
          </span>
        )}
      </div>

      {currentTrack && (
        <div className="music-controls">
          <button className="music-ctrl-btn" onClick={stop(onPrevious)} aria-label="Previous">
            ◀◀
          </button>
          <button className="music-ctrl-btn" onClick={stop(onToggle)} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button className="music-ctrl-btn" onClick={stop(onNext)} aria-label="Next">
            ▶▶
          </button>
        </div>
      )}
    </div>
  );
}

// ── Terminal (main) ───────────────────────────────────────────────────────

export default function Terminal() {
  const {
    entries,
    inputValue,
    isLoading,
    suggestion,
    spinnerChar,
    outputRef,
    inputRef,
    handleInput,
    handleKeyDown,
  } = useTerminal();

  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } =
    useYouTubePlayer();

  const focusInput = useCallback((e) => {
    // Don't steal focus from music buttons
    if (e.target.closest('.music-ctrl-btn')) return;
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <div className="terminal-window" onClick={focusInput}>
      <TitleBar />

      <div className="terminal-output" ref={outputRef}>
        {entries.map(entry => renderEntry(entry, spinnerChar))}
      </div>

      <InputBar
        inputValue={inputValue}
        suggestion={suggestion}
        isLoading={isLoading}
        inputRef={inputRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />

      <MusicBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onToggle={togglePlayPause}
        onNext={nextTrack}
        onPrevious={previousTrack}
      />
    </div>
  );
}
