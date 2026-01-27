/**
 * DialogueBox.js - Dialogue UI Component
 * Renders dialogue box at bottom of screen with typewriter effect
 * Styled according to Messenger visual spec
 */

export class DialogueBox {
  constructor() {
    // DOM elements
    this.container = null;
    this.overlay = null;
    this.box = null;
    this.speakerEl = null;
    this.textEl = null;
    this.choicesEl = null;

    // State
    this.isVisible = false;
    this.currentText = '';
    this.displayedText = '';
    this.typewriterInterval = null;
    this.typewriterSpeed = 40; // ms per character

    // Current choices (for event emission)
    this.currentChoices = [];

    // Event listeners
    this.listeners = new Map();

    // Bound handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onOverlayClick = this.onOverlayClick.bind(this);

    // Create DOM elements
    this.createElements();
  }

  /**
   * Create all DOM elements
   */
  createElements() {
    // Create overlay (for click outside to close)
    this.overlay = document.createElement('div');
    this.overlay.className = 'dialogue-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 999;
      display: none;
      pointer-events: auto;
    `;

    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'dialogue-container';
    this.container.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 50%;
      min-width: 320px;
      max-width: 700px;
      z-index: 1000;
      display: none;
      font-family: 'Nunito', 'Space Grotesk', system-ui, sans-serif;
      pointer-events: auto;
    `;

    // Create dialogue box
    this.box = document.createElement('div');
    this.box.className = 'dialogue-box';
    this.box.style.cssText = `
      background: #1A1A2E;
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4),
                  0 0 0 2px rgba(255, 213, 79, 0.2);
      animation: slideUp 0.25s ease-out;
    `;

    // Create speaker name element
    this.speakerEl = document.createElement('div');
    this.speakerEl.className = 'dialogue-speaker';
    this.speakerEl.style.cssText = `
      color: #FFD54F;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 213, 79, 0.3);
    `;

    // Create text element
    this.textEl = document.createElement('div');
    this.textEl.className = 'dialogue-text';
    this.textEl.style.cssText = `
      color: #FFFFFF;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
      min-height: 48px;
    `;

    // Create choices container
    this.choicesEl = document.createElement('div');
    this.choicesEl.className = 'dialogue-choices';
    this.choicesEl.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    // Assemble elements
    this.box.appendChild(this.speakerEl);
    this.box.appendChild(this.textEl);
    this.box.appendChild(this.choicesEl);
    this.container.appendChild(this.box);

    // Add to document
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.container);

    // Add styles
    this.addStyles();
  }

  /**
   * Add CSS styles for animations and hover effects
   */
  addStyles() {
    const styleId = 'dialogue-box-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .dialogue-choice-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px 16px;
        color: #FFFFFF;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
      }

      .dialogue-choice-btn:hover {
        background: rgba(255, 213, 79, 0.15);
        border-color: #FFD54F;
        color: #FFD54F;
        transform: translateX(4px);
      }

      .dialogue-choice-btn:active {
        transform: translateX(4px) scale(0.98);
      }

      .dialogue-choice-btn:focus {
        outline: none;
        border-color: #FFD54F;
        box-shadow: 0 0 0 2px rgba(255, 213, 79, 0.3);
      }

      .dialogue-close-hint {
        position: absolute;
        top: -30px;
        right: 0;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        pointer-events: none;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show the dialogue box with content
   * @param {Object} options - { speaker, text, choices }
   */
  show(options = {}) {
    const { speaker = 'Unknown', text = '', choices = [] } = options;

    // Store choices for event emission
    this.currentChoices = choices;

    // Update speaker
    this.speakerEl.textContent = speaker;

    // Clear previous text and start typewriter
    this.textEl.textContent = '';
    this.currentText = text;
    this.displayedText = '';
    this.startTypewriter();

    // Update choices
    this.renderChoices(choices);

    // Show elements
    this.overlay.style.display = 'block';
    this.container.style.display = 'block';
    this.isVisible = true;

    // Add event listeners
    window.addEventListener('keydown', this.onKeyDown);
    this.overlay.addEventListener('click', this.onOverlayClick);

    // Focus first choice button if available
    setTimeout(() => {
      const firstBtn = this.choicesEl.querySelector('button');
      if (firstBtn) firstBtn.focus();
    }, 100);
  }

  /**
   * Hide the dialogue box
   */
  hide() {
    this.stopTypewriter();
    this.overlay.style.display = 'none';
    this.container.style.display = 'none';
    this.isVisible = false;
    this.currentChoices = [];

    // Remove event listeners
    window.removeEventListener('keydown', this.onKeyDown);
    this.overlay.removeEventListener('click', this.onOverlayClick);
  }

  /**
   * Start the typewriter effect
   */
  startTypewriter() {
    this.stopTypewriter();

    let index = 0;
    this.typewriterInterval = setInterval(() => {
      if (index < this.currentText.length) {
        this.displayedText += this.currentText[index];
        this.textEl.textContent = this.displayedText;
        index++;
      } else {
        this.stopTypewriter();
      }
    }, this.typewriterSpeed);
  }

  /**
   * Stop the typewriter effect and show full text
   */
  stopTypewriter() {
    if (this.typewriterInterval) {
      clearInterval(this.typewriterInterval);
      this.typewriterInterval = null;
    }
    // Show full text immediately
    this.displayedText = this.currentText;
    this.textEl.textContent = this.currentText;
  }

  /**
   * Check if typewriter is still animating
   */
  isTypewriting() {
    return this.typewriterInterval !== null;
  }

  /**
   * Render choice buttons
   * @param {Array} choices - Array of { text, nextNode, action }
   */
  renderChoices(choices) {
    this.choicesEl.innerHTML = '';

    if (!choices || choices.length === 0) {
      // Add a "Continue" button if no choices
      const btn = this.createChoiceButton({
        text: 'Continue',
        nextNode: null,
        action: 'endDialogue',
      }, 0);
      this.choicesEl.appendChild(btn);
      return;
    }

    // Limit to 4 choices max
    const displayChoices = choices.slice(0, 4);

    displayChoices.forEach((choice, index) => {
      const btn = this.createChoiceButton(choice, index);
      this.choicesEl.appendChild(btn);
    });
  }

  /**
   * Create a choice button element
   * @param {Object} choice - { text, nextNode, action }
   * @param {number} index - Choice index
   * @returns {HTMLButtonElement}
   */
  createChoiceButton(choice, index) {
    const btn = document.createElement('button');
    btn.className = 'dialogue-choice-btn';
    btn.textContent = `${index + 1}. ${choice.text}`;
    btn.dataset.index = index;

    btn.addEventListener('click', () => {
      this.selectChoice(index);
    });

    return btn;
  }

  /**
   * Select a choice by index
   * @param {number} index
   */
  selectChoice(index) {
    // If still typing, complete the text first
    if (this.isTypewriting()) {
      this.stopTypewriter();
      return;
    }

    const choice = this.currentChoices[index];
    if (choice) {
      this.emit('choiceSelected', choice);
    } else if (index === 0 && this.currentChoices.length === 0) {
      // "Continue" button case
      this.emit('choiceSelected', { nextNode: null, action: 'endDialogue' });
    }
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event
   */
  onKeyDown(event) {
    if (!this.isVisible) return;

    // ESC to close
    if (event.code === 'Escape') {
      event.preventDefault();
      this.emit('close');
      return;
    }

    // Space or Enter to skip typewriter or continue
    if (event.code === 'Space' || event.code === 'Enter') {
      if (this.isTypewriting()) {
        event.preventDefault();
        this.stopTypewriter();
        return;
      }
    }

    // Number keys 1-4 to select choices
    const keyNum = parseInt(event.key);
    if (keyNum >= 1 && keyNum <= 4) {
      const index = keyNum - 1;
      const maxChoices = Math.max(this.currentChoices.length, 1);
      if (index < maxChoices) {
        event.preventDefault();
        this.selectChoice(index);
      }
    }
  }

  /**
   * Handle click on overlay (outside dialogue box)
   * @param {MouseEvent} event
   */
  onOverlayClick(event) {
    // Only close if clicking directly on overlay, not the dialogue box
    if (event.target === this.overlay) {
      this.emit('close');
    }
  }

  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const listeners = this.listeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach((callback) => callback(data));
  }

  /**
   * Dispose of the dialogue box
   */
  dispose() {
    this.hide();

    // Remove DOM elements
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    // Clear references
    this.container = null;
    this.overlay = null;
    this.box = null;
    this.speakerEl = null;
    this.textEl = null;
    this.choicesEl = null;
    this.listeners.clear();
  }
}
