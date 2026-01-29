/**
 * Tests for DialogueManager.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE.js
vi.mock('three', () => ({
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  },
}));

// Mock DialogueBox since it creates DOM elements
vi.mock('../src/ui/DialogueBox.js', () => ({
  DialogueBox: class {
    constructor() {
      this._listeners = {};
    }
    on(event, cb) {
      this._listeners[event] = cb;
    }
    show() {}
    hide() {}
    dispose() {}
  },
}));

const { useGameStore } = await import('../src/stores/gameStore.js');
const { dialogueManager } = await import('../src/systems/DialogueManager.js');
const { DIALOGUE_TREES, QUESTS, MAIL_ITEMS } = await import('../src/data/dialogues.js');

describe('DialogueManager', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameState: 'playing',
      inventory: { mail: [], maxMail: 5, coins: 0, reputation: 0 },
      quests: { active: [], completed: [], available: [] },
      dialogue: { isActive: false, currentNPC: null, currentNode: null, history: [] },
      ui: { showHUD: true, showQuestLog: false, showInventory: false, showMap: false, showSettings: false, notification: null },
      nearbyNPC: null,
      stats: { mailDelivered: 0, questsCompleted: 0, distanceWalked: 0, npcsTalkedTo: new Set(), playTime: 0 },
    });

    // End any current conversation and re-initialize
    if (dialogueManager.currentConversation) {
      dialogueManager.currentConversation = null;
    }

    // Ensure dialogues are loaded (init may have already been called by previous test)
    if (dialogueManager.npcDialogues.size === 0) {
      dialogueManager.loadDialogues();
      dialogueManager.initUI();
    }
  });

  describe('Dialogue Data', () => {
    it('should have dialogue trees for all 6 NPCs', () => {
      const npcIds = ['npc-townCenter1', 'npc-townCenter2', 'npc-student', 'npc-artist', 'npc-mailCarrier', 'npc-wanderer'];
      for (const id of npcIds) {
        expect(DIALOGUE_TREES[id]).toBeTruthy();
        expect(DIALOGUE_TREES[id].startNode).toBeTruthy();
        expect(DIALOGUE_TREES[id].nodes).toBeTruthy();
      }
    });

    it('should have quests defined', () => {
      expect(Object.keys(QUESTS).length).toBeGreaterThanOrEqual(5);
      expect(QUESTS.deliver_package).toBeTruthy();
      expect(QUESTS.find_sketchbook).toBeTruthy();
      expect(QUESTS.mail_route_help).toBeTruthy();
      expect(QUESTS.student_notes).toBeTruthy();
      expect(QUESTS.wanderer_stories).toBeTruthy();
    });

    it('should have new quests defined', () => {
      expect(QUESTS.urgent_restock).toBeTruthy();
      expect(QUESTS.planet_tour).toBeTruthy();
      expect(QUESTS.art_supplies_run).toBeTruthy();
      expect(QUESTS.social_butterfly).toBeTruthy();
    });

    it('should have mail items defined', () => {
      expect(Object.keys(MAIL_ITEMS).length).toBeGreaterThanOrEqual(3);
      expect(MAIL_ITEMS.letter_shopkeeper).toBeTruthy();
      expect(MAIL_ITEMS.urgent_artist).toBeTruthy();
      expect(MAIL_ITEMS.package_wanderer).toBeTruthy();
    });

    it('should have new mail items defined', () => {
      expect(MAIL_ITEMS.supply_crate).toBeTruthy();
      expect(MAIL_ITEMS.welcome_packet_student).toBeTruthy();
      expect(MAIL_ITEMS.welcome_packet_artist).toBeTruthy();
      expect(MAIL_ITEMS.welcome_packet_wanderer).toBeTruthy();
      expect(MAIL_ITEMS.artist_thank_you).toBeTruthy();
    });

    it('should have valid quest structures', () => {
      for (const [id, quest] of Object.entries(QUESTS)) {
        expect(quest.id).toBe(id);
        expect(quest.title).toBeTruthy();
        expect(quest.objectives).toBeTruthy();
        expect(quest.objectives.length).toBeGreaterThan(0);
        expect(quest.rewards).toBeTruthy();
      }
    });

    it('should have valid dialogue node structures', () => {
      for (const [npcId, tree] of Object.entries(DIALOGUE_TREES)) {
        const startNode = tree.nodes[tree.startNode];
        expect(startNode).toBeTruthy();
        expect(startNode.speaker).toBeTruthy();
        expect(startNode.text).toBeTruthy();
        expect(startNode.choices).toBeTruthy();
        expect(startNode.choices.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Conversation Flow', () => {
    it('should have all NPCs loaded', () => {
      expect(dialogueManager.npcDialogues.size).toBeGreaterThanOrEqual(6);
    });

    it('should start a conversation', () => {
      const node = dialogueManager.startConversation('npc-townCenter1');
      expect(node).toBeTruthy();
      expect(node.speaker).toBe('Villager');
      expect(dialogueManager.isInConversation()).toBe(true);
    });

    it('should return null for unknown NPC', () => {
      const node = dialogueManager.startConversation('npc-unknown');
      expect(node).toBeNull();
    });

    it('should get current node', () => {
      dialogueManager.startConversation('npc-townCenter1');
      const node = dialogueManager.getCurrentNode();
      expect(node).toBeTruthy();
      expect(node.nodeId).toBe('greeting');
    });

    it('should get choices for current node', () => {
      dialogueManager.startConversation('npc-townCenter1');
      const choices = dialogueManager.getChoices();
      expect(choices.length).toBeGreaterThan(0);
    });

    it('should advance to next node', () => {
      dialogueManager.startConversation('npc-townCenter1');
      dialogueManager.advanceToNode('about_place');
      const node = dialogueManager.getCurrentNode();
      expect(node.nodeId).toBe('about_place');
    });

    it('should end conversation', () => {
      dialogueManager.startConversation('npc-townCenter1');
      dialogueManager.endConversation();
      expect(dialogueManager.isInConversation()).toBe(false);
    });

    it('should return conversation state', () => {
      dialogueManager.startConversation('npc-townCenter2');
      const state = dialogueManager.getConversationState();
      expect(state.active).toBe(true);
      expect(state.speaker).toBe('Shopkeeper');
      expect(state.choices.length).toBeGreaterThan(0);
    });

    it('should return inactive state when not in conversation', () => {
      const state = dialogueManager.getConversationState();
      expect(state.active).toBe(false);
    });
  });

  describe('Dialogue Effects', () => {
    it('should give quest through dialogue action', () => {
      dialogueManager.startConversation('npc-townCenter2');
      dialogueManager.executeEffect('giveQuest:deliver_package');
      const quests = useGameStore.getState().quests.active;
      expect(quests.length).toBe(1);
      expect(quests[0].id).toBe('deliver_package');
    });

    it('should give mail through dialogue action', () => {
      dialogueManager.startConversation('npc-townCenter1');
      dialogueManager.executeEffect('giveMail:letter_shopkeeper');
      const mail = useGameStore.getState().inventory.mail;
      expect(mail.length).toBe(1);
      expect(mail[0].id).toBe('letter_shopkeeper');
    });

    it('should give coins through dialogue action', () => {
      dialogueManager.startConversation('npc-townCenter2');
      dialogueManager.executeEffect('give_coins:50');
      expect(useGameStore.getState().inventory.coins).toBe(50);
    });

    it('should handle unknown quest gracefully', () => {
      dialogueManager.startConversation('npc-townCenter1');
      // Should not throw
      dialogueManager.executeEffect('giveQuest:nonexistent_quest');
      expect(useGameStore.getState().quests.active.length).toBe(0);
    });

    it('should handle unknown mail item gracefully', () => {
      dialogueManager.startConversation('npc-townCenter1');
      dialogueManager.executeEffect('giveMail:nonexistent_mail');
      expect(useGameStore.getState().inventory.mail.length).toBe(0);
    });
  });

  describe('Event System', () => {
    it('should emit events', () => {
      const callback = vi.fn();
      dialogueManager.on('conversationStarted', callback);
      dialogueManager.startConversation('npc-townCenter1');
      expect(callback).toHaveBeenCalledTimes(1);
      dialogueManager.off('conversationStarted', callback);
    });

    it('should emit conversationEnded', () => {
      const callback = vi.fn();
      dialogueManager.on('conversationEnded', callback);
      dialogueManager.startConversation('npc-townCenter1');
      dialogueManager.endConversation();
      expect(callback).toHaveBeenCalledTimes(1);
      dialogueManager.off('conversationEnded', callback);
    });

    it('should emit questGiven when quest is given', () => {
      const callback = vi.fn();
      dialogueManager.on('questGiven', callback);
      dialogueManager.startConversation('npc-townCenter2');
      dialogueManager.executeEffect('giveQuest:deliver_package');
      expect(callback).toHaveBeenCalledTimes(1);
      dialogueManager.off('questGiven', callback);
    });

    it('should emit mailGiven when mail is given', () => {
      const callback = vi.fn();
      dialogueManager.on('mailGiven', callback);
      dialogueManager.startConversation('npc-townCenter1');
      dialogueManager.executeEffect('giveMail:letter_shopkeeper');
      expect(callback).toHaveBeenCalledTimes(1);
      dialogueManager.off('mailGiven', callback);
    });
  });
});
