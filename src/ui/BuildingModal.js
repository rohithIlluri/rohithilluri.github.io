/**
 * BuildingModal.js - Portfolio Section Overlay
 * Styled modal overlays for building interactions
 * Per spec: #1A1A2E 90% opacity, blur backdrop, smooth transitions
 */

import { useGameStore } from '../stores/gameStore.js';

// Modal styles per visual quality spec
const MODAL_STYLES = {
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '500',
    opacity: '0',
    visibility: 'hidden',
    transition: 'opacity 0.5s ease, visibility 0.5s ease',
  },
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: '16px',
    padding: '0',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    transform: 'scale(0.9) translateY(20px)',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    border: '1px solid rgba(255, 213, 79, 0.2)',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 213, 79, 0.1)',
  },
  title: {
    margin: '0',
    color: '#FFD54F',
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  closeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  body: {
    padding: '32px',
    color: '#FFFFFF',
    fontSize: '16px',
    lineHeight: '1.7',
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 100px)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  footer: {
    padding: '20px 32px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#FFD54F',
    color: '#1A1A2E',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
};

// Building-specific content templates
const BUILDING_TEMPLATES = {
  skills: {
    icon: '&#128187;',
    accentColor: '#4FC3F7',
  },
  projects: {
    icon: '&#127959;',
    accentColor: '#FF1493',
  },
  music: {
    icon: '&#127926;',
    accentColor: '#00FF7F',
  },
  contact: {
    icon: '&#9749;',
    accentColor: '#FF6B35',
  },
};

/**
 * BuildingModal Class
 */
export class BuildingModal {
  constructor() {
    this.overlay = null;
    this.container = null;
    this.isOpen = false;
    this.currentBuilding = null;
    this.onCloseCallback = null;

    this.init();
  }

  init() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'building-modal-overlay';
    this.applyStyles(this.overlay, MODAL_STYLES.overlay);

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'building-modal';
    this.applyStyles(this.container, MODAL_STYLES.container);

    // Create header
    const header = document.createElement('div');
    header.id = 'modal-header';
    this.applyStyles(header, MODAL_STYLES.header);

    const title = document.createElement('h2');
    title.id = 'modal-title';
    this.applyStyles(title, MODAL_STYLES.title);

    const closeButton = document.createElement('button');
    closeButton.id = 'modal-close';
    this.applyStyles(closeButton, MODAL_STYLES.closeButton);
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.close());
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
      closeButton.style.transform = 'scale(1.1)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      closeButton.style.transform = 'scale(1)';
    });

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create body
    const body = document.createElement('div');
    body.id = 'modal-body';
    this.applyStyles(body, MODAL_STYLES.body);

    // Assemble
    this.container.appendChild(header);
    this.container.appendChild(body);
    this.overlay.appendChild(this.container);

    // Add to document
    document.body.appendChild(this.overlay);

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Add custom CSS
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #building-modal-overlay.open {
        opacity: 1;
        visibility: visible;
      }

      #building-modal-overlay.open #building-modal {
        transform: scale(1) translateY(0);
      }

      #modal-body h3 {
        color: #FFD54F;
        margin: 0 0 16px 0;
        font-size: 20px;
        font-weight: 600;
      }

      #modal-body h4 {
        color: rgba(255, 255, 255, 0.9);
        margin: 24px 0 12px 0;
        font-size: 16px;
        font-weight: 600;
      }

      #modal-body p {
        margin: 0 0 16px 0;
        color: rgba(255, 255, 255, 0.8);
      }

      #modal-body ul {
        margin: 0 0 16px 0;
        padding-left: 24px;
      }

      #modal-body li {
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.8);
      }

      #modal-body li strong {
        color: #FFD54F;
      }

      #modal-body a {
        color: #4FC3F7;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      #modal-body a:hover {
        color: #81D4FA;
        text-decoration: underline;
      }

      #modal-body .skill-tag {
        display: inline-block;
        padding: 4px 12px;
        margin: 4px;
        background-color: rgba(255, 213, 79, 0.2);
        color: #FFD54F;
        border-radius: 16px;
        font-size: 14px;
      }

      #modal-body .project-card {
        padding: 20px;
        margin-bottom: 16px;
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease;
      }

      #modal-body .project-card:hover {
        background-color: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 213, 79, 0.3);
      }

      #modal-body .project-card h4 {
        margin-top: 0;
      }

      /* Custom scrollbar */
      #modal-body::-webkit-scrollbar {
        width: 8px;
      }

      #modal-body::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
      }

      #modal-body::-webkit-scrollbar-thumb {
        background: rgba(255, 213, 79, 0.3);
        border-radius: 4px;
      }

      #modal-body::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 213, 79, 0.5);
      }
    `;
    document.head.appendChild(style);
  }

  applyStyles(element, styles) {
    Object.assign(element.style, styles);
  }

  /**
   * Open modal with building data
   * @param {Object} building Building data from store
   * @param {Function} onClose Callback when modal closes
   */
  open(building, onClose = null) {
    if (!building) return;

    this.currentBuilding = building;
    this.onCloseCallback = onClose;

    // Update header
    const template = BUILDING_TEMPLATES[building.id] || {};
    const title = this.container.querySelector('#modal-title');
    const header = this.container.querySelector('#modal-header');

    title.innerHTML = `${template.icon || ''} ${building.name}`;

    // Apply accent color
    if (template.accentColor) {
      header.style.backgroundColor = `rgba(${this.hexToRgb(template.accentColor)}, 0.1)`;
      title.style.color = template.accentColor;
    }

    // Update body content
    const body = this.container.querySelector('#modal-body');
    body.innerHTML = building.content || '<p>Loading content...</p>';

    // Show modal
    this.overlay.classList.add('open');
    this.isOpen = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Update store
    useGameStore.getState().openModal();
  }

  /**
   * Close modal
   */
  close() {
    if (!this.isOpen) return;

    this.overlay.classList.remove('open');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Callback
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = null;
    }

    // Update store
    useGameStore.getState().closeModal();

    this.currentBuilding = null;
  }

  /**
   * Update modal content
   * @param {string} content HTML content
   */
  setContent(content) {
    const body = this.container.querySelector('#modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * Set loading state
   * @param {boolean} loading Whether to show loading
   */
  setLoading(loading) {
    const body = this.container.querySelector('#modal-body');
    if (body) {
      if (loading) {
        body.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <div style="
              width: 40px;
              height: 40px;
              margin: 0 auto 16px;
              border: 3px solid rgba(255, 213, 79, 0.3);
              border-top-color: #FFD54F;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            "></div>
            <p style="color: rgba(255, 255, 255, 0.6);">Loading...</p>
          </div>
        `;
      }
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '255, 255, 255';
  }

  /**
   * Check if modal is open
   * @returns {boolean}
   */
  isModalOpen() {
    return this.isOpen;
  }

  dispose() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    document.body.style.overflow = '';
  }
}

// Singleton instance
let modalInstance = null;

export function getBuildingModal() {
  if (!modalInstance) {
    modalInstance = new BuildingModal();
  }
  return modalInstance;
}

export default BuildingModal;
