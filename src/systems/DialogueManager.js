/**
 * DialogueManager.js - NPC Dialogue and Conversation System
 * Manages dialogue trees, player responses, and conversation effects
 */

import { useGameStore } from '../stores/gameStore.js';
import { questManager } from './QuestManager.js';
import { inventoryManager } from './InventoryManager.js';
import dialoguesData from '../data/dialogues.json';
import questsData from '../data/quests.json';

class DialogueManager {
  constructor() {
    this.npcDialogues = new Map();
    this.currentConversation = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize the dialogue system
   */
  init() {
    this.loadDialogues();
    console.log('[DialogueManager] Initialized with', this.npcDialogues.size, 'NPC dialogues');
  }

  /**
   * Load dialogues from data file
   */
  loadDialogues() {
    for (const [npcId, npcData] of Object.entries(dialoguesData.npcs)) {
      this.npcDialogues.set(npcId, npcData);
    }
  }

  /**
   * Get NPC dialogue data
   * @param {string} npcId
   * @returns {Object|null}
   */
  getNPCDialogue(npcId) {
    return this.npcDialogues.get(npcId) || null;
  }

  /**
   * Get dialogue node
   * @param {string} npcId
   * @param {string} nodeId
   * @returns {Object|null}
   */
  getNode(npcId, nodeId) {
    const npc = this.npcDialogues.get(npcId);
    if (!npc || !npc.nodes) return null;
    return npc.nodes[nodeId] || null;
  }

  /**
   * Start conversation with NPC
   * @param {Object} npc NPC object { id, name, ... }
   * @returns {Object} First dialogue node
   */
  startConversation(npc) {
    const npcDialogue = this.getNPCDialogue(npc.id);
    if (!npcDialogue) {
      console.warn('[DialogueManager] No dialogue for NPC:', npc.id);
      return null;
    }

    // Determine starting node based on context
    let startNode = npcDialogue.defaultNode;

    // Check if we've talked before (use return node)
    const stats = useGameStore.getState().stats;
    if (stats.npcsTalkedTo.has(npc.id) && npcDialogue.nodes[`${npc.id.replace('npc_', '')}_return`]) {
      startNode = `${npc.id.replace('npc_', '')}_return`;
    }

    // Check for delivery opportunity
    const mailForNPC = inventoryManager.getMailFor(npc.id);
    if (mailForNPC && npcDialogue.nodes[`${npc.id.replace('npc_', '')}_delivery`]) {
      startNode = `${npc.id.replace('npc_', '')}_delivery`;
    }

    this.currentConversation = {
      npc,
      npcData: npcDialogue,
      currentNodeId: startNode,
    };

    // Update game state
    useGameStore.getState().startDialogue(npc, startNode);

    // Check talk objectives
    questManager.checkObjective('talk', npc.id);

    this.emit('conversationStarted', { npc, node: this.getCurrentNode() });

    return this.getCurrentNode();
  }

  /**
   * Get current dialogue node
   * @returns {Object|null}
   */
  getCurrentNode() {
    if (!this.currentConversation) return null;

    const { npcData, currentNodeId } = this.currentConversation;
    const node = npcData.nodes[currentNodeId];

    if (!node) return null;

    return {
      ...node,
      speaker: npcData.name,
      portrait: npcData.portrait,
      nodeId: currentNodeId,
    };
  }

  /**
   * Get available responses for current node
   * @returns {Array}
   */
  getResponses() {
    const node = this.getCurrentNode();
    if (!node || !node.responses) return [];

    // Filter responses based on conditions (if any)
    return node.responses.filter(response => {
      if (response.condition) {
        return this.evaluateCondition(response.condition);
      }
      return true;
    });
  }

  /**
   * Select a response
   * @param {number} responseIndex
   * @returns {Object|null} Next node or null if conversation ends
   */
  selectResponse(responseIndex) {
    const responses = this.getResponses();
    if (responseIndex < 0 || responseIndex >= responses.length) {
      console.warn('[DialogueManager] Invalid response index');
      return null;
    }

    const response = responses[responseIndex];

    // Execute effect if any
    if (response.effect) {
      this.executeEffect(response.effect);
    }

    // Advance to next node or end conversation
    if (response.next) {
      this.currentConversation.currentNodeId = response.next;
      useGameStore.getState().advanceDialogue(response.next);

      const nextNode = this.getCurrentNode();
      this.emit('nodeChanged', nextNode);
      return nextNode;
    } else {
      // End conversation
      this.endConversation();
      return null;
    }
  }

  /**
   * Execute dialogue effect
   * @param {string} effectString Format: "action:param1:param2"
   */
  executeEffect(effectString) {
    const [action, ...params] = effectString.split(':');

    switch (action) {
      case 'accept_quest':
        questManager.acceptQuest(params[0]);
        break;

      case 'complete_objective':
        questManager.completeObjective(params[0], parseInt(params[1]));
        break;

      case 'give_mail':
        const mailItem = questsData.mailItems.find(m => m.id === params[0]);
        if (mailItem) {
          inventoryManager.collectMail(mailItem);
        }
        break;

      case 'give_coins':
        inventoryManager.addCoins(parseInt(params[0]));
        break;

      case 'unlock_zone':
        useGameStore.getState().markZoneVisited(params[0]);
        break;

      default:
        console.warn('[DialogueManager] Unknown effect:', action);
    }

    this.emit('effectExecuted', { action, params });
  }

  /**
   * Evaluate a condition
   * @param {string} conditionString
   * @returns {boolean}
   */
  evaluateCondition(conditionString) {
    const [type, ...params] = conditionString.split(':');

    switch (type) {
      case 'has_mail':
        return inventoryManager.hasMail(params[0]);

      case 'has_quest':
        return questManager.isQuestActive(params[0]);

      case 'quest_complete':
        return questManager.isQuestComplete(params[0]);

      case 'has_coins':
        return inventoryManager.getCoins() >= parseInt(params[0]);

      default:
        return true;
    }
  }

  /**
   * End current conversation
   */
  endConversation() {
    if (!this.currentConversation) return;

    this.emit('conversationEnded', { npc: this.currentConversation.npc });

    this.currentConversation = null;
    useGameStore.getState().endDialogue();
  }

  /**
   * Check if in conversation
   * @returns {boolean}
   */
  isInConversation() {
    return this.currentConversation !== null;
  }

  /**
   * Get conversation state for UI
   * @returns {Object}
   */
  getConversationState() {
    if (!this.currentConversation) {
      return { active: false };
    }

    const node = this.getCurrentNode();
    const responses = this.getResponses();

    return {
      active: true,
      speaker: node?.speaker || 'Unknown',
      portrait: node?.portrait || 'default',
      text: node?.text || '',
      responses: responses.map((r, i) => ({
        index: i,
        text: r.text,
        hasEffect: !!r.effect,
      })),
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
    this.endConversation();
    this.eventListeners.clear();
    console.log('[DialogueManager] Disposed');
  }
}

// Singleton instance
export const dialogueManager = new DialogueManager();
export default DialogueManager;
