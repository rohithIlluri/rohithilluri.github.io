/**
 * DialogueManager.js - NPC Dialogue and Conversation System
 * Manages dialogue trees, player choices, and conversation effects
 */

import { useGameStore } from '../stores/gameStore.js';
import { getDialogueTree, getDialogueNode, getQuest, getMailItem, DIALOGUE_TREES } from '../data/dialogues.js';
import { DialogueBox } from '../ui/DialogueBox.js';

class DialogueManager {
  constructor() {
    this.npcDialogues = new Map();
    this.currentConversation = null;
    this.eventListeners = new Map();
    this.dialogueBox = null;
  }

  /**
   * Initialize the dialogue system
   */
  init() {
    this.loadDialogues();
    this.initUI();
    console.log('[DialogueManager] Initialized with', this.npcDialogues.size, 'NPC dialogues');
  }

  /**
   * Initialize the dialogue UI
   */
  initUI() {
    this.dialogueBox = new DialogueBox();

    // Listen for choice selections
    this.dialogueBox.on('choiceSelected', (choice) => {
      this.handleChoice(choice);
    });

    // Listen for dialogue close (ESC or click outside)
    this.dialogueBox.on('close', () => {
      this.endConversation();
    });
  }

  /**
   * Load dialogues from dialogues.js
   */
  loadDialogues() {
    // Load from the DIALOGUE_TREES exported from dialogues.js
    for (const [npcId, dialogueTree] of Object.entries(DIALOGUE_TREES)) {
      this.npcDialogues.set(npcId, dialogueTree);
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
    const tree = this.npcDialogues.get(npcId);
    if (!tree || !tree.nodes) return null;
    return tree.nodes[nodeId] || null;
  }

  /**
   * Start conversation with NPC
   * @param {string} npcId NPC definition id
   * @param {Object} npcData Optional additional NPC data
   * @returns {Object} First dialogue node
   */
  startConversation(npcId, npcData = null) {
    const dialogueTree = this.getNPCDialogue(npcId);
    if (!dialogueTree) {
      console.warn('[DialogueManager] No dialogue for NPC:', npcId);
      return null;
    }

    // Get the starting node
    const startNodeId = dialogueTree.startNode;
    const startNode = dialogueTree.nodes[startNodeId];

    if (!startNode) {
      console.warn('[DialogueManager] No start node found for NPC:', npcId);
      return null;
    }

    this.currentConversation = {
      npcId,
      npcData,
      dialogueTree,
      currentNodeId: startNodeId,
    };

    // Update game state
    const npc = { id: npcId, ...npcData };
    useGameStore.getState().startDialogue(npc, startNodeId);

    // Show the dialogue UI
    this.showCurrentNode();

    this.emit('conversationStarted', { npcId, node: startNode });

    return this.getCurrentNode();
  }

  /**
   * Get current dialogue node
   * @returns {Object|null}
   */
  getCurrentNode() {
    if (!this.currentConversation) return null;

    const { dialogueTree, currentNodeId } = this.currentConversation;
    const node = dialogueTree.nodes[currentNodeId];

    if (!node) return null;

    return {
      ...node,
      nodeId: currentNodeId,
    };
  }

  /**
   * Show current dialogue node in UI
   */
  showCurrentNode() {
    const node = this.getCurrentNode();
    if (!node || !this.dialogueBox) return;

    this.dialogueBox.show({
      speaker: node.speaker,
      text: node.text,
      choices: node.choices || [],
    });
  }

  /**
   * Get available choices for current node
   * @returns {Array}
   */
  getChoices() {
    const node = this.getCurrentNode();
    if (!node || !node.choices) return [];
    return node.choices;
  }

  /**
   * Handle a player's choice selection
   * @param {Object} choice - The selected choice
   */
  handleChoice(choice) {
    if (!choice) return;

    // Process any action attached to this choice
    if (choice.action) {
      this.executeEffect(choice.action);
    }

    // If nextNode is null or action is endDialogue, end the conversation
    if (!choice.nextNode || choice.action === 'endDialogue') {
      this.endConversation();
      return;
    }

    // Advance to next node
    this.advanceToNode(choice.nextNode);
  }

  /**
   * Select a choice by index (legacy support)
   * @param {number} choiceIndex
   * @returns {Object|null} Next node or null if conversation ends
   */
  selectResponse(choiceIndex) {
    const choices = this.getChoices();
    if (choiceIndex < 0 || choiceIndex >= choices.length) {
      console.warn('[DialogueManager] Invalid choice index');
      return null;
    }

    const choice = choices[choiceIndex];
    this.handleChoice(choice);

    return this.getCurrentNode();
  }

  /**
   * Advance to a specific node
   * @param {string} nodeId
   */
  advanceToNode(nodeId) {
    if (!this.currentConversation) return;

    const { dialogueTree } = this.currentConversation;
    const nextNode = dialogueTree.nodes[nodeId];

    if (!nextNode) {
      console.warn('[DialogueManager] Node not found:', nodeId);
      this.endConversation();
      return;
    }

    this.currentConversation.currentNodeId = nodeId;
    useGameStore.getState().advanceDialogue(nodeId);

    // Show the new node in UI
    this.showCurrentNode();

    this.emit('nodeChanged', this.getCurrentNode());
  }

  /**
   * Execute dialogue effect/action
   * @param {string} effectString Format: "action:param" (e.g., "giveQuest:quest_id")
   */
  executeEffect(effectString) {
    if (!effectString) return;

    const [action, ...params] = effectString.split(':');
    const param = params.join(':'); // Rejoin in case param contains colons
    const store = useGameStore.getState();

    switch (action) {
      case 'giveQuest': {
        const quest = getQuest(param);
        if (quest) {
          store.acceptQuest({ ...quest });
          this.emit('questGiven', quest);
          console.log('[DialogueManager] Quest given:', quest.title);
        } else {
          console.warn('[DialogueManager] Quest not found:', param);
        }
        break;
      }

      case 'giveMail': {
        const mailItem = getMailItem(param);
        if (mailItem) {
          const success = store.addMail({ ...mailItem });
          if (success) {
            this.emit('mailGiven', mailItem);
            console.log('[DialogueManager] Mail given:', mailItem.id);
          }
        } else {
          console.warn('[DialogueManager] Mail item not found:', param);
        }
        break;
      }

      case 'endDialogue':
        // Will be handled by handleChoice
        break;

      case 'accept_quest':
        // Legacy format support
        const legacyQuest = getQuest(param);
        if (legacyQuest) {
          store.acceptQuest({ ...legacyQuest });
        }
        break;

      case 'give_coins':
        const amount = parseInt(param);
        if (!isNaN(amount)) {
          store.addCoins(amount);
        }
        break;

      case 'deliver_mail':
      case 'deliverMail': {
        // Deliver mail to current NPC or specified recipient
        // Param can be a specific mail ID or empty to auto-find mail for current NPC
        const recipientId = param || (this.currentConversation ? this.currentConversation.npcId : null);
        if (recipientId) {
          const mail = store.inventory.mail.find(m => m.to === recipientId);
          if (mail) {
            store.deliverMail(mail.id, recipientId);
            this.emit('mailDelivered', { mailId: mail.id, recipientId });
            console.log('[DialogueManager] Mail delivered to:', recipientId);
          }
        }
        break;
      }

      default:
        console.warn('[DialogueManager] Unknown action:', action);
    }

    this.emit('effectExecuted', { action, params });
  }

  /**
   * End current conversation
   */
  endConversation() {
    if (!this.currentConversation) return;

    const npcId = this.currentConversation.npcId;

    this.emit('conversationEnded', { npcId });

    this.currentConversation = null;
    useGameStore.getState().endDialogue();

    // Hide the UI
    if (this.dialogueBox) {
      this.dialogueBox.hide();
    }
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
    const choices = this.getChoices();

    return {
      active: true,
      speaker: node?.speaker || 'Unknown',
      text: node?.text || '',
      choices: choices.map((c, i) => ({
        index: i,
        text: c.text,
        nextNode: c.nextNode,
        action: c.action,
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
    if (this.dialogueBox) {
      this.dialogueBox.dispose();
      this.dialogueBox = null;
    }
    this.eventListeners.clear();
    console.log('[DialogueManager] Disposed');
  }
}

// Singleton instance
export const dialogueManager = new DialogueManager();
export default DialogueManager;
