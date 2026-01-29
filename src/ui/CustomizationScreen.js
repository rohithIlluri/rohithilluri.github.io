/**
 * CustomizationScreen.js - Character Customization UI
 * Allows players to customize hair, skin, clothes colors before gameplay
 * Shows during gameState='customization', reopenable with C key
 */

import { useGameStore, DEFAULT_APPEARANCE } from '../stores/gameStore.js';

// Preset color palettes for each category
const COLOR_PRESETS = {
  hairColor: [
    { name: 'Black', value: 0x2A2A2A },
    { name: 'Brown', value: 0x5C3A1E },
    { name: 'Auburn', value: 0x8B4513 },
    { name: 'Blonde', value: 0xD4A037 },
    { name: 'Red', value: 0xA0362B },
    { name: 'Pink', value: 0xD87093 },
    { name: 'Blue', value: 0x4682B4 },
    { name: 'White', value: 0xE8E8E8 },
  ],
  skinTone: [
    { name: 'Light', value: 0xFFE0C0 },
    { name: 'Peach', value: 0xF5E1D0 },
    { name: 'Tan', value: 0xD4A574 },
    { name: 'Medium', value: 0xC08050 },
    { name: 'Brown', value: 0x8B5E3C },
    { name: 'Dark', value: 0x6B4226 },
  ],
  shirtColor: [
    { name: 'Black', value: 0x2A2A2A },
    { name: 'White', value: 0xF5F5F5 },
    { name: 'Navy', value: 0x1A2A4A },
    { name: 'Red', value: 0xC85A5A },
    { name: 'Teal', value: 0x5ABBB8 },
    { name: 'Green', value: 0x6B9B5A },
    { name: 'Purple', value: 0x7B5EA7 },
    { name: 'Yellow', value: 0xE8B84A },
  ],
  skirtColor: [
    { name: 'Maroon', value: 0xB84A5A },
    { name: 'Navy', value: 0x1A2A4A },
    { name: 'Black', value: 0x2A2A2A },
    { name: 'Khaki', value: 0xC8B890 },
    { name: 'Teal', value: 0x5ABBB8 },
    { name: 'Gray', value: 0x8A8A8A },
    { name: 'Plum', value: 0x7B4A6B },
    { name: 'Olive', value: 0x6B7B4A },
  ],
  shoesColor: [
    { name: 'Yellow', value: 0xE8B84A },
    { name: 'White', value: 0xF5F5F5 },
    { name: 'Black', value: 0x2A2A2A },
    { name: 'Red', value: 0xC85A5A },
    { name: 'Blue', value: 0x4682B4 },
    { name: 'Green', value: 0x6B9B5A },
  ],
  bagColor: [
    { name: 'Yellow', value: 0xE8B84A },
    { name: 'Brown', value: 0x8B5E3C },
    { name: 'Black', value: 0x2A2A2A },
    { name: 'Red', value: 0xC85A5A },
    { name: 'Teal', value: 0x5ABBB8 },
    { name: 'Green', value: 0x6B9B5A },
  ],
};

const CATEGORIES = [
  { key: 'hairColor', label: 'Hair' },
  { key: 'skinTone', label: 'Skin' },
  { key: 'shirtColor', label: 'Shirt' },
  { key: 'skirtColor', label: 'Bottoms' },
  { key: 'shoesColor', label: 'Shoes' },
  { key: 'bagColor', label: 'Bag' },
];

export class CustomizationScreen {
  constructor() {
    this.element = null;
    this.isVisible = false;
    this.selectedCategory = 0;
    this.currentAppearance = { ...DEFAULT_APPEARANCE };
    this.onComplete = null;
  }

  init() {
    this.createElement();
    this.addKeyboardListeners();
  }

  createElement() {
    // Remove existing element if present
    const existing = document.getElementById('customization-screen');
    if (existing) existing.remove();

    this.element = document.createElement('div');
    this.element.id = 'customization-screen';
    this.element.className = 'customization-screen hidden';
    this.element.innerHTML = this.buildHTML();
    document.body.appendChild(this.element);

    // Add event listeners
    this.bindEvents();
  }

  buildHTML() {
    return `
      <div class="customization-overlay"></div>
      <div class="customization-panel">
        <div class="customization-header">
          <h2 class="customization-title">Customize Character</h2>
          <p class="customization-subtitle">Choose your look before heading out</p>
        </div>
        <div class="customization-body">
          <div class="customization-categories">
            ${CATEGORIES.map((cat, i) => `
              <button class="customization-cat-btn ${i === 0 ? 'active' : ''}" data-category="${i}">
                ${cat.label}
              </button>
            `).join('')}
          </div>
          <div class="customization-swatches" id="customization-swatches">
            ${this.buildSwatches(0)}
          </div>
        </div>
        <div class="customization-footer">
          <button class="customization-btn customization-reset-btn" id="customization-reset">Reset</button>
          <button class="customization-btn customization-start-btn" id="customization-start">Start Game</button>
        </div>
        <div class="customization-hint">
          <span class="customization-hint-key">C</span> to reopen during gameplay
        </div>
      </div>
    `;
  }

  buildSwatches(categoryIndex) {
    const cat = CATEGORIES[categoryIndex];
    const presets = COLOR_PRESETS[cat.key];
    const currentValue = this.currentAppearance[cat.key];

    return presets.map((preset) => {
      const cssColor = '#' + preset.value.toString(16).padStart(6, '0');
      const isSelected = preset.value === currentValue;
      return `
        <button class="customization-swatch ${isSelected ? 'selected' : ''}"
                data-key="${cat.key}"
                data-value="${preset.value}"
                style="background-color: ${cssColor}"
                title="${preset.name}">
          ${isSelected ? '<span class="swatch-check">&#10003;</span>' : ''}
        </button>
      `;
    }).join('');
  }

  bindEvents() {
    // Category buttons
    this.element.querySelectorAll('.customization-cat-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.category, 10);
        this.selectCategory(index);
      });
    });

    // Swatch clicks (use event delegation)
    const swatchContainer = this.element.querySelector('#customization-swatches');
    swatchContainer.addEventListener('click', (e) => {
      const swatch = e.target.closest('.customization-swatch');
      if (!swatch) return;
      const key = swatch.dataset.key;
      const value = parseInt(swatch.dataset.value, 10);
      this.selectColor(key, value);
    });

    // Reset button
    this.element.querySelector('#customization-reset').addEventListener('click', () => {
      this.resetAppearance();
    });

    // Start button
    this.element.querySelector('#customization-start').addEventListener('click', () => {
      this.complete();
    });

    // Overlay click to close (only if reopened during gameplay)
    this.element.querySelector('.customization-overlay').addEventListener('click', () => {
      const state = useGameStore.getState().gameState;
      if (state === 'customization') return; // Don't close during initial customization
      this.hide();
    });
  }

  selectCategory(index) {
    this.selectedCategory = index;

    // Update active button
    this.element.querySelectorAll('.customization-cat-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // Update swatches
    const swatchContainer = this.element.querySelector('#customization-swatches');
    swatchContainer.innerHTML = this.buildSwatches(index);
  }

  selectColor(key, value) {
    this.currentAppearance[key] = value;

    // Apply to store immediately for live preview
    useGameStore.getState().setPlayerAppearance({ [key]: value });

    // Refresh swatches to show selection
    const swatchContainer = this.element.querySelector('#customization-swatches');
    swatchContainer.innerHTML = this.buildSwatches(this.selectedCategory);
  }

  resetAppearance() {
    this.currentAppearance = { ...DEFAULT_APPEARANCE };
    useGameStore.getState().resetAppearance();

    // Refresh swatches
    const swatchContainer = this.element.querySelector('#customization-swatches');
    swatchContainer.innerHTML = this.buildSwatches(this.selectedCategory);
  }

  complete() {
    // Apply final appearance
    useGameStore.getState().setPlayerAppearance(this.currentAppearance);

    // Transition to playing
    useGameStore.getState().startGame();
    this.hide();

    if (this.onComplete) {
      this.onComplete(this.currentAppearance);
    }
  }

  show() {
    if (!this.element) return;

    // Load current appearance from store
    this.currentAppearance = { ...useGameStore.getState().playerAppearance };
    this.selectedCategory = 0;

    // Rebuild swatches with current state
    this.selectCategory(0);

    // Determine context (initial vs reopened)
    const state = useGameStore.getState().gameState;
    const isInitial = state === 'customization';

    // Update button text based on context
    const startBtn = this.element.querySelector('#customization-start');
    startBtn.textContent = isInitial ? 'Start Game' : 'Apply';

    this.element.classList.remove('hidden');
    this.isVisible = true;
  }

  hide() {
    if (!this.element) return;
    this.element.classList.add('hidden');
    this.isVisible = false;
  }

  addKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyC' && !e.repeat) {
        // Ignore if typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        const state = useGameStore.getState().gameState;
        if (state === 'playing') {
          if (this.isVisible) {
            this.hide();
          } else {
            this.show();
          }
        }
      }

      // ESC to close
      if (e.code === 'Escape' && this.isVisible) {
        const state = useGameStore.getState().gameState;
        if (state !== 'customization') {
          this.hide();
        }
      }
    });
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
