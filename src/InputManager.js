/**
 * InputManager.js - Keyboard and Touch Input Handler
 * Manages all user input for player movement and interactions
 */

export class InputManager {
  constructor() {
    // Movement state
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      interact: false,
    };

    // Event listeners
    this.listeners = new Map();

    // Bind handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    // Set up event listeners
    this.init();
  }

  init() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(event) {
    // Ignore if typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.run = true;
        break;
      case 'KeyE':
        if (!event.repeat) {
          this.keys.interact = true;
          this.emit('interact');
        }
        break;
      case 'KeyN':
        if (!event.repeat) {
          this.emit('toggleDayNight');
        }
        break;
      case 'KeyQ':
        if (!event.repeat) {
          this.emit('toggleQuestLog');
        }
        break;
      case 'Escape':
        if (!event.repeat) {
          this.emit('escape');
        }
        break;
      case 'KeyM':
        if (!event.repeat) {
          this.emit('toggleMute');
        }
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.run = false;
        break;
      case 'KeyE':
        this.keys.interact = false;
        break;
    }
  }

  /**
   * Get the movement direction based on current input
   * @returns {{ x: number, z: number }} Normalized direction vector
   */
  getMovementDirection() {
    let x = 0;
    let z = 0;

    if (this.keys.forward) z -= 1;
    if (this.keys.backward) z += 1;
    if (this.keys.left) x -= 1;
    if (this.keys.right) x += 1;

    // Normalize diagonal movement
    const length = Math.sqrt(x * x + z * z);
    if (length > 0) {
      x /= length;
      z /= length;
    }

    return { x, z };
  }

  /**
   * Check if player is running
   * @returns {boolean}
   */
  isRunning() {
    return this.keys.run;
  }

  /**
   * Check if any movement key is pressed
   * @returns {boolean}
   */
  isMoving() {
    return this.keys.forward || this.keys.backward || this.keys.left || this.keys.right;
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

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.listeners.clear();
  }
}
