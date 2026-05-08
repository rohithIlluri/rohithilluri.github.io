import React, { useEffect } from 'react';

const SHORTCUTS = [
  { keys: ['↑', '↓'], label: 'scroll between sections' },
  { keys: ['j', 'k'], label: 'vim-style scroll' },
  { keys: ['1', '–', '6'], label: 'jump to section' },
  { keys: ['⌘', 'K'], label: 'command palette' },
  { keys: ['/'], label: 'open search' },
  { keys: ['?'], label: 'toggle this help' },
  { keys: ['g'], label: 'top (about)' },
  { keys: ['G'], label: 'bottom (stats)' },
  { keys: ['Esc'], label: 'close overlay' },
];

export default function HelpOverlay({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div className="help-panel" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <span className="help-title">keyboard shortcuts</span>
          <button className="help-close" onClick={onClose} aria-label="Close">esc</button>
        </div>
        <ul className="help-list">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="help-row">
              <span className="help-keys">
                {s.keys.map((k, i) => (
                  <kbd key={i} className="cmdk-kbd">{k}</kbd>
                ))}
              </span>
              <span className="help-label tui-dim">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
