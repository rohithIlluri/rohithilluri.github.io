/**
 * NotificationToast.js - Toast Notification System
 * Displays animated notifications for game events
 */

/**
 * NotificationToast - Toast notification component
 * Shows notifications that animate in from top-right and auto-dismiss
 */
export class NotificationToast {
  constructor(container) {
    this.container = container;
    this.toastContainer = null;
    this.activeToasts = [];
    this.maxToasts = 5; // Maximum visible toasts
  }

  /**
   * Initialize the toast system
   */
  init() {
    this.createContainer();
  }

  /**
   * Create the toast container element
   */
  createContainer() {
    this.toastContainer = document.createElement('div');
    this.toastContainer.className = 'ui-toast-container';
    this.container.appendChild(this.toastContainer);
  }

  /**
   * Show a toast notification
   * @param {string} type - Type: 'success', 'mail', 'quest', 'error'
   * @param {string} message - Notification message
   * @param {number} duration - Duration in milliseconds (default 3000)
   */
  show(type, message, duration = 3000) {
    if (!this.toastContainer) return;

    // Limit active toasts
    if (this.activeToasts.length >= this.maxToasts) {
      // Remove oldest toast
      this.removeToast(this.activeToasts[0]);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `ui-toast ${type}`;
    toast.innerHTML = `
      <span class="ui-toast-icon">${this.getIcon(type)}</span>
      <span class="ui-toast-message">${this.escapeHtml(message)}</span>
    `;

    // Add to container
    this.toastContainer.appendChild(toast);
    this.activeToasts.push(toast);

    // Trigger entrance animation (need to wait for DOM)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });
    });

    // Set up auto-dismiss
    const timeoutId = setTimeout(() => {
      this.removeToast(toast);
    }, duration);

    // Store timeout ID for cleanup
    toast.dataset.timeoutId = timeoutId;

    // Add click to dismiss
    toast.addEventListener('click', () => {
      clearTimeout(timeoutId);
      this.removeToast(toast);
    });

    return toast;
  }

  /**
   * Remove a toast with exit animation
   * @param {HTMLElement} toast - Toast element to remove
   */
  removeToast(toast) {
    if (!toast || !toast.parentNode) return;

    // Clear timeout if exists
    if (toast.dataset.timeoutId) {
      clearTimeout(parseInt(toast.dataset.timeoutId));
    }

    // Remove from active list
    const index = this.activeToasts.indexOf(toast);
    if (index > -1) {
      this.activeToasts.splice(index, 1);
    }

    // Animate out
    toast.classList.remove('visible');
    toast.classList.add('exiting');

    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  /**
   * Get icon SVG for notification type
   * @param {string} type - Notification type
   * @returns {string} SVG string
   */
  getIcon(type) {
    switch (type) {
      case 'success':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

      case 'mail':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" opacity="0.2"/>
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M3 7L12 13L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;

      case 'quest':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
          <path d="M12 7V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>`;

      case 'error':
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>`;

      default:
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
        </svg>`;
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clear all active toasts
   */
  clearAll() {
    // Copy array to avoid modification during iteration
    const toasts = [...this.activeToasts];
    toasts.forEach((toast) => this.removeToast(toast));
  }

  /**
   * Convenience methods for specific notification types
   */
  success(message, duration = 3000) {
    return this.show('success', message, duration);
  }

  mail(message, duration = 3000) {
    return this.show('mail', message, duration);
  }

  quest(message, duration = 4000) {
    return this.show('quest', message, duration);
  }

  error(message, duration = 4000) {
    return this.show('error', message, duration);
  }

  /**
   * Clean up the toast system
   */
  dispose() {
    // Clear all active toasts
    this.clearAll();

    // Clear any remaining timeouts
    this.activeToasts.forEach((toast) => {
      if (toast.dataset.timeoutId) {
        clearTimeout(parseInt(toast.dataset.timeoutId));
      }
    });
    this.activeToasts = [];

    // Remove container
    if (this.toastContainer && this.toastContainer.parentNode) {
      this.toastContainer.parentNode.removeChild(this.toastContainer);
    }
    this.toastContainer = null;
  }
}
