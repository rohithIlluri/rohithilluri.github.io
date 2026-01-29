/**
 * SettingsPanel.js - In-Game Settings UI
 * Allows players to adjust audio, graphics, and accessibility settings
 */

import { useGameStore } from '../stores/gameStore.js';

export class SettingsPanel {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.unsubscribers = [];
  }

  init() {
    this.createElement();
    this.bindEvents();
    this.subscribeToStore();
  }

  createElement() {
    const existing = document.getElementById('settings-panel');
    if (existing) existing.remove();

    this.element = document.createElement('div');
    this.element.id = 'settings-panel';
    this.element.className = 'settings-panel hidden';
    this.element.innerHTML = `
      <div class="settings-overlay"></div>
      <div class="settings-content">
        <div class="settings-header">
          <h2>Settings</h2>
          <button class="settings-close-btn" id="settings-close">&times;</button>
        </div>

        <div class="settings-body">
          <!-- Audio Section -->
          <div class="settings-section">
            <h3>Audio</h3>
            <div class="settings-row">
              <label for="master-volume">Master Volume</label>
              <div class="slider-container">
                <input type="range" id="master-volume" min="0" max="100" value="70">
                <span class="slider-value" id="master-volume-value">70%</span>
              </div>
            </div>
            <div class="settings-row">
              <label for="music-volume">Music</label>
              <div class="slider-container">
                <input type="range" id="music-volume" min="0" max="100" value="50">
                <span class="slider-value" id="music-volume-value">50%</span>
              </div>
            </div>
            <div class="settings-row">
              <label for="sfx-volume">Sound Effects</label>
              <div class="slider-container">
                <input type="range" id="sfx-volume" min="0" max="100" value="70">
                <span class="slider-value" id="sfx-volume-value">70%</span>
              </div>
            </div>
          </div>

          <!-- Graphics Section -->
          <div class="settings-section">
            <h3>Graphics</h3>
            <div class="settings-row">
              <label for="quality-select">Quality</label>
              <select id="quality-select" class="settings-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high" selected>High</option>
              </select>
            </div>
            <div class="settings-row">
              <label for="bloom-toggle">Bloom Effects</label>
              <label class="toggle-switch">
                <input type="checkbox" id="bloom-toggle" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-row">
              <label for="particles-toggle">Particles</label>
              <label class="toggle-switch">
                <input type="checkbox" id="particles-toggle" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-row">
              <label for="shadows-toggle">Shadows</label>
              <label class="toggle-switch">
                <input type="checkbox" id="shadows-toggle" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Accessibility Section -->
          <div class="settings-section">
            <h3>Accessibility</h3>
            <div class="settings-row">
              <label for="reduce-motion">Reduce Motion</label>
              <label class="toggle-switch">
                <input type="checkbox" id="reduce-motion">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="settings-row">
              <label for="text-size">Text Size</label>
              <select id="text-size" class="settings-select">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        <div class="settings-footer">
          <button class="settings-btn settings-btn-reset" id="settings-reset">Reset to Defaults</button>
          <button class="settings-btn settings-btn-save" id="settings-save">Save & Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.element);
  }

  bindEvents() {
    // Close button
    this.element.querySelector('#settings-close').addEventListener('click', () => this.hide());
    this.element.querySelector('.settings-overlay').addEventListener('click', () => this.hide());

    // Audio sliders
    this.element.querySelector('#master-volume').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) / 100;
      this.element.querySelector('#master-volume-value').textContent = `${e.target.value}%`;
      useGameStore.getState().updateSettings('audio', { masterVolume: value });
    });

    this.element.querySelector('#music-volume').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) / 100;
      this.element.querySelector('#music-volume-value').textContent = `${e.target.value}%`;
      useGameStore.getState().updateSettings('audio', { musicVolume: value });
    });

    this.element.querySelector('#sfx-volume').addEventListener('input', (e) => {
      const value = parseInt(e.target.value) / 100;
      this.element.querySelector('#sfx-volume-value').textContent = `${e.target.value}%`;
      useGameStore.getState().updateSettings('audio', { sfxVolume: value });
    });

    // Graphics controls
    this.element.querySelector('#quality-select').addEventListener('change', (e) => {
      useGameStore.getState().updateSettings('graphics', { quality: e.target.value });
    });

    this.element.querySelector('#bloom-toggle').addEventListener('change', (e) => {
      useGameStore.getState().updateSettings('graphics', { bloomEnabled: e.target.checked });
    });

    this.element.querySelector('#particles-toggle').addEventListener('change', (e) => {
      useGameStore.getState().updateSettings('graphics', { particlesEnabled: e.target.checked });
    });

    this.element.querySelector('#shadows-toggle').addEventListener('change', (e) => {
      useGameStore.getState().updateSettings('graphics', { shadowsEnabled: e.target.checked });
    });

    // Accessibility controls
    this.element.querySelector('#reduce-motion').addEventListener('change', (e) => {
      useGameStore.getState().updateSettings('accessibility', { reduceMotion: e.target.checked });
    });

    this.element.querySelector('#text-size').addEventListener('change', (e) => {
      useGameStore.getState().updateSettings('accessibility', { textSize: e.target.value });
      document.documentElement.setAttribute('data-text-size', e.target.value);
    });

    // Reset and save buttons
    this.element.querySelector('#settings-reset').addEventListener('click', () => {
      useGameStore.getState().resetSettings();
      this.updateFromStore();
      useGameStore.getState().showNotification('success', 'Settings reset to defaults');
    });

    this.element.querySelector('#settings-save').addEventListener('click', () => {
      this.saveSettings();
      this.hide();
      useGameStore.getState().showNotification('success', 'Settings saved');
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  subscribeToStore() {
    const unsub = useGameStore.subscribe((state) => {
      if (this.isVisible) {
        this.updateFromStore();
      }
    });
    this.unsubscribers.push(unsub);
  }

  updateFromStore() {
    const state = useGameStore.getState();
    const { audio, graphics, accessibility } = state.settings;

    // Audio
    this.element.querySelector('#master-volume').value = audio.masterVolume * 100;
    this.element.querySelector('#master-volume-value').textContent = `${Math.round(audio.masterVolume * 100)}%`;
    this.element.querySelector('#music-volume').value = audio.musicVolume * 100;
    this.element.querySelector('#music-volume-value').textContent = `${Math.round(audio.musicVolume * 100)}%`;
    this.element.querySelector('#sfx-volume').value = audio.sfxVolume * 100;
    this.element.querySelector('#sfx-volume-value').textContent = `${Math.round(audio.sfxVolume * 100)}%`;

    // Graphics
    this.element.querySelector('#quality-select').value = graphics.quality;
    this.element.querySelector('#bloom-toggle').checked = graphics.bloomEnabled;
    this.element.querySelector('#particles-toggle').checked = graphics.particlesEnabled;
    this.element.querySelector('#shadows-toggle').checked = graphics.shadowsEnabled;

    // Accessibility
    this.element.querySelector('#reduce-motion').checked = accessibility.reduceMotion;
    this.element.querySelector('#text-size').value = accessibility.textSize;
  }

  saveSettings() {
    // Persist to localStorage
    const state = useGameStore.getState();
    localStorage.setItem('messenger_settings', JSON.stringify(state.settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('messenger_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        const state = useGameStore.getState();
        if (settings.audio) state.updateSettings('audio', settings.audio);
        if (settings.graphics) state.updateSettings('graphics', settings.graphics);
        if (settings.accessibility) state.updateSettings('accessibility', settings.accessibility);
      } catch (e) {
        console.warn('[SettingsPanel] Failed to load saved settings:', e);
      }
    }
  }

  show() {
    this.isVisible = true;
    this.element.classList.remove('hidden');
    this.updateFromStore();
    // Pause game
    useGameStore.getState().setGameState('paused');
  }

  hide() {
    this.isVisible = false;
    this.element.classList.add('hidden');
    // Resume game
    useGameStore.getState().setGameState('playing');
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  dispose() {
    this.unsubscribers.forEach(unsub => unsub());
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
