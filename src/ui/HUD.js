/**
 * HUD.js - Game Heads-Up Display
 * Shows coins, mail count, quest indicator, and zone/compass
 */

/**
 * HUD - Game HUD Component
 * Displays player stats and current quest information
 */
import { useGameStore } from '../stores/gameStore.js';

export class HUD {
  constructor(container) {
    this.container = container;
    this.element = null;
    this.coinsElement = null;
    this.mailElement = null;
    this.mailPanel = null;
    this.questElement = null;
    this.compassElement = null;
    this.isVisible = true;
    this.isMailPanelOpen = false;
  }

  /**
   * Initialize the HUD
   */
  init() {
    this.createElement();
    this.show();
  }

  /**
   * Create the HUD DOM structure
   */
  createElement() {
    // Main HUD container (top-right stats)
    this.element = document.createElement('div');
    this.element.className = 'ui-hud';
    this.element.innerHTML = `
      <div class="ui-hud-item ui-hud-coins">
        <span class="ui-hud-icon">${this.getCoinIcon()}</span>
        <span class="ui-hud-value" id="ui-coin-value">0</span>
      </div>
      <div class="ui-hud-item ui-hud-mail">
        <span class="ui-hud-icon">${this.getMailIcon()}</span>
        <span class="ui-hud-value" id="ui-mail-value">0</span>
        <span class="ui-hud-label">/ 5</span>
      </div>
    `;
    this.container.appendChild(this.element);

    // Get references to value elements
    this.coinsElement = this.element.querySelector('#ui-coin-value');
    this.mailElement = this.element.querySelector('#ui-mail-value');

    // Make mail item clickable
    const mailItem = this.element.querySelector('.ui-hud-mail');
    if (mailItem) {
      mailItem.style.cursor = 'pointer';
      mailItem.addEventListener('click', () => this.toggleMailPanel());
    }

    // Create mail panel (expandable list)
    this.createMailPanel();

    // Quest indicator (top-left)
    this.questElement = document.createElement('div');
    this.questElement.className = 'ui-quest-indicator';
    this.questElement.innerHTML = `
      <div class="ui-quest-label">Current Quest</div>
      <div class="ui-quest-title" id="ui-quest-title">No active quest</div>
      <div class="ui-quest-objective" id="ui-quest-objective"></div>
    `;
    this.container.appendChild(this.questElement);

    // Compass/Zone indicator (top-center)
    this.compassElement = document.createElement('div');
    this.compassElement.className = 'ui-compass';
    this.compassElement.innerHTML = `
      <span class="ui-compass-text" id="ui-zone-name">Spawn Point</span>
    `;
    this.container.appendChild(this.compassElement);
  }

  /**
   * Create the expandable mail panel
   */
  createMailPanel() {
    this.mailPanel = document.createElement('div');
    this.mailPanel.className = 'ui-mail-panel';
    this.mailPanel.innerHTML = `
      <div class="ui-mail-panel-header">
        <span class="ui-mail-panel-title">Mail Bag</span>
        <button class="ui-mail-panel-close">&times;</button>
      </div>
      <div class="ui-mail-panel-list" id="ui-mail-list">
        <div class="ui-mail-empty">No mail to deliver</div>
      </div>
    `;
    this.container.appendChild(this.mailPanel);

    // Close button
    const closeBtn = this.mailPanel.querySelector('.ui-mail-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMailPanel(false);
      });
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.isMailPanelOpen && this.mailPanel && !this.mailPanel.contains(e.target)) {
        const mailItem = this.element?.querySelector('.ui-hud-mail');
        if (mailItem && !mailItem.contains(e.target)) {
          this.toggleMailPanel(false);
        }
      }
    });
  }

  /**
   * Toggle mail panel visibility
   * @param {boolean} forceState - Optional force open/close
   */
  toggleMailPanel(forceState = null) {
    this.isMailPanelOpen = forceState !== null ? forceState : !this.isMailPanelOpen;

    if (this.mailPanel) {
      if (this.isMailPanelOpen) {
        this.mailPanel.classList.add('open');
        this.updateMailPanelList();
      } else {
        this.mailPanel.classList.remove('open');
      }
    }
  }

  /**
   * Update the mail list in the panel
   */
  updateMailPanelList() {
    const listEl = this.mailPanel?.querySelector('#ui-mail-list');
    if (!listEl) return;

    const store = useGameStore.getState();
    const mail = store.inventory.mail;
    const nearbyNPC = store.nearbyNPC;

    if (mail.length === 0) {
      listEl.innerHTML = '<div class="ui-mail-empty">No mail to deliver</div>';
      return;
    }

    listEl.innerHTML = mail.map(item => {
      const isForNearby = nearbyNPC && item.to === nearbyNPC.definition?.id;
      const priorityClass = `priority-${item.priority || 'normal'}`;
      const highlightClass = isForNearby ? 'highlight' : '';

      return `
        <div class="ui-mail-item ${priorityClass} ${highlightClass}">
          <div class="ui-mail-item-icon">${this.getMailIcon()}</div>
          <div class="ui-mail-item-details">
            <div class="ui-mail-item-recipient">To: <strong>${item.toName || item.to}</strong></div>
            <div class="ui-mail-item-from">From: ${item.from || 'Unknown'}</div>
            <div class="ui-mail-item-priority ${priorityClass}">${(item.priority || 'normal').toUpperCase()}</div>
          </div>
          ${isForNearby ? '<div class="ui-mail-item-deliver">Ready to deliver!</div>' : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Get coin icon SVG
   * @returns {string} SVG string
   */
  getCoinIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor"/>
      <circle cx="12" cy="12" r="7" fill="#1A1A2E" opacity="0.3"/>
      <text x="12" y="16" text-anchor="middle" fill="#1A1A2E" font-size="10" font-weight="bold">$</text>
    </svg>`;
  }

  /**
   * Get mail icon SVG
   * @returns {string} SVG string
   */
  getMailIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/>
      <path d="M3 7L12 13L21 7" stroke="#1A1A2E" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }

  /**
   * Update coin count display
   * @param {number} coins - Current coin count
   */
  updateCoins(coins) {
    if (this.coinsElement) {
      const oldValue = parseInt(this.coinsElement.textContent) || 0;
      this.coinsElement.textContent = coins;

      // Animate on increase
      if (coins > oldValue) {
        this.animateValue(this.coinsElement.parentElement);
      }
    }
  }

  /**
   * Update mail count display
   * @param {number} count - Current mail count
   * @param {number} max - Maximum mail capacity
   */
  updateMail(count, max = 5) {
    if (this.mailElement) {
      const oldValue = parseInt(this.mailElement.textContent) || 0;
      this.mailElement.textContent = count;

      // Update max label
      const label = this.element.querySelector('.ui-hud-mail .ui-hud-label');
      if (label) {
        label.textContent = `/ ${max}`;
      }

      // Animate on change
      if (count !== oldValue) {
        this.animateValue(this.mailElement.parentElement);
      }

      // Update mail panel if open
      if (this.isMailPanelOpen) {
        this.updateMailPanelList();
      }
    }
  }

  /**
   * Update quest indicator
   * @param {Object|null} quest - Current quest object or null
   */
  updateQuest(quest) {
    if (!this.questElement) return;

    const titleEl = this.questElement.querySelector('#ui-quest-title');
    const objectiveEl = this.questElement.querySelector('#ui-quest-objective');

    if (quest) {
      this.questElement.classList.add('visible');
      if (titleEl) {
        titleEl.textContent = quest.title || 'Unknown Quest';
      }
      if (objectiveEl) {
        // Show current objective
        const objectives = quest.objectives || [];
        const currentObj = objectives.find((o) => !o.complete);
        if (currentObj) {
          objectiveEl.textContent = currentObj.description || currentObj.text || '';
          objectiveEl.classList.remove('complete');
        } else if (objectives.length > 0) {
          objectiveEl.textContent = 'Complete!';
          objectiveEl.classList.add('complete');
        } else {
          objectiveEl.textContent = quest.description || '';
        }
      }
    } else {
      this.questElement.classList.remove('visible');
      if (titleEl) {
        titleEl.textContent = 'No active quest';
      }
      if (objectiveEl) {
        objectiveEl.textContent = '';
      }
    }
  }

  /**
   * Update zone/compass indicator
   * @param {string} zoneName - Current zone name
   */
  updateZone(zoneName) {
    if (this.compassElement) {
      const textEl = this.compassElement.querySelector('#ui-zone-name');
      if (textEl) {
        textEl.textContent = zoneName || 'Unknown';
      }
    }
  }

  /**
   * Animate a HUD item on value change
   * @param {HTMLElement} element - Element to animate
   */
  animateValue(element) {
    if (!element) return;

    // Remove existing animation class
    element.classList.remove('value-changed');

    // Force reflow to restart animation
    void element.offsetWidth;

    // Add animation class
    element.style.transform = 'scale(1.15)';
    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, 150);
  }

  /**
   * Show the HUD
   */
  show() {
    this.isVisible = true;
    if (this.element) {
      this.element.style.opacity = '1';
      this.element.style.pointerEvents = 'auto';
    }
    if (this.compassElement) {
      this.compassElement.style.opacity = '1';
    }
  }

  /**
   * Hide the HUD
   */
  hide() {
    this.isVisible = false;
    if (this.element) {
      this.element.style.opacity = '0';
      this.element.style.pointerEvents = 'none';
    }
    if (this.questElement) {
      this.questElement.classList.remove('visible');
    }
    if (this.compassElement) {
      this.compassElement.style.opacity = '0';
    }
  }

  /**
   * Clean up the HUD
   */
  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.questElement && this.questElement.parentNode) {
      this.questElement.parentNode.removeChild(this.questElement);
    }
    if (this.compassElement && this.compassElement.parentNode) {
      this.compassElement.parentNode.removeChild(this.compassElement);
    }
    if (this.mailPanel && this.mailPanel.parentNode) {
      this.mailPanel.parentNode.removeChild(this.mailPanel);
    }
    this.element = null;
    this.questElement = null;
    this.compassElement = null;
    this.coinsElement = null;
    this.mailElement = null;
    this.mailPanel = null;
    this.isMailPanelOpen = false;
  }
}
