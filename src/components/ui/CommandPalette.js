import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      (c.hint && c.hint.toLowerCase().includes(q)) ||
      (c.keywords && c.keywords.some(k => k.toLowerCase().includes(q)))
    );
  }, [commands, query]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(a => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(a => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[active];
        if (cmd) {
          cmd.run();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, active, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-input-row">
          <span className="cmdk-prompt" aria-hidden="true">❯</span>
          <input
            ref={inputRef}
            className="cmdk-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            aria-label="Command palette search"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="cmdk-kbd">esc</kbd>
        </div>

        <ul ref={listRef} className="cmdk-list" role="listbox">
          {filtered.length === 0 && (
            <li className="cmdk-empty">no matches</li>
          )}
          {filtered.map((c, i) => (
            <li
              key={c.id}
              data-idx={i}
              role="option"
              aria-selected={i === active}
              className={`cmdk-item${i === active ? ' cmdk-item--active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => { c.run(); onClose(); }}
            >
              <span className="cmdk-item-icon" aria-hidden="true">{c.icon || '›'}</span>
              <span className="cmdk-item-label">{c.label}</span>
              {c.hint && <span className="cmdk-item-hint">{c.hint}</span>}
              {c.shortcut && <kbd className="cmdk-kbd">{c.shortcut}</kbd>}
            </li>
          ))}
        </ul>

        <div className="cmdk-footer">
          <span><kbd className="cmdk-kbd">↑↓</kbd> navigate</span>
          <span><kbd className="cmdk-kbd">↵</kbd> select</span>
          <span><kbd className="cmdk-kbd">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
