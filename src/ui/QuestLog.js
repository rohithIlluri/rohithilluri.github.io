/**
 * QuestLog.js - Quest Log UI Component
 * Full-screen quest log overlay showing active and completed quests
 * Toggle with Q key
 */

import { useGameStore } from '../stores/gameStore.js';
import { questManager } from '../systems/QuestManager.js';

export class QuestLog {
  constructor() {
    this.container = null;
    this.questList = null;
    this.questDetails = null;
    this.selectedQuestId = null;
    this.isVisible = false;

    // Bind methods
    this.toggle = this.toggle.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleQuestClick = this.handleQuestClick.bind(this);

    // Create UI
    this.createUI();

    // Subscribe to store changes
    this.unsubscribe = useGameStore.subscribe((state) => {
      if (this.isVisible) {
        this.render();
      }
    });
  }

  /**
   * Create the quest log UI elements
   */
  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'quest-log';
    this.container.className = 'quest-log hidden';
    this.container.innerHTML = `
      <div class="quest-log-overlay"></div>
      <div class="quest-log-content">
        <div class="quest-log-header">
          <h2 class="quest-log-title">Quest Log</h2>
          <button class="quest-log-close" aria-label="Close quest log">&times;</button>
        </div>
        <div class="quest-log-body">
          <div class="quest-log-sidebar">
            <div class="quest-log-tabs">
              <button class="quest-tab active" data-tab="active">Active</button>
              <button class="quest-tab" data-tab="available">Available</button>
              <button class="quest-tab" data-tab="completed">Completed</button>
            </div>
            <div class="quest-list" id="quest-list"></div>
          </div>
          <div class="quest-details" id="quest-details">
            <div class="quest-details-empty">
              Select a quest to view details
            </div>
          </div>
        </div>
        <div class="quest-log-footer">
          <span class="quest-hint">Press Q to close</span>
        </div>
      </div>
    `;

    // Get references
    this.questList = this.container.querySelector('#quest-list');
    this.questDetails = this.container.querySelector('#quest-details');

    // Event listeners
    this.container.querySelector('.quest-log-close').addEventListener('click', () => this.hide());
    this.container.querySelector('.quest-log-overlay').addEventListener('click', () => this.hide());

    // Tab switching
    this.container.querySelectorAll('.quest-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.container.querySelectorAll('.quest-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.render();
      });
    });

    // Add to DOM
    document.body.appendChild(this.container);

    // Keyboard listener
    window.addEventListener('keydown', this.handleKeydown);
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event
   */
  handleKeydown(event) {
    if (event.code === 'KeyQ' && event.target.tagName !== 'INPUT') {
      event.preventDefault();
      this.toggle();
    }
    if (event.code === 'Escape' && this.isVisible) {
      event.preventDefault();
      this.hide();
    }
  }

  /**
   * Toggle quest log visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show the quest log
   */
  show() {
    this.isVisible = true;
    this.container.classList.remove('hidden');
    this.render();
    useGameStore.setState({ ui: { ...useGameStore.getState().ui, showQuestLog: true } });
  }

  /**
   * Hide the quest log
   */
  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
    useGameStore.setState({ ui: { ...useGameStore.getState().ui, showQuestLog: false } });
  }

  /**
   * Get the currently active tab
   * @returns {string} 'active', 'available', or 'completed'
   */
  getActiveTab() {
    const activeTab = this.container.querySelector('.quest-tab.active');
    return activeTab ? activeTab.dataset.tab : 'active';
  }

  /**
   * Render the quest log
   */
  render() {
    const tab = this.getActiveTab();
    const summary = questManager.getQuestLogSummary();

    // Clear the list
    this.questList.innerHTML = '';

    let quests = [];
    if (tab === 'active') {
      quests = summary.active;
    } else if (tab === 'available') {
      quests = summary.available;
    } else if (tab === 'completed') {
      // Completed quests - get quest data for each ID
      quests = useGameStore.getState().quests.completed.map(id => {
        const quest = questManager.getQuest(id);
        return quest ? { ...quest, id, isCompleted: true } : null;
      }).filter(Boolean);
    }

    if (quests.length === 0) {
      this.questList.innerHTML = `
        <div class="quest-list-empty">
          No ${tab} quests
        </div>
      `;
      return;
    }

    // Render quest items
    quests.forEach(quest => {
      const item = document.createElement('div');
      item.className = 'quest-item' + (quest.id === this.selectedQuestId ? ' selected' : '');
      item.dataset.questId = quest.id;

      const progress = quest.progress || { percent: 0 };
      const isTracked = quest.isTracked || false;

      item.innerHTML = `
        <div class="quest-item-header">
          <span class="quest-item-title">${quest.title}</span>
          ${isTracked ? '<span class="quest-tracked-badge">TRACKING</span>' : ''}
        </div>
        ${tab === 'active' ? `
        <div class="quest-item-progress">
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${progress.percent}%"></div>
          </div>
          <span class="quest-progress-text">${progress.completed || 0}/${progress.total || 1}</span>
        </div>
        ` : ''}
      `;

      item.addEventListener('click', () => this.handleQuestClick(quest.id));
      this.questList.appendChild(item);
    });

    // If a quest is selected, update details
    if (this.selectedQuestId) {
      this.renderQuestDetails(this.selectedQuestId);
    }
  }

  /**
   * Handle quest item click
   * @param {string} questId
   */
  handleQuestClick(questId) {
    this.selectedQuestId = questId;

    // Update selection highlighting
    this.questList.querySelectorAll('.quest-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.questId === questId);
    });

    this.renderQuestDetails(questId);
  }

  /**
   * Render quest details panel
   * @param {string} questId
   */
  renderQuestDetails(questId) {
    const state = useGameStore.getState();
    const tab = this.getActiveTab();

    let quest = null;
    let isActive = false;
    let isCompleted = false;

    // Find quest in appropriate list
    if (tab === 'active') {
      quest = state.quests.active.find(q => q.id === questId);
      isActive = true;
    } else if (tab === 'available') {
      quest = state.quests.available.find(q => q.id === questId);
    } else if (tab === 'completed') {
      quest = questManager.getQuest(questId);
      isCompleted = true;
    }

    if (!quest) {
      this.questDetails.innerHTML = `
        <div class="quest-details-empty">
          Select a quest to view details
        </div>
      `;
      return;
    }

    const isTracked = state.currentQuest?.id === questId;
    const progress = questManager.getQuestProgress(questId);

    this.questDetails.innerHTML = `
      <div class="quest-details-header">
        <h3 class="quest-details-title">${quest.title}</h3>
        ${quest.priority === 'urgent' ? '<span class="quest-urgent-badge">URGENT</span>' : ''}
      </div>
      <p class="quest-details-description">${quest.description}</p>

      ${quest.objectives && quest.objectives.length > 0 ? `
      <div class="quest-objectives">
        <h4 class="quest-section-title">Objectives</h4>
        <ul class="quest-objective-list">
          ${quest.objectives.map((obj, i) => {
            const complete = obj.complete || isCompleted;
            const objProgress = obj.progress || (complete ? (obj.count || 1) : 0);
            const objCount = obj.count || 1;
            return `
              <li class="quest-objective ${complete ? 'complete' : ''}">
                <span class="quest-objective-check">${complete ? '&check;' : '&circle;'}</span>
                <span class="quest-objective-text">${obj.description}</span>
                ${objCount > 1 ? `<span class="quest-objective-count">${objProgress}/${objCount}</span>` : ''}
              </li>
            `;
          }).join('')}
        </ul>
      </div>
      ` : ''}

      <div class="quest-rewards">
        <h4 class="quest-section-title">Rewards</h4>
        <div class="quest-reward-list">
          ${quest.rewards?.coins ? `
          <div class="quest-reward">
            <span class="quest-reward-icon coin-icon"></span>
            <span class="quest-reward-value">${quest.rewards.coins} Coins</span>
          </div>
          ` : ''}
          ${quest.rewards?.reputation ? `
          <div class="quest-reward">
            <span class="quest-reward-icon rep-icon"></span>
            <span class="quest-reward-value">${quest.rewards.reputation} Reputation</span>
          </div>
          ` : ''}
        </div>
      </div>

      ${isActive && !isCompleted ? `
      <div class="quest-actions">
        <button class="quest-action-btn ${isTracked ? 'tracking' : ''}" id="track-quest-btn">
          ${isTracked ? 'Tracking' : 'Track Quest'}
        </button>
      </div>
      ` : ''}
    `;

    // Add track button listener
    const trackBtn = this.questDetails.querySelector('#track-quest-btn');
    if (trackBtn) {
      trackBtn.addEventListener('click', () => {
        if (isTracked) {
          questManager.setTrackedQuest(null);
        } else {
          questManager.setTrackedQuest(questId);
        }
        this.render();
      });
    }
  }

  /**
   * Dispose of the quest log
   */
  dispose() {
    window.removeEventListener('keydown', this.handleKeydown);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default QuestLog;
