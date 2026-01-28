/**
 * UIManager.js - Central UI Controller
 * Manages all game UI components and subscribes to store updates
 */

import { useGameStore } from '../stores/gameStore.js';
import { HUD } from './HUD.js';
import { InteractionPrompt } from './InteractionPrompt.js';
import { NotificationToast } from './NotificationToast.js';
import { QuestLog } from './QuestLog.js';
import { QuestTracker } from './QuestTracker.js';
import { questManager } from '../systems/QuestManager.js';

/**
 * UIManager - Central controller for all game UI
 * Creates HTML overlay container and manages UI component lifecycle
 */
export class UIManager {
  constructor() {
    this.container = null;
    this.hud = null;
    this.interactionPrompt = null;
    this.notificationToast = null;
    this.questLog = null;
    this.questTracker = null;
    this.unsubscribers = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the UI system
   * Creates overlay container and all UI components
   */
  init() {
    if (this.isInitialized) {
      console.warn('UIManager already initialized');
      return;
    }

    // Create main UI overlay container
    this.createOverlayContainer();

    // Initialize quest system
    questManager.init();

    // Initialize UI components
    this.hud = new HUD(this.container);
    this.interactionPrompt = new InteractionPrompt(this.container);
    this.notificationToast = new NotificationToast(this.container);
    this.questLog = new QuestLog();
    this.questTracker = new QuestTracker();

    // Initialize all components
    this.hud.init();
    this.interactionPrompt.init();
    this.notificationToast.init();
    this.questLog.init();
    this.questTracker.init();

    // Subscribe to store for reactive updates
    this.subscribeToStore();

    this.isInitialized = true;
    console.log('UIManager initialized');
  }

  /**
   * Create the main UI overlay container
   */
  createOverlayContainer() {
    // Check if container already exists
    let existing = document.getElementById('ui-overlay');
    if (existing) {
      existing.remove();
    }

    // Create new container
    this.container = document.createElement('div');
    this.container.id = 'ui-overlay';
    document.body.appendChild(this.container);
  }

  /**
   * Subscribe to Zustand store for reactive updates
   */
  subscribeToStore() {
    const store = useGameStore;

    // Subscribe to inventory changes (coins, mail)
    let prevInventory = store.getState().inventory;
    const inventoryUnsub = store.subscribe((state) => {
      const inventory = state.inventory;
      if (inventory !== prevInventory) {
        this.hud.updateCoins(inventory.coins);
        this.hud.updateMail(inventory.mail.length, inventory.maxMail);
        prevInventory = inventory;
      }
    });
    this.unsubscribers.push(inventoryUnsub);

    // Subscribe to nearbyNPC changes
    let prevNearbyNPC = store.getState().nearbyNPC;
    const nearbyNPCUnsub = store.subscribe((state) => {
      const nearbyNPC = state.nearbyNPC;
      if (nearbyNPC !== prevNearbyNPC) {
        if (nearbyNPC) {
          this.interactionPrompt.show(nearbyNPC.name || 'NPC');
        } else if (!state.nearbyMailbox) {
          // Only hide if no mailbox nearby either
          this.interactionPrompt.hide();
        }
        prevNearbyNPC = nearbyNPC;
      }
    });
    this.unsubscribers.push(nearbyNPCUnsub);

    // Subscribe to nearbyMailbox changes
    let prevNearbyMailbox = store.getState().nearbyMailbox;
    const nearbyMailboxUnsub = store.subscribe((state) => {
      const nearbyMailbox = state.nearbyMailbox;
      if (nearbyMailbox !== prevNearbyMailbox) {
        if (nearbyMailbox && nearbyMailbox.hasNewMail) {
          this.interactionPrompt.show('Mailbox', 'Press to collect mail');
        } else if (nearbyMailbox && !nearbyMailbox.hasNewMail) {
          this.interactionPrompt.show('Mailbox', 'Empty');
        } else if (!state.nearbyNPC) {
          // Only hide if no NPC nearby either
          this.interactionPrompt.hide();
        }
        prevNearbyMailbox = nearbyMailbox;
      }
    });
    this.unsubscribers.push(nearbyMailboxUnsub);

    // Subscribe to notification changes
    let prevNotification = store.getState().ui.notification;
    const notificationUnsub = store.subscribe((state) => {
      const notification = state.ui.notification;
      if (notification !== prevNotification) {
        if (notification) {
          this.notificationToast.show(
            notification.type,
            notification.message,
            notification.duration
          );
        }
        prevNotification = notification;
      }
    });
    this.unsubscribers.push(notificationUnsub);

    // Subscribe to current quest changes
    let prevQuest = store.getState().currentQuest;
    const questUnsub = store.subscribe((state) => {
      const currentQuest = state.currentQuest;
      if (currentQuest !== prevQuest) {
        this.hud.updateQuest(currentQuest);
        prevQuest = currentQuest;
      }
    });
    this.unsubscribers.push(questUnsub);

    // Subscribe to HUD visibility
    let prevShowHUD = store.getState().ui.showHUD;
    const hudVisUnsub = store.subscribe((state) => {
      const showHUD = state.ui.showHUD;
      if (showHUD !== prevShowHUD) {
        this.setHUDVisibility(showHUD);
        prevShowHUD = showHUD;
      }
    });
    this.unsubscribers.push(hudVisUnsub);

    // Subscribe to quest log visibility
    let prevShowQuestLog = store.getState().ui.showQuestLog;
    const questLogUnsub = store.subscribe((state) => {
      const showQuestLog = state.ui.showQuestLog;
      if (showQuestLog !== prevShowQuestLog) {
        if (this.questLog) {
          if (showQuestLog) {
            this.questLog.show();
          } else {
            this.questLog.hide();
          }
        }
        prevShowQuestLog = showQuestLog;
      }
    });
    this.unsubscribers.push(questLogUnsub);

    // Subscribe to game state changes
    let prevGameState = store.getState().gameState;
    const gameStateUnsub = store.subscribe((state) => {
      const gameState = state.gameState;
      if (gameState !== prevGameState) {
        this.onGameStateChange(gameState, prevGameState);
        prevGameState = gameState;
      }
    });
    this.unsubscribers.push(gameStateUnsub);

    // Initial update with current state
    const state = store.getState();
    this.hud.updateCoins(state.inventory.coins);
    this.hud.updateMail(state.inventory.mail.length, state.inventory.maxMail);
    this.hud.updateQuest(state.currentQuest);
  }

  /**
   * Handle game state changes
   * @param {string} newState - New game state
   * @param {string} oldState - Previous game state
   */
  onGameStateChange(newState, oldState) {
    switch (newState) {
      case 'playing':
        this.show();
        break;
      case 'dialogue':
        // Keep HUD visible but hide interaction prompt
        this.interactionPrompt.hide();
        break;
      case 'paused':
      case 'menu':
      case 'customization':
        this.hide();
        break;
      default:
        break;
    }
  }

  /**
   * Set HUD visibility
   * @param {boolean} visible - Whether HUD should be visible
   */
  setHUDVisibility(visible) {
    if (this.hud) {
      if (visible) {
        this.hud.show();
      } else {
        this.hud.hide();
      }
    }
  }

  /**
   * Show all UI components
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
    if (this.hud) {
      this.hud.show();
    }
  }

  /**
   * Hide all UI components
   */
  hide() {
    if (this.hud) {
      this.hud.hide();
    }
    if (this.interactionPrompt) {
      this.interactionPrompt.hide();
    }
  }

  /**
   * Update method called each frame (for animations if needed)
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    // Currently no per-frame updates needed
    // Could be used for animated elements in the future
  }

  /**
   * Update compass/zone indicator
   * @param {string} zoneName - Current zone name
   */
  updateZone(zoneName) {
    if (this.hud) {
      this.hud.updateZone(zoneName);
    }
  }

  /**
   * Manually trigger a notification
   * @param {string} type - Notification type (success, mail, quest, error)
   * @param {string} message - Notification message
   * @param {number} duration - Duration in milliseconds
   */
  showNotification(type, message, duration = 3000) {
    if (this.notificationToast) {
      this.notificationToast.show(type, message, duration);
    }
  }

  /**
   * Clean up and remove all UI components
   */
  dispose() {
    // Unsubscribe from all store subscriptions
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];

    // Dispose components
    if (this.hud) {
      this.hud.dispose();
      this.hud = null;
    }
    if (this.interactionPrompt) {
      this.interactionPrompt.dispose();
      this.interactionPrompt = null;
    }
    if (this.notificationToast) {
      this.notificationToast.dispose();
      this.notificationToast = null;
    }
    if (this.questLog) {
      this.questLog.dispose();
      this.questLog = null;
    }
    if (this.questTracker) {
      this.questTracker.dispose();
      this.questTracker = null;
    }

    // Remove container
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }

    this.isInitialized = false;
    console.log('UIManager disposed');
  }
}
