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
    this.controlsHintElement = null;
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

    // Controls hint (bottom-center)
    this.controlsHintElement = document.createElement('div');
    this.controlsHintElement.className = 'ui-controls-hint';
    this.controlsHintElement.innerHTML = `
      <span class="ui-control-key">WASD</span> Move
      <span class="ui-control-key">SHIFT</span> Run
      <span class="ui-control-key">E</span> Interact
      <span class="ui-control-key">Q</span> Quests
      <span class="ui-control-key">N</span> Day/Night
    `;
    this.container.appendChild(this.controlsHintElement);

    // Create top-right button group (audio + settings)
    this.createTopRightButtons();
  }

  /**
   * Create audio and settings buttons
   */
  createTopRightButtons() {
    // Audio toggle button
    this.audioButton = document.createElement('button');
    this.audioButton.className = 'hud-audio-btn';
    this.audioButton.id = 'hud-audio-btn';
    this.audioButton.title = 'Toggle Audio (M)';
    this.audioButton.innerHTML = this.getSpeakerIcon();
    this.container.appendChild(this.audioButton);

    // Settings button
    this.settingsButton = document.createElement('button');
    this.settingsButton.className = 'hud-settings-btn';
    this.settingsButton.id = 'hud-settings-btn';
    this.settingsButton.title = 'Settings';
    this.settingsButton.innerHTML = this.getGearIcon();
    this.container.appendChild(this.settingsButton);

    // Audio button click handler
    this.audioButton.addEventListener('click', () => {
      this.toggleAudio();
    });

    // Update audio button state from store
    this.updateAudioButton();
  }

  /**
   * Toggle audio mute state
   */
  toggleAudio() {
    const state = useGameStore.getState();
    const currentVolume = state.settings.audio.masterVolume;
    const newVolume = currentVolume > 0 ? 0 : 0.7;
    state.updateSettings('audio', { masterVolume: newVolume });
    this.updateAudioButton();
  }

  /**
   * Update audio button visual state
   */
  updateAudioButton() {
    if (!this.audioButton) return;
    const state = useGameStore.getState();
    const isMuted = state.settings.audio.masterVolume === 0;
    this.audioButton.classList.toggle('muted', isMuted);
    this.audioButton.innerHTML = isMuted ? this.getSpeakerMutedIcon() : this.getSpeakerIcon();
  }

  /**
   * Get settings panel reference (set by UIManager)
   */
  setSettingsPanel(settingsPanel) {
    this.settingsPanel = settingsPanel;
    if (this.settingsButton) {
      this.settingsButton.addEventListener('click', () => {
        if (this.settingsPanel) {
          this.settingsPanel.toggle();
        }
      });
    }
  }

  /**
   * Get speaker icon SVG
   */
  getSpeakerIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>`;
  }

  /**
   * Get muted speaker icon SVG
   */
  getSpeakerMutedIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`;
  }

  /**
   * Get gear icon SVG
   */
  getGearIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`;
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
      <circle cx="12" cy="12" r="6.5" fill="#1A1A2E" opacity="0.3"/>
      <path d="M12 7V17M9 10H15M9 14H15" stroke="#1A1A2E" stroke-width="2" stroke-linecap="round"/>
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

    element.classList.add('value-change');
    element.addEventListener('animationend', () => {
      element.classList.remove('value-change');
    }, { once: true });
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
    if (this.controlsHintElement) {
      this.controlsHintElement.style.opacity = '1';
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
    if (this.controlsHintElement) {
      this.controlsHintElement.style.opacity = '0';
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
    if (this.controlsHintElement && this.controlsHintElement.parentNode) {
      this.controlsHintElement.parentNode.removeChild(this.controlsHintElement);
    }
    this.element = null;
    this.questElement = null;
    this.compassElement = null;
    this.coinsElement = null;
    this.mailElement = null;
    this.mailPanel = null;
    this.controlsHintElement = null;
    this.isMailPanelOpen = false;
  }
}
