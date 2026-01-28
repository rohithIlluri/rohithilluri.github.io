/**
 * InteractionPrompt.js - NPC Interaction Prompt
 * Shows "Press E to talk" when player is near an NPC
 */

/**
 * InteractionPrompt - Shows interaction hint when near NPCs
 * Displays NPC name and key prompt at bottom-center of screen
 */
export class InteractionPrompt {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.nameElement = null;
    this.isVisible = false;
    this.currentNPCName = null;
  }

  /**
   * Initialize the interaction prompt
   */
  init() {
    this.createElement();
  }

  /**
   * Create the prompt DOM structure
   */
  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'ui-interaction-prompt';
    this.element.innerHTML = `
      <div class="ui-interaction-npc-name" id="ui-npc-name">NPC</div>
      <div class="ui-interaction-action">
        <span class="ui-interaction-key">E</span>
        <span class="ui-interaction-text">Press to talk</span>
      </div>
    `;
    this.container.appendChild(this.element);

    // Get reference to name element
    this.nameElement = this.element.querySelector('#ui-npc-name');
  }

  /**
   * Show the interaction prompt
   * @param {string} npcName - Name of the nearby NPC
   * @param {string} actionText - Custom action text (optional)
   */
  show(npcName, actionText = 'Press to talk') {
    if (!this.element) return;

    this.currentNPCName = npcName;
    this.isVisible = true;

    // Update NPC name
    if (this.nameElement) {
      this.nameElement.textContent = npcName || 'NPC';
    }

    // Update action text if provided
    const actionEl = this.element.querySelector('.ui-interaction-text');
    if (actionEl && actionText) {
      actionEl.textContent = actionText;
    }

    // Show with animation
    this.element.classList.add('visible');
  }

  /**
   * Hide the interaction prompt
   */
  hide() {
    if (!this.element) return;

    this.isVisible = false;
    this.currentNPCName = null;

    // Hide with animation
    this.element.classList.remove('visible');
  }

  /**
   * Update the prompt text without changing visibility
   * @param {string} actionText - New action text
   */
  updateActionText(actionText) {
    if (!this.element) return;

    const actionEl = this.element.querySelector('.ui-interaction-text');
    if (actionEl) {
      actionEl.textContent = actionText;
    }
  }

  /**
   * Update the interaction key display
   * @param {string} key - Key to display (e.g., 'E', 'F', 'Space')
   */
  updateKey(key) {
    if (!this.element) return;

    const keyEl = this.element.querySelector('.ui-interaction-key');
    if (keyEl) {
      keyEl.textContent = key;
    }
  }

  /**
   * Check if prompt is currently visible
   * @returns {boolean} Visibility state
   */
  getIsVisible() {
    return this.isVisible;
  }

  /**
   * Get current NPC name being displayed
   * @returns {string|null} NPC name or null
   */
  getCurrentNPCName() {
    return this.currentNPCName;
  }

  /**
   * Clean up the prompt
   */
  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.nameElement = null;
    this.isVisible = false;
    this.currentNPCName = null;
  }
}
