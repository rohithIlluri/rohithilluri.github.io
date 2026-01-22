/**
 * HUD.js - Heads-Up Display Elements
 * Zone name display, interaction prompts, day/night indicator
 * Mobile-friendly responsive layout
 */

import { useGameStore } from '../stores/gameStore.js';

// HUD styles
const HUD_STYLES = {
  container: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '100',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  zoneName: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 24px',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    color: '#FFD54F',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    opacity: '0',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 213, 79, 0.3)',
  },
  interactionPrompt: {
    position: 'absolute',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '12px 24px',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    opacity: '0',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    pointerEvents: 'auto',
  },
  keyHint: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#FFD54F',
    color: '#1A1A2E',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '700',
  },
  dayNightIndicator: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    pointerEvents: 'auto',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    border: '2px solid rgba(255, 255, 255, 0.2)',
  },
  mobileControls: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    opacity: '0',
  },
  controlButton: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    cursor: 'pointer',
  },
  controlsHint: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    padding: '10px 16px',
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    color: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '8px',
    fontSize: '12px',
    lineHeight: '1.6',
    backdropFilter: 'blur(5px)',
  },
};

/**
 * HUD Manager Class
 */
export class HUD {
  constructor() {
    this.container = null;
    this.zoneNameEl = null;
    this.interactionPromptEl = null;
    this.dayNightEl = null;
    this.mobileControlsEl = null;
    this.controlsHintEl = null;

    this.currentZone = '';
    this.zoneTimeout = null;
    this.isMobile = this.detectMobile();

    this.init();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  init() {
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'hud-container';
    this.applyStyles(this.container, HUD_STYLES.container);

    // Create zone name display
    this.zoneNameEl = document.createElement('div');
    this.zoneNameEl.id = 'zone-name';
    this.applyStyles(this.zoneNameEl, HUD_STYLES.zoneName);
    this.container.appendChild(this.zoneNameEl);

    // Create interaction prompt
    this.interactionPromptEl = document.createElement('div');
    this.interactionPromptEl.id = 'interaction-prompt';
    this.applyStyles(this.interactionPromptEl, HUD_STYLES.interactionPrompt);

    const keyHint = document.createElement('span');
    keyHint.id = 'key-hint';
    this.applyStyles(keyHint, HUD_STYLES.keyHint);
    keyHint.textContent = this.isMobile ? 'TAP' : 'E';

    const promptText = document.createElement('span');
    promptText.id = 'prompt-text';
    promptText.textContent = 'Enter Building';

    this.interactionPromptEl.appendChild(keyHint);
    this.interactionPromptEl.appendChild(promptText);
    this.container.appendChild(this.interactionPromptEl);

    // Create day/night indicator
    this.dayNightEl = document.createElement('div');
    this.dayNightEl.id = 'day-night-indicator';
    this.applyStyles(this.dayNightEl, HUD_STYLES.dayNightIndicator);
    this.updateDayNightIcon(false);
    this.dayNightEl.addEventListener('click', () => this.toggleDayNight());
    this.container.appendChild(this.dayNightEl);

    // Create controls hint (desktop only)
    if (!this.isMobile) {
      this.controlsHintEl = document.createElement('div');
      this.controlsHintEl.id = 'controls-hint';
      this.applyStyles(this.controlsHintEl, HUD_STYLES.controlsHint);

      // Create individual control items for staggered animation
      const controls = [
        { key: 'WASD', action: 'Move' },
        { key: 'SHIFT', action: 'Run' },
        { key: 'E', action: 'Interact' },
        { key: 'N', action: 'Day/Night' },
      ];

      controls.forEach((control, index) => {
        const item = document.createElement('div');
        item.className = 'control-item';
        item.innerHTML = `<strong>${control.key}</strong> - ${control.action}`;
        item.style.opacity = '0';
        item.style.transform = 'translateY(10px)';
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        this.controlsHintEl.appendChild(item);

        // Staggered fade-in animation
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        }, 200 + (index * 150)); // 150ms delay between each item
      });

      this.container.appendChild(this.controlsHintEl);

      // Fade out after 5 seconds
      setTimeout(() => {
        if (this.controlsHintEl) {
          // Staggered fade-out
          const items = this.controlsHintEl.querySelectorAll('.control-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.style.opacity = '0';
              item.style.transform = 'translateY(-10px)';
            }, index * 100);
          });

          setTimeout(() => {
            if (this.controlsHintEl && this.controlsHintEl.parentNode) {
              this.controlsHintEl.parentNode.removeChild(this.controlsHintEl);
            }
          }, 1000);
        }
      }, 5000);
    }

    // Create mobile controls
    if (this.isMobile) {
      this.createMobileControls();
    }

    // Add to document
    document.body.appendChild(this.container);

    // Subscribe to store changes
    this.subscribeToStore();
  }

  applyStyles(element, styles) {
    Object.assign(element.style, styles);
  }

  createMobileControls() {
    this.mobileControlsEl = document.createElement('div');
    this.mobileControlsEl.id = 'mobile-controls';
    this.applyStyles(this.mobileControlsEl, HUD_STYLES.mobileControls);
    this.mobileControlsEl.style.opacity = '1'; // Show on mobile

    // Interact button
    const interactBtn = document.createElement('button');
    this.applyStyles(interactBtn, HUD_STYLES.controlButton);
    interactBtn.innerHTML = '&#9995;'; // Raised hand emoji
    interactBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      // Dispatch interact event
      window.dispatchEvent(new CustomEvent('mobile-interact'));
    });

    this.mobileControlsEl.appendChild(interactBtn);
    this.container.appendChild(this.mobileControlsEl);
  }

  subscribeToStore() {
    useGameStore.subscribe((state, prevState) => {
      // Update day/night indicator
      if (state.isNight !== prevState.isNight) {
        this.updateDayNightIcon(state.isNight);
      }
    });
  }

  /**
   * Show zone name with fade animation
   * @param {string} zoneName Name of the zone
   * @param {number} duration How long to show (ms)
   */
  showZoneName(zoneName, duration = 3000) {
    if (zoneName === this.currentZone) return;

    this.currentZone = zoneName;

    // Clear existing timeout
    if (this.zoneTimeout) {
      clearTimeout(this.zoneTimeout);
    }

    // Update text and show
    this.zoneNameEl.textContent = zoneName;
    this.zoneNameEl.style.opacity = '1';
    this.zoneNameEl.style.transform = 'translateX(-50%) translateY(0)';

    // Hide after duration
    this.zoneTimeout = setTimeout(() => {
      this.hideZoneName();
    }, duration);
  }

  hideZoneName() {
    this.zoneNameEl.style.opacity = '0';
    this.zoneNameEl.style.transform = 'translateX(-50%) translateY(-10px)';
    this.currentZone = '';
  }

  /**
   * Show interaction prompt
   * @param {string} text Prompt text
   */
  showInteractionPrompt(text) {
    const promptText = this.interactionPromptEl.querySelector('#prompt-text');
    if (promptText) {
      promptText.textContent = text;
    }
    this.interactionPromptEl.style.opacity = '1';
    this.interactionPromptEl.style.transform = 'translateX(-50%) translateY(0)';
  }

  hideInteractionPrompt() {
    this.interactionPromptEl.style.opacity = '0';
    this.interactionPromptEl.style.transform = 'translateX(-50%) translateY(10px)';
  }

  /**
   * Update day/night toggle icon
   * @param {boolean} isNight Whether it's night time
   */
  updateDayNightIcon(isNight) {
    this.dayNightEl.innerHTML = isNight ? '&#127769;' : '&#9728;&#65039;'; // Moon or Sun
    this.dayNightEl.title = isNight ? 'Switch to Day' : 'Switch to Night';
  }

  toggleDayNight() {
    // Dispatch event for World.js to handle
    window.dispatchEvent(new CustomEvent('toggle-day-night'));
  }

  /**
   * Show notification toast
   * @param {string} message Message to display
   * @param {string} type 'info', 'success', 'warning', 'error'
   * @param {number} duration How long to show (ms)
   */
  showNotification(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      padding: 12px 24px;
      background-color: rgba(26, 26, 46, 0.95);
      color: #FFFFFF;
      border-radius: 8px;
      font-size: 14px;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 200;
      backdrop-filter: blur(10px);
    `;

    // Type-specific styling
    const colors = {
      info: '#4FC3F7',
      success: '#81C784',
      warning: '#FFD54F',
      error: '#E57373',
    };
    toast.style.borderLeft = `4px solid ${colors[type] || colors.info}`;

    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Remove after duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * Show loading indicator
   * @param {string} message Loading message
   */
  showLoading(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.id = 'hud-loader';
    loader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #1A1A2E;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    loader.innerHTML = `
      <div style="
        width: 60px;
        height: 60px;
        border: 3px solid rgba(255, 213, 79, 0.3);
        border-top-color: #FFD54F;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <p style="
        margin-top: 20px;
        color: #FFD54F;
        font-size: 16px;
        font-weight: 500;
      ">${message}</p>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(loader);
  }

  hideLoading() {
    const loader = document.getElementById('hud-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (loader.parentNode) {
          loader.parentNode.removeChild(loader);
        }
      }, 500);
    }
  }

  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    if (this.zoneTimeout) {
      clearTimeout(this.zoneTimeout);
    }
  }
}

// Singleton instance
let hudInstance = null;

export function getHUD() {
  if (!hudInstance) {
    hudInstance = new HUD();
  }
  return hudInstance;
}

export default HUD;
