/**
 * TutorialOverlay.js - First-Time Player Tutorial
 * Shows a brief interactive tutorial explaining the game mechanics
 */

import { useGameStore } from '../stores/gameStore.js';

export class TutorialOverlay {
  constructor() {
    this.element = null;
    this.currentStep = 0;
    this.hasSeenTutorial = false;

    this.steps = [
      {
        title: 'Welcome, Mail Carrier!',
        description: 'Your job is to deliver mail around this tiny planet. Let\'s learn the basics!',
        icon: '📮',
      },
      {
        title: 'Movement',
        description: 'Use WASD or Arrow Keys to walk around. Hold SHIFT to run faster.',
        icon: '🏃',
        keys: ['W', 'A', 'S', 'D', 'SHIFT'],
      },
      {
        title: 'Collect Mail',
        description: 'Walk up to a mailbox and press E to collect mail.',
        icon: '📬',
        keys: ['E'],
      },
      {
        title: 'Deliver Mail',
        description: 'Find the NPC the mail is addressed to and press E to deliver it. You\'ll earn coins!',
        icon: '💰',
        keys: ['E'],
      },
      {
        title: 'Quests & More',
        description: 'Press Q to see your quests. Talk to NPCs to get new delivery missions!',
        icon: '📋',
        keys: ['Q'],
      },
      {
        title: 'Ready to Start!',
        description: 'That\'s all you need to know. Good luck with your deliveries!',
        icon: '✨',
      },
    ];
  }

  init() {
    // Check if player has seen tutorial before
    this.hasSeenTutorial = localStorage.getItem('messenger_tutorial_seen') === 'true';
  }

  /**
   * Show the tutorial overlay
   */
  show() {
    if (this.element) return;

    this.currentStep = 0;
    this.createElement();
    this.updateStep();
  }

  /**
   * Check if should show tutorial (first time player)
   */
  shouldShow() {
    return !this.hasSeenTutorial;
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.id = 'tutorial-overlay';
    this.element.className = 'tutorial-overlay';
    this.element.innerHTML = `
      <div class="tutorial-content">
        <div class="tutorial-icon" id="tutorial-icon"></div>
        <h2 class="tutorial-title" id="tutorial-title"></h2>
        <p class="tutorial-description" id="tutorial-description"></p>
        <div class="tutorial-keys" id="tutorial-keys"></div>
        <div class="tutorial-progress">
          <div class="tutorial-dots" id="tutorial-dots"></div>
        </div>
        <div class="tutorial-buttons">
          <button class="tutorial-btn tutorial-btn-skip" id="tutorial-skip">Skip</button>
          <button class="tutorial-btn tutorial-btn-next" id="tutorial-next">Next</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.element);

    // Bind events
    this.element.querySelector('#tutorial-skip').addEventListener('click', () => this.complete());
    this.element.querySelector('#tutorial-next').addEventListener('click', () => this.nextStep());

    // Create progress dots
    const dotsContainer = this.element.querySelector('#tutorial-dots');
    this.steps.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'tutorial-dot' + (i === 0 ? ' active' : '');
      dotsContainer.appendChild(dot);
    });
  }

  updateStep() {
    const step = this.steps[this.currentStep];
    if (!step || !this.element) return;

    // Update content
    this.element.querySelector('#tutorial-icon').textContent = step.icon;
    this.element.querySelector('#tutorial-title').textContent = step.title;
    this.element.querySelector('#tutorial-description').textContent = step.description;

    // Update keys display
    const keysContainer = this.element.querySelector('#tutorial-keys');
    if (step.keys && step.keys.length > 0) {
      keysContainer.innerHTML = step.keys.map(key =>
        `<span class="tutorial-key">${key}</span>`
      ).join('');
      keysContainer.style.display = 'flex';
    } else {
      keysContainer.style.display = 'none';
    }

    // Update progress dots
    const dots = this.element.querySelectorAll('.tutorial-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentStep);
    });

    // Update button text on last step
    const nextBtn = this.element.querySelector('#tutorial-next');
    if (this.currentStep === this.steps.length - 1) {
      nextBtn.textContent = 'Start Playing!';
    } else {
      nextBtn.textContent = 'Next';
    }
  }

  nextStep() {
    this.currentStep++;
    if (this.currentStep >= this.steps.length) {
      this.complete();
    } else {
      this.updateStep();
    }
  }

  complete() {
    // Mark tutorial as seen
    localStorage.setItem('messenger_tutorial_seen', 'true');
    this.hasSeenTutorial = true;

    // Remove overlay
    if (this.element) {
      this.element.classList.add('hiding');
      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
      }, 300);
    }

    // Show welcome notification
    useGameStore.getState().showNotification('success', 'Welcome! Find a mailbox to start delivering!');
  }

  dispose() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
