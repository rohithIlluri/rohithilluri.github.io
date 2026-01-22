/**
 * QuestManager.js - Quest Tracking and Progression System
 * Manages quest acceptance, objectives, completion, and rewards
 */

import { useGameStore } from '../stores/gameStore.js';
import { mailSystem } from './MailSystem.js';
import questsData from '../data/quests.json';

class QuestManager {
  constructor() {
    this.questDatabase = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Initialize the quest system
   */
  init() {
    // Load quests from JSON
    this.loadQuests();

    // Set up initial available quests
    this.updateAvailableQuests();

    console.log('[QuestManager] Initialized with', this.questDatabase.size, 'quests');
  }

  /**
   * Load quests from data file
   */
  loadQuests() {
    for (const quest of questsData.quests) {
      this.questDatabase.set(quest.id, quest);
    }
  }

  /**
   * Get quest by ID
   * @param {string} questId
   * @returns {Object|null}
   */
  getQuest(questId) {
    return this.questDatabase.get(questId) || null;
  }

  /**
   * Update which quests are available based on completion
   */
  updateAvailableQuests() {
    const state = useGameStore.getState();
    const completed = state.quests.completed;
    const active = state.quests.active.map(q => q.id);
    const available = [];

    for (const [id, quest] of this.questDatabase) {
      // Skip if already completed or active
      if (completed.includes(id) || active.includes(id)) continue;

      // Check prerequisite
      if (quest.prerequisite && !completed.includes(quest.prerequisite)) continue;

      // Quest is available
      available.push(quest);
    }

    useGameStore.setState({
      quests: {
        ...state.quests,
        available,
      },
    });
  }

  /**
   * Accept a quest
   * @param {string} questId
   * @returns {boolean} Success
   */
  acceptQuest(questId) {
    const quest = this.getQuest(questId);
    if (!quest) {
      console.warn('[QuestManager] Quest not found:', questId);
      return false;
    }

    // Clone quest with fresh objectives
    const activeQuest = {
      ...quest,
      objectives: quest.objectives.map(o => ({ ...o, complete: false })),
      acceptedAt: Date.now(),
    };

    useGameStore.getState().acceptQuest(activeQuest);

    // Spawn any required mail items
    for (const objective of quest.objectives) {
      if (objective.type === 'collect' && objective.target.startsWith('mail_')) {
        mailSystem.spawnMailForQuest(objective.target);
      }
    }

    this.updateAvailableQuests();
    this.emit('questAccepted', activeQuest);

    return true;
  }

  /**
   * Complete a quest objective
   * @param {string} questId
   * @param {number} objectiveIndex
   */
  completeObjective(questId, objectiveIndex) {
    useGameStore.getState().updateQuestObjective(questId, objectiveIndex, true);
    this.updateAvailableQuests();
    this.emit('objectiveComplete', { questId, objectiveIndex });
  }

  /**
   * Complete a quest objective by target
   * @param {string} questId
   * @param {string} targetId
   */
  completeObjectiveByTarget(questId, targetId) {
    const state = useGameStore.getState();
    const quest = state.quests.active.find(q => q.id === questId);
    if (!quest) return;

    const objIndex = quest.objectives.findIndex(o => o.target === targetId && !o.complete);
    if (objIndex !== -1) {
      this.completeObjective(questId, objIndex);
    }
  }

  /**
   * Check if player has completed specific objective type for target
   * @param {string} type 'talk', 'collect', 'deliver'
   * @param {string} targetId
   */
  checkObjective(type, targetId) {
    const state = useGameStore.getState();

    for (const quest of state.quests.active) {
      for (let i = 0; i < quest.objectives.length; i++) {
        const obj = quest.objectives[i];
        if (obj.type === type && obj.target === targetId && !obj.complete) {
          this.completeObjective(quest.id, i);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Get active quests
   * @returns {Array}
   */
  getActiveQuests() {
    return useGameStore.getState().quests.active;
  }

  /**
   * Get completed quest IDs
   * @returns {Array}
   */
  getCompletedQuests() {
    return useGameStore.getState().quests.completed;
  }

  /**
   * Get available quests
   * @returns {Array}
   */
  getAvailableQuests() {
    return useGameStore.getState().quests.available;
  }

  /**
   * Get starter quests (for new game)
   * @returns {Array}
   */
  getStarterQuests() {
    return Array.from(this.questDatabase.values()).filter(q => q.isStarter);
  }

  /**
   * Check if quest is complete
   * @param {string} questId
   * @returns {boolean}
   */
  isQuestComplete(questId) {
    return useGameStore.getState().quests.completed.includes(questId);
  }

  /**
   * Check if quest is active
   * @param {string} questId
   * @returns {boolean}
   */
  isQuestActive(questId) {
    return useGameStore.getState().quests.active.some(q => q.id === questId);
  }

  /**
   * Get tracked/current quest
   * @returns {Object|null}
   */
  getTrackedQuest() {
    return useGameStore.getState().currentQuest;
  }

  /**
   * Set tracked quest
   * @param {string} questId
   */
  setTrackedQuest(questId) {
    const quest = useGameStore.getState().quests.active.find(q => q.id === questId);
    useGameStore.getState().setCurrentQuest(quest || null);
  }

  /**
   * Get quest progress summary
   * @param {string} questId
   * @returns {Object}
   */
  getQuestProgress(questId) {
    const state = useGameStore.getState();
    const quest = state.quests.active.find(q => q.id === questId);

    if (!quest) {
      return { total: 0, completed: 0, percent: 0 };
    }

    const total = quest.objectives.length;
    const completed = quest.objectives.filter(o => o.complete).length;

    return {
      total,
      completed,
      percent: Math.round((completed / total) * 100),
    };
  }

  /**
   * Get all quests summary for quest log
   * @returns {Object}
   */
  getQuestLogSummary() {
    const state = useGameStore.getState();

    return {
      active: state.quests.active.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        progress: this.getQuestProgress(q.id),
        objectives: q.objectives,
        isTracked: state.currentQuest?.id === q.id,
      })),
      available: state.quests.available.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
      })),
      completedCount: state.quests.completed.length,
    };
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(cb => cb(data));
    }
  }

  /**
   * Dispose
   */
  dispose() {
    this.eventListeners.clear();
    console.log('[QuestManager] Disposed');
  }
}

// Singleton instance
export const questManager = new QuestManager();
export default QuestManager;
