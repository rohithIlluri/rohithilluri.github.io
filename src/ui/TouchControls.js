/**
 * TouchControls.js - Mobile Touch Input System
 * Virtual joystick for movement + action buttons for interaction
 * Camera look area for camera rotation on mobile
 * Auto-detects touch devices and shows controls accordingly
 */

export class TouchControls {
  constructor(inputManager, cameraController = null) {
    this.inputManager = inputManager;
    this.cameraController = cameraController; // Optional camera reference for rotation
    this.element = null;
    this.isTouch = false;
    this.isVisible = false;

    // Joystick state
    this.joystickActive = false;
    this.joystickOrigin = { x: 0, y: 0 };
    this.joystickPosition = { x: 0, y: 0 };
    this.joystickRadius = 50;
    this.thumbEl = null;

    // Touch ID tracking
    this.joystickTouchId = null;
    this.lookTouchId = null;

    // Camera look state
    this.lookActive = false;
    this.lookOrigin = { x: 0, y: 0 };
    this.lookSensitivity = 0.003;

    // Camera rotation values (emitted to camera)
    this.cameraRotation = { x: 0, y: 0 };
  }

  /**
   * Set camera controller for direct rotation
   */
  setCameraController(camera) {
    this.cameraController = camera;
  }

  init() {
    this.isTouch = this.detectTouch();
    if (!this.isTouch) return;

    this.createElement();
    this.bindEvents();
    this.show();
  }

  detectTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  createElement() {
    const existing = document.getElementById('touch-controls');
    if (existing) existing.remove();

    this.element = document.createElement('div');
    this.element.id = 'touch-controls';
    this.element.className = 'touch-controls';
    this.element.innerHTML = `
      <div class="touch-joystick-area" id="touch-joystick-area">
        <div class="touch-joystick-base">
          <div class="touch-joystick-thumb" id="touch-joystick-thumb"></div>
        </div>
      </div>
      <div class="touch-look-area" id="touch-look-area">
        <div class="touch-look-hint">Swipe to look</div>
      </div>
      <div class="touch-action-buttons">
        <button class="touch-btn touch-btn-interact" id="touch-btn-interact">E</button>
        <button class="touch-btn touch-btn-run" id="touch-btn-run">RUN</button>
      </div>
    `;
    document.body.appendChild(this.element);

    this.thumbEl = this.element.querySelector('#touch-joystick-thumb');
    this.lookAreaEl = this.element.querySelector('#touch-look-area');
  }

  bindEvents() {
    const joystickArea = this.element.querySelector('#touch-joystick-area');
    const lookArea = this.element.querySelector('#touch-look-area');
    const interactBtn = this.element.querySelector('#touch-btn-interact');
    const runBtn = this.element.querySelector('#touch-btn-run');

    // Joystick touch events
    joystickArea.addEventListener('touchstart', (e) => this.onJoystickStart(e), { passive: false });
    joystickArea.addEventListener('touchmove', (e) => this.onJoystickMove(e), { passive: false });
    joystickArea.addEventListener('touchend', (e) => this.onJoystickEnd(e), { passive: false });
    joystickArea.addEventListener('touchcancel', (e) => this.onJoystickEnd(e), { passive: false });

    // Camera look area events
    lookArea.addEventListener('touchstart', (e) => this.onLookStart(e), { passive: false });
    lookArea.addEventListener('touchmove', (e) => this.onLookMove(e), { passive: false });
    lookArea.addEventListener('touchend', (e) => this.onLookEnd(e), { passive: false });
    lookArea.addEventListener('touchcancel', (e) => this.onLookEnd(e), { passive: false });

    // Interact button
    interactBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      interactBtn.classList.add('active');
      this.inputManager.keys.interact = true;
      this.inputManager.emit('interact');
    }, { passive: false });

    interactBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      interactBtn.classList.remove('active');
      this.inputManager.keys.interact = false;
    }, { passive: false });

    // Run button (toggle)
    let isRunning = false;
    runBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isRunning = !isRunning;
      runBtn.classList.toggle('active', isRunning);
      this.inputManager.keys.run = isRunning;
    }, { passive: false });
  }

  // ==========================================
  // Camera Look Touch Handlers
  // ==========================================

  onLookStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.lookTouchId = touch.identifier;
    this.lookActive = true;
    this.lookOrigin.x = touch.clientX;
    this.lookOrigin.y = touch.clientY;

    // Hide hint on first use
    const hint = this.element.querySelector('.touch-look-hint');
    if (hint) hint.style.opacity = '0';
  }

  onLookMove(e) {
    e.preventDefault();
    if (!this.lookActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.lookTouchId) {
        const deltaX = touch.clientX - this.lookOrigin.x;
        const deltaY = touch.clientY - this.lookOrigin.y;

        // Emit camera rotation event via input manager
        this.inputManager.emit('cameraRotate', {
          deltaX: deltaX * this.lookSensitivity,
          deltaY: deltaY * this.lookSensitivity,
        });

        // Update origin for continuous rotation
        this.lookOrigin.x = touch.clientX;
        this.lookOrigin.y = touch.clientY;
        break;
      }
    }
  }

  onLookEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.lookTouchId) {
        this.lookActive = false;
        this.lookTouchId = null;
        break;
      }
    }
  }

  onJoystickStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.joystickTouchId = touch.identifier;
    this.joystickActive = true;

    const rect = e.currentTarget.getBoundingClientRect();
    this.joystickOrigin.x = rect.left + rect.width / 2;
    this.joystickOrigin.y = rect.top + rect.height / 2;

    this.updateJoystick(touch.clientX, touch.clientY);
    this.thumbEl.classList.add('active');
  }

  onJoystickMove(e) {
    e.preventDefault();
    if (!this.joystickActive) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.joystickTouchId) {
        this.updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  }

  onJoystickEnd(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.joystickTouchId) {
        this.joystickActive = false;
        this.joystickTouchId = null;
        this.resetJoystick();
        this.thumbEl.classList.remove('active');
        break;
      }
    }
  }

  updateJoystick(clientX, clientY) {
    let dx = clientX - this.joystickOrigin.x;
    let dy = clientY - this.joystickOrigin.y;

    // Clamp to radius
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.joystickRadius) {
      dx = (dx / dist) * this.joystickRadius;
      dy = (dy / dist) * this.joystickRadius;
    }

    // Normalize to -1..1
    const normX = dx / this.joystickRadius;
    const normY = dy / this.joystickRadius;

    // Apply deadzone
    const deadzone = 0.15;
    const magnitude = Math.sqrt(normX * normX + normY * normY);

    if (magnitude > deadzone) {
      // Map to input manager keys
      this.inputManager.keys.forward = normY < -deadzone;
      this.inputManager.keys.backward = normY > deadzone;
      this.inputManager.keys.left = normX < -deadzone;
      this.inputManager.keys.right = normX > deadzone;
    } else {
      this.inputManager.keys.forward = false;
      this.inputManager.keys.backward = false;
      this.inputManager.keys.left = false;
      this.inputManager.keys.right = false;
    }

    // Update thumb visual
    if (this.thumbEl) {
      this.thumbEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
  }

  resetJoystick() {
    // Clear all movement
    this.inputManager.keys.forward = false;
    this.inputManager.keys.backward = false;
    this.inputManager.keys.left = false;
    this.inputManager.keys.right = false;

    // Reset thumb visual
    if (this.thumbEl) {
      this.thumbEl.style.transform = 'translate(-50%, -50%)';
    }
  }

  show() {
    if (this.element) {
      this.element.style.display = 'block';
      this.isVisible = true;
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isVisible = false;
    }
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
