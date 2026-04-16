import { useState, useEffect, useRef, useCallback } from 'react';
import { processCommand, COMMAND_NAMES, bannerCmd } from '../commands/registry';

let idCounter = 0;
const uid = () => `e${++idCounter}`;

function tagEntries(entries) {
  return entries.map(e => ({ ...e, id: uid() }));
}

// Boot sequence shown before the banner
const BOOT_LINES = [
  { type: 'system', text: `Last login: ${new Date().toDateString()} on ttys001` },
  { type: 'blank' },
];

function buildInitialEntries() {
  const boot = tagEntries(BOOT_LINES);
  const banner = tagEntries(bannerCmd());
  return [...boot, ...banner];
}

const SPINNER_CHARS = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function useTerminal() {
  const [entries, setEntries] = useState(buildInitialEntries);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const savedDraftRef = useRef('');
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const loadingIdRef = useRef(null);

  // Spinner animation when loading
  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setSpinnerFrame(f => (f + 1) % SPINNER_CHARS.length), 80);
    return () => clearInterval(id);
  }, [isLoading]);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [entries]);

  const appendEntries = useCallback((newEntries) => {
    setEntries(prev => [...prev, ...tagEntries(newEntries)]);
  }, []);

  // Tab completion
  const getSuggestion = useCallback((val) => {
    if (!val.trim() || val.includes(' ')) return '';
    const lower = val.toLowerCase();
    return COMMAND_NAMES.find(c => c.startsWith(lower) && c !== lower) || '';
  }, []);

  const suggestion = getSuggestion(inputValue);

  const handleInput = useCallback((e) => {
    setInputValue(e.target.value);
    historyIndexRef.current = -1;
  }, []);

  const handleKeyDown = useCallback(async (e) => {
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        if (isLoading) return;
        const raw = inputValue.trim();
        setInputValue('');
        historyIndexRef.current = -1;
        savedDraftRef.current = '';

        if (!raw) return;

        // Deduplicated history push
        historyRef.current = [raw, ...historyRef.current.filter(h => h !== raw)].slice(0, 100);

        // Echo the command
        const echoEntry = { id: uid(), type: 'command', text: raw };
        setEntries(prev => [...prev, echoEntry]);

        // Dispatch
        try {
          const resultPromise = processCommand(raw);
          const isAsync = resultPromise instanceof Promise;

          if (isAsync) {
            setIsLoading(true);
            const loadId = uid();
            loadingIdRef.current = loadId;
            setEntries(prev => [...prev, { id: loadId, type: 'loading', text: 'Loading...' }]);
          }

          const result = await resultPromise;

          if (isAsync) {
            setIsLoading(false);
          }

          if (!Array.isArray(result)) return;

          if (result.length === 1 && result[0].type === 'clear') {
            setEntries([]);
            return;
          }

          const tagged = tagEntries(result);

          if (isAsync && loadingIdRef.current) {
            setEntries(prev => {
              const withoutLoading = prev.filter(e => e.id !== loadingIdRef.current);
              return [...withoutLoading, ...tagged];
            });
            loadingIdRef.current = null;
          } else {
            setEntries(prev => [...prev, ...tagged]);
          }
        } catch (err) {
          setIsLoading(false);
          if (loadingIdRef.current) {
            setEntries(prev => prev.filter(e => e.id !== loadingIdRef.current));
            loadingIdRef.current = null;
          }
          appendEntries([
            { type: 'error', text: `Unexpected error: ${err.message}` },
            { type: 'blank' },
          ]);
        }
        break;
      }

      case 'Tab': {
        e.preventDefault();
        if (!suggestion) {
          // Show all matching commands
          const lower = inputValue.toLowerCase().trim();
          if (lower) {
            const matches = COMMAND_NAMES.filter(c => c.startsWith(lower));
            if (matches.length > 1) {
              appendEntries([
                { type: 'command', text: inputValue },
                { type: 'text', text: `  ${matches.join('  ')}`, color: 'muted' },
                { type: 'blank' },
              ]);
            }
          }
        } else {
          setInputValue(prev => prev + suggestion);
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        if (historyRef.current.length === 0) return;
        if (historyIndexRef.current === -1) {
          savedDraftRef.current = inputValue;
        }
        const nextIdx = Math.min(historyIndexRef.current + 1, historyRef.current.length - 1);
        historyIndexRef.current = nextIdx;
        setInputValue(historyRef.current[nextIdx]);
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        if (historyIndexRef.current === -1) return;
        const prevIdx = historyIndexRef.current - 1;
        historyIndexRef.current = prevIdx;
        setInputValue(prevIdx === -1 ? savedDraftRef.current : historyRef.current[prevIdx]);
        break;
      }

      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          setEntries([]);
        }
        break;

      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          setInputValue('');
          historyIndexRef.current = -1;
        }
        break;

      default:
        break;
    }
  }, [inputValue, isLoading, suggestion, appendEntries]);

  return {
    entries,
    inputValue,
    isLoading,
    suggestion,
    spinnerFrame,
    spinnerChar: SPINNER_CHARS[spinnerFrame],
    outputRef,
    inputRef,
    handleInput,
    handleKeyDown,
  };
}
