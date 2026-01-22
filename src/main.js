/**
 * Messenger Clone - Main Entry Point
 * Mail delivery game on a tiny planet inspired by messenger.abeto.co
 * Initializes the 3D world and handles the application lifecycle
 */

import * as THREE from 'three';
import { World } from './World.js';
import { InputManager } from './InputManager.js';
import { useGameStore } from './stores/gameStore.js';

class App {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.loadingScreen = document.getElementById('loading-screen');
    this.loadingBar = document.getElementById('loading-bar');
    this.loadingText = document.getElementById('loading-text');
    this.hud = document.getElementById('hud');

    this.world = null;
    this.inputManager = null;
    this.isRunning = false;
  }

  async init() {
    try {
      // Initialize input manager first
      this.inputManager = new InputManager();

      // Initialize the 3D world
      this.world = new World(this.canvas, this.inputManager);

      // Set up loading progress callback
      this.world.onLoadProgress = (progress, message) => {
        this.updateLoadingProgress(progress, message);
      };

      // Initialize the world (loads assets, sets up scene)
      await this.world.init();

      // Hide loading screen and show HUD
      this.hideLoadingScreen();

      // Start the render loop
      this.start();

      // Set up window resize handler
      window.addEventListener('resize', () => this.onResize());

      console.log('Messenger clone initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.showError(error.message);
    }
  }

  updateLoadingProgress(progress, message) {
    if (this.loadingBar) {
      this.loadingBar.style.width = `${progress * 100}%`;
    }
    if (this.loadingText && message) {
      this.loadingText.textContent = message;
    }
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden');
    }
    if (this.hud) {
      this.hud.classList.remove('hidden');
    }
    useGameStore.getState().setLoaded(true);
  }

  showError(message) {
    if (this.loadingText) {
      this.loadingText.textContent = `Error: ${message}`;
      this.loadingText.style.color = '#ff6b6b';
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.animate());

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap delta to prevent huge jumps
    this.lastTime = currentTime;

    // Update the world
    if (this.world) {
      this.world.update(deltaTime);
    }
  }

  onResize() {
    if (this.world) {
      this.world.onResize();
    }
  }

  dispose() {
    this.stop();
    if (this.world) {
      this.world.dispose();
    }
    if (this.inputManager) {
      this.inputManager.dispose();
    }
  }
}

// Initialize the application when DOM is ready
const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Export for debugging
window.app = app;
