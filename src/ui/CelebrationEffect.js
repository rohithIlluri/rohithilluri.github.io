/**
 * CelebrationEffect.js - Visual Celebration Animations
 * Shows confetti/particle effects for achievements like mail delivery and quest completion
 */

export class CelebrationEffect {
  constructor() {
    this.container = null;
    this.isAnimating = false;
  }

  init() {
    // Create container for celebration particles
    this.container = document.createElement('div');
    this.container.id = 'celebration-container';
    this.container.className = 'celebration-container';
    document.body.appendChild(this.container);
  }

  /**
   * Trigger a celebration effect
   * @param {string} type - 'mail' for delivery, 'quest' for quest completion, 'coins' for coin reward
   */
  celebrate(type = 'mail') {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const config = this.getConfig(type);
    this.createParticles(config);

    // Reset after animation completes
    setTimeout(() => {
      this.isAnimating = false;
      this.clearParticles();
    }, config.duration);
  }

  /**
   * Get celebration config based on type
   */
  getConfig(type) {
    const configs = {
      mail: {
        particleCount: 30,
        colors: ['#FFD54F', '#FF8A65', '#81C784', '#64B5F6'],
        shapes: ['envelope', 'star', 'circle'],
        duration: 2000,
        spread: 120,
      },
      quest: {
        particleCount: 50,
        colors: ['#FFD700', '#FFC107', '#FFEB3B', '#FF9800', '#E91E63'],
        shapes: ['star', 'diamond', 'circle'],
        duration: 2500,
        spread: 180,
      },
      coins: {
        particleCount: 25,
        colors: ['#FFD700', '#FFC107', '#DAA520', '#F4C430'],
        shapes: ['coin', 'circle'],
        duration: 1800,
        spread: 100,
      },
    };

    return configs[type] || configs.mail;
  }

  /**
   * Create celebration particles
   */
  createParticles(config) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < config.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';

      // Random properties
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];
      const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)];
      const size = 8 + Math.random() * 16;
      const angle = (Math.random() * Math.PI * 2);
      const velocity = 2 + Math.random() * 4;
      const spread = config.spread;

      // Starting position (center of screen)
      const startX = centerX;
      const startY = centerY;

      // End position (radial spread)
      const endX = startX + Math.cos(angle) * spread * velocity;
      const endY = startY + Math.sin(angle) * spread * velocity - 100; // Arc upward

      // Style the particle
      particle.style.setProperty('--start-x', `${startX}px`);
      particle.style.setProperty('--start-y', `${startY}px`);
      particle.style.setProperty('--end-x', `${endX}px`);
      particle.style.setProperty('--end-y', `${endY + 200}px`); // Fall down at end
      particle.style.setProperty('--color', color);
      particle.style.setProperty('--size', `${size}px`);
      particle.style.setProperty('--rotation', `${Math.random() * 720 - 360}deg`);
      particle.style.setProperty('--delay', `${Math.random() * 0.2}s`);
      particle.style.setProperty('--duration', `${config.duration / 1000}s`);

      // Add shape-specific content
      particle.innerHTML = this.getShapeContent(shape, color);
      particle.setAttribute('data-shape', shape);

      this.container.appendChild(particle);

      // Trigger animation
      requestAnimationFrame(() => {
        particle.classList.add('animating');
      });
    }
  }

  /**
   * Get shape content (SVG or emoji)
   */
  getShapeContent(shape, color) {
    switch (shape) {
      case 'envelope':
        return `<svg viewBox="0 0 24 24" fill="${color}"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7" stroke="rgba(0,0,0,0.2)" stroke-width="2" fill="none"/></svg>`;
      case 'star':
        return `<svg viewBox="0 0 24 24" fill="${color}"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      case 'diamond':
        return `<svg viewBox="0 0 24 24" fill="${color}"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>`;
      case 'coin':
        return `<svg viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="rgba(0,0,0,0.3)" font-size="12" font-weight="bold">$</text></svg>`;
      case 'circle':
      default:
        return `<svg viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="12" r="10"/></svg>`;
    }
  }

  /**
   * Clear all particles
   */
  clearParticles() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Quick celebration for mail delivery
   */
  mailDelivered() {
    this.celebrate('mail');
  }

  /**
   * Big celebration for quest completion
   */
  questCompleted() {
    this.celebrate('quest');
  }

  /**
   * Coin reward celebration
   */
  coinsEarned() {
    this.celebrate('coins');
  }

  dispose() {
    this.clearParticles();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.container = null;
  }
}
