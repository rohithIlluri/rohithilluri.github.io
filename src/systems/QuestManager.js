/**
 * QuestManager.js - Quest Tracking and Progression System
 * Manages quest acceptance, objectives, completion, and rewards
 */

import { useGameStore } from '../stores/gameStore.js';
import { mailSystem } from './MailSystem.js';
import questsData from '../data/quests.json';
import { QUESTS, getQuestsForNPC } from '../data/quests.js';

class QuestManager {
  constructor() {
    this.questDatabase = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Initialize the quest system
   */
  init() {
    // Load quests from data files
    this.loadQuests();

    // Set up initial available quests
    this.updateAvailableQuests();

    console.log('[QuestManager] Initialized with', this.questDatabase.size, 'quests');
  }

  /**
   * Load quests from data files (supports both JSON and JS module)
   */
  loadQuests() {
    // Load from JSON file
    if (questsData && questsData.quests) {
      for (const quest of questsData.quests) {
        this.questDatabase.set(quest.id, quest);
      }
    }

    // Merge with JS module quests (adds npcId field)
    for (const quest of QUESTS) {
      if (!this.questDatabase.has(quest.id)) {
        this.questDatabase.set(quest.id, quest);
      } else {
        // Merge npcId from JS module into existing quest
        const existingQuest = this.questDatabase.get(quest.id);
        existingQuest.npcId = quest.npcId;
      }
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
   * Detect circular prerequisites in quest chain
   * @param {string} questId - Starting quest ID
   * @param {Set} visited - Already visited quest IDs
   * @returns {boolean} True if cycle detected
   */
  hasPrerequisiteCycle(questId, visited = new Set()) {
    if (visited.has(questId)) {
      console.warn('[QuestManager] Circular prerequisite detected:', Array.from(visited).join(' -> '), '->', questId);
      return true;
    }

    const quest = this.getQuest(questId);
    if (!quest || !quest.prerequisite) return false;

    visited.add(questId);
    return this.hasPrerequisiteCycle(quest.prerequisite, visited);
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

    const state = useGameStore.getState();

    // Prevent re-accepting completed quests
    if (state.quests.completed.includes(questId)) {
      console.warn('[QuestManager] Quest already completed:', questId);
      state.showNotification('info', 'Quest already completed!');
      return false;
    }

    // Prevent accepting already active quests
    if (state.quests.active.some(q => q.id === questId)) {
      console.warn('[QuestManager] Quest already active:', questId);
      return false;
    }

    // Check prerequisite is met
    if (quest.prerequisite && !state.quests.completed.includes(quest.prerequisite)) {
      console.warn('[QuestManager] Prerequisite not met:', quest.prerequisite);
      state.showNotification('error', 'Complete the prerequisite quest first!');
      return false;
    }

    // Check for circular prerequisites (safety check)
    if (this.hasPrerequisiteCycle(questId)) {
      console.error('[QuestManager] Quest has circular prerequisites:', questId);
      return false;
    }

    // Clone quest with fresh objectives
    const activeQuest = {
      ...quest,
      objectives: quest.objectives.map(o => ({ ...o, complete: false, progress: 0 })),
      acceptedAt: Date.now(),
    };

    state.acceptQuest(activeQuest);

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
   * @param {string} [npcId] - Optional NPC ID to filter quests from this NPC
   * @returns {Array}
   */
  getAvailableQuests(npcId = null) {
    const available = useGameStore.getState().quests.available;

    if (npcId) {
      // Filter to quests from this specific NPC
      return available.filter(q => q.npcId === npcId);
    }

    return available;
  }

  /**
   * Get all quests that can be given by a specific NPC
   * @param {string} npcId
   * @returns {Array} Available quests from this NPC
   */
  getQuestsFromNPC(npcId) {
    const state = useGameStore.getState();
    const completed = state.quests.completed;
    const active = state.quests.active.map(q => q.id);
    const available = [];

    for (const [id, quest] of this.questDatabase) {
      // Skip if not from this NPC
      if (quest.npcId !== npcId) continue;

      // Skip if already completed or active
      if (completed.includes(id) || active.includes(id)) continue;

      // Check prerequisite
      if (quest.prerequisite && !completed.includes(quest.prerequisite)) continue;

      available.push(quest);
    }

    return available;
  }

  /**
   * Check if NPC has available quests
   * @param {string} npcId
   * @returns {boolean}
   */
  hasQuestsForNPC(npcId) {
    return this.getQuestsFromNPC(npcId).length > 0;
  }

  /**
   * Check if NPC has deliverable mail quest objective
   * @param {string} npcId
   * @returns {Object|null} Active quest with deliver objective for this NPC
   */
  hasDeliveryForNPC(npcId) {
    const state = useGameStore.getState();

    for (const quest of state.quests.active) {
      for (const obj of quest.objectives) {
        if (obj.type === 'deliver' && obj.target === npcId && !obj.complete) {
          return quest;
        }
      }
    }

    return null;
  }

  /**
   * Update quest progress by type and target
   * @param {string} questId - Quest ID
   * @param {string} objectiveType - 'talk', 'deliver', 'collect'
   * @param {string} targetId - Target NPC or item ID
   * @param {number} [progressAmount=1] - Amount of progress to add
   * @returns {boolean} True if progress was made
   */
  updateProgress(questId, objectiveType, targetId, progressAmount = 1) {
    const state = useGameStore.getState();
    const quest = state.quests.active.find(q => q.id === questId);

    if (!quest) return false;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (obj.type === objectiveType && obj.target === targetId && !obj.complete) {
        // Initialize progress tracking if needed
        if (typeof obj.progress === 'undefined') {
          obj.progress = 0;
        }

        obj.progress += progressAmount;

        // Check if objective is complete
        if (obj.progress >= (obj.count || 1)) {
          this.completeObjective(questId, i);
        }

        return true;
      }
    }

    return false;
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
