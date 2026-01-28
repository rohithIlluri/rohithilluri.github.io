/**
 * QuestTracker.js - Mini Quest Tracker HUD Widget
 * Shows the currently tracked quest with progress indicator
 * Positioned in top-left under existing HUD elements
 */

import { useGameStore } from '../stores/gameStore.js';
import { questManager } from '../systems/QuestManager.js';

export class QuestTracker {
  constructor() {
    this.container = null;
    this.isVisible = true;
    this.lastQuestId = null;
    this.lastObjectiveState = null;

    // Bind methods
    this.update = this.update.bind(this);

    // Create UI
    this.createUI();

    // Subscribe to store changes
    this.unsubscribe = useGameStore.subscribe(() => {
      this.update();
    });

    // Initial render
    this.update();
  }

  /**
   * Initialize the quest tracker (called by UIManager for consistency)
   */
  init() {
    // Ensure initial update
    this.update();
  }

  /**
   * Create the quest tracker UI elements
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'quest-tracker';
    this.container.className = 'quest-tracker';
    this.container.innerHTML = `
      <div class="quest-tracker-content">
        <div class="quest-tracker-header">
          <span class="quest-tracker-icon"></span>
          <span class="quest-tracker-title">No Quest Tracked</span>
        </div>
        <div class="quest-tracker-body">
          <div class="quest-tracker-objective"></div>
          <div class="quest-tracker-progress">
            <div class="quest-tracker-progress-bar">
              <div class="quest-tracker-progress-fill"></div>
            </div>
            <span class="quest-tracker-progress-text">0/0</span>
          </div>
        </div>
      </div>
    `;

    // Click to open quest log
    this.container.addEventListener('click', () => {
      const state = useGameStore.getState();
      useGameStore.setState({
        ui: {
          ...state.ui,
          showQuestLog: !state.ui.showQuestLog
        }
      });
    });

    // Add to UI overlay (or body if overlay not ready)
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) {
      uiOverlay.appendChild(this.container);
    } else {
      // Fallback to body if overlay not ready
      document.body.appendChild(this.container);
    }
  }

  /**
   * Update the tracker display
   */
  update() {
    const state = useGameStore.getState();
    const currentQuest = state.currentQuest;

    // Hide if no quest is tracked or game is not playing
    if (!currentQuest || state.gameState !== 'playing') {
      this.container.classList.add('hidden');
      return;
    }

    this.container.classList.remove('hidden');

    // Get fresh quest data from active quests
    const activeQuest = state.quests.active.find(q => q.id === currentQuest.id);
    if (!activeQuest) {
      this.container.classList.add('hidden');
      return;
    }

    // Get progress
    const progress = questManager.getQuestProgress(activeQuest.id);

    // Find current (first incomplete) objective
    const currentObjective = activeQuest.objectives.find(obj => !obj.complete);
    const objectiveText = currentObjective ? currentObjective.description : 'All objectives complete!';

    // Update title
    const titleEl = this.container.querySelector('.quest-tracker-title');
    titleEl.textContent = activeQuest.title;

    // Update objective
    const objectiveEl = this.container.querySelector('.quest-tracker-objective');
    objectiveEl.textContent = objectiveText;

    // Update progress bar
    const progressFill = this.container.querySelector('.quest-tracker-progress-fill');
    progressFill.style.width = `${progress.percent}%`;

    // Update progress text
    const progressText = this.container.querySelector('.quest-tracker-progress-text');
    progressText.textContent = `${progress.completed}/${progress.total}`;

    // Add urgent class if needed
    if (activeQuest.priority === 'urgent') {
      this.container.classList.add('urgent');
    } else {
      this.container.classList.remove('urgent');
    }

    // Animate on objective completion
    if (this.lastQuestId === activeQuest.id) {
      const newObjectiveState = JSON.stringify(activeQuest.objectives.map(o => o.complete));
      if (this.lastObjectiveState && newObjectiveState !== this.lastObjectiveState) {
        this.playCompletionAnimation();
      }
      this.lastObjectiveState = newObjectiveState;
    } else {
      this.lastQuestId = activeQuest.id;
      this.lastObjectiveState = JSON.stringify(activeQuest.objectives.map(o => o.complete));
    }
  }

  /**
   * Play animation when objective is completed
   */
  playCompletionAnimation() {
    this.container.classList.add('objective-complete');
    setTimeout(() => {
      this.container.classList.remove('objective-complete');
    }, 600);
  }

  /**
   * Show the tracker
   */
  show() {
    this.isVisible = true;
    this.update();
  }

  /**
   * Hide the tracker
   */
  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
  }

  /**
   * Dispose of the tracker
   */
  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default QuestTracker;
