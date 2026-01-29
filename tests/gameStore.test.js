/**
 * Tests for gameStore.js - Zustand state management
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE.js
vi.mock('three', () => ({
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
  },
}));

// Import after mocks
const { useGameStore, DEFAULT_APPEARANCE } = await import('../src/stores/gameStore.js');

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useGameStore.setState({
      gameState: 'loading',
      isLoaded: false,
      inventory: { mail: [], maxMail: 5, coins: 0, reputation: 0 },
      quests: { active: [], completed: [], available: [] },
      currentQuest: null,
      dialogue: { isActive: false, currentNPC: null, currentNode: null, history: [] },
      ui: { showHUD: true, showQuestLog: false, showInventory: false, showMap: false, showSettings: false, notification: null },
      playerAppearance: { ...DEFAULT_APPEARANCE },
      nearbyNPC: null,
      nearbyMailbox: null,
      stats: { mailDelivered: 0, questsCompleted: 0, distanceWalked: 0, npcsTalkedTo: new Set(), playTime: 0 },
    });
  });

  describe('Game State', () => {
    it('should set game state', () => {
      useGameStore.getState().setGameState('playing');
      expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('should start new game with customization state', () => {
      useGameStore.getState().startNewGame();
      expect(useGameStore.getState().gameState).toBe('customization');
    });

    it('should transition to playing on startGame', () => {
      useGameStore.getState().startGame();
      expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('should pause and resume game', () => {
      useGameStore.getState().startGame();
      useGameStore.getState().pauseGame();
      expect(useGameStore.getState().gameState).toBe('paused');
      useGameStore.getState().resumeGame();
      expect(useGameStore.getState().gameState).toBe('playing');
    });
  });

  describe('Inventory - Mail', () => {
    it('should add mail to inventory', () => {
      const mail = { id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' };
      useGameStore.getState().addMail(mail);
      expect(useGameStore.getState().inventory.mail).toHaveLength(1);
      expect(useGameStore.getState().inventory.mail[0].id).toBe('mail-1');
    });

    it('should not exceed max mail capacity', () => {
      for (let i = 0; i < 7; i++) {
        useGameStore.getState().addMail({ id: `mail-${i}`, from: 'Town', to: 'npc-1', priority: 'normal' });
      }
      expect(useGameStore.getState().inventory.mail).toHaveLength(5);
    });

    it('should remove mail by id', () => {
      useGameStore.getState().addMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      useGameStore.getState().addMail({ id: 'mail-2', from: 'Town', to: 'npc-2', priority: 'express' });
      useGameStore.getState().removeMail('mail-1');
      expect(useGameStore.getState().inventory.mail).toHaveLength(1);
      expect(useGameStore.getState().inventory.mail[0].id).toBe('mail-2');
    });

    it('should deliver mail and award coins for normal priority', () => {
      useGameStore.getState().addMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      const result = useGameStore.getState().deliverMail('mail-1', 'npc-1');
      expect(result).toBe(true);
      expect(useGameStore.getState().inventory.mail).toHaveLength(0);
      expect(useGameStore.getState().inventory.coins).toBe(10);
      expect(useGameStore.getState().inventory.reputation).toBe(5);
      expect(useGameStore.getState().stats.mailDelivered).toBe(1);
    });

    it('should deliver mail and award 25 coins for urgent priority', () => {
      useGameStore.getState().addMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'urgent' });
      useGameStore.getState().deliverMail('mail-1', 'npc-1');
      expect(useGameStore.getState().inventory.coins).toBe(25);
    });

    it('should return false when delivering non-existent mail', () => {
      const result = useGameStore.getState().deliverMail('nonexistent', 'npc-1');
      expect(result).toBe(false);
    });
  });

  describe('Inventory - Coins', () => {
    it('should add coins', () => {
      useGameStore.getState().addCoins(50);
      expect(useGameStore.getState().inventory.coins).toBe(50);
    });

    it('should accumulate coins', () => {
      useGameStore.getState().addCoins(10);
      useGameStore.getState().addCoins(20);
      expect(useGameStore.getState().inventory.coins).toBe(30);
    });
  });

  describe('Quest System', () => {
    const testQuest = {
      id: 'quest-1',
      title: 'Deliver Package',
      objectives: [
        { description: 'Pick up package', complete: false },
        { description: 'Deliver to NPC', complete: false },
      ],
      rewards: { coins: 50, reputation: 10 },
    };

    it('should accept a quest', () => {
      useGameStore.getState().acceptQuest(testQuest);
      expect(useGameStore.getState().quests.active).toHaveLength(1);
      expect(useGameStore.getState().quests.active[0].id).toBe('quest-1');
    });

    it('should not accept duplicate quest', () => {
      useGameStore.getState().acceptQuest(testQuest);
      useGameStore.getState().acceptQuest(testQuest);
      expect(useGameStore.getState().quests.active).toHaveLength(1);
    });

    it('should complete a quest and award rewards', () => {
      useGameStore.getState().acceptQuest(testQuest);
      useGameStore.getState().completeQuest('quest-1');
      expect(useGameStore.getState().quests.active).toHaveLength(0);
      expect(useGameStore.getState().quests.completed).toContain('quest-1');
      expect(useGameStore.getState().inventory.coins).toBe(50);
      expect(useGameStore.getState().stats.questsCompleted).toBe(1);
    });

    it('should update quest objective', () => {
      useGameStore.getState().acceptQuest(testQuest);
      useGameStore.getState().updateQuestObjective('quest-1', 0, true);
      const quest = useGameStore.getState().quests.active[0];
      expect(quest.objectives[0].complete).toBe(true);
      expect(quest.objectives[1].complete).toBe(false);
    });

    it('should auto-complete quest when all objectives done', () => {
      useGameStore.getState().acceptQuest(testQuest);
      useGameStore.getState().updateQuestObjective('quest-1', 0, true);
      useGameStore.getState().updateQuestObjective('quest-1', 1, true);
      // Quest should be auto-completed
      expect(useGameStore.getState().quests.active).toHaveLength(0);
      expect(useGameStore.getState().quests.completed).toContain('quest-1');
    });

    it('should set current quest', () => {
      useGameStore.getState().setCurrentQuest(testQuest);
      expect(useGameStore.getState().currentQuest).toEqual(testQuest);
    });
  });

  describe('Dialogue System', () => {
    it('should start dialogue', () => {
      const npc = { id: 'npc-1', name: 'Villager' };
      useGameStore.getState().startDialogue(npc, 'greeting');
      expect(useGameStore.getState().gameState).toBe('dialogue');
      expect(useGameStore.getState().dialogue.isActive).toBe(true);
      expect(useGameStore.getState().dialogue.currentNPC).toEqual(npc);
      expect(useGameStore.getState().dialogue.currentNode).toBe('greeting');
    });

    it('should advance dialogue', () => {
      const npc = { id: 'npc-1', name: 'Villager' };
      useGameStore.getState().startDialogue(npc, 'greeting');
      useGameStore.getState().advanceDialogue('response');
      expect(useGameStore.getState().dialogue.currentNode).toBe('response');
      expect(useGameStore.getState().dialogue.history).toContain('greeting');
    });

    it('should end dialogue when advancing to null', () => {
      const npc = { id: 'npc-1', name: 'Villager' };
      useGameStore.getState().startDialogue(npc, 'greeting');
      useGameStore.getState().advanceDialogue(null);
      expect(useGameStore.getState().dialogue.isActive).toBe(false);
      expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('should end dialogue explicitly', () => {
      const npc = { id: 'npc-1', name: 'Villager' };
      useGameStore.getState().startDialogue(npc, 'greeting');
      useGameStore.getState().endDialogue();
      expect(useGameStore.getState().dialogue.isActive).toBe(false);
      expect(useGameStore.getState().gameState).toBe('playing');
    });

    it('should track talked NPCs in stats', () => {
      const npc = { id: 'npc-1', name: 'Villager' };
      useGameStore.getState().startDialogue(npc, 'greeting');
      expect(useGameStore.getState().stats.npcsTalkedTo.has('npc-1')).toBe(true);
    });
  });

  describe('Appearance', () => {
    it('should set player appearance', () => {
      useGameStore.getState().setPlayerAppearance({ hairColor: 0xFF0000 });
      expect(useGameStore.getState().playerAppearance.hairColor).toBe(0xFF0000);
      // Other properties should remain
      expect(useGameStore.getState().playerAppearance.skinTone).toBe(DEFAULT_APPEARANCE.skinTone);
    });

    it('should reset appearance to defaults', () => {
      useGameStore.getState().setPlayerAppearance({ hairColor: 0xFF0000 });
      useGameStore.getState().resetAppearance();
      expect(useGameStore.getState().playerAppearance.hairColor).toBe(DEFAULT_APPEARANCE.hairColor);
    });
  });

  describe('UI State', () => {
    it('should toggle quest log', () => {
      // Reset debounce timer before testing
      useGameStore.setState({ _lastUIToggle: 0 });
      useGameStore.getState().toggleQuestLog();
      expect(useGameStore.getState().ui.showQuestLog).toBe(true);
      // Reset debounce timer again for second toggle
      useGameStore.setState({ _lastUIToggle: 0 });
      useGameStore.getState().toggleQuestLog();
      expect(useGameStore.getState().ui.showQuestLog).toBe(false);
    });

    it('should show notification', () => {
      vi.useFakeTimers();
      useGameStore.getState().showNotification('success', 'Test message', 1000);
      expect(useGameStore.getState().ui.notification).toEqual({
        type: 'success',
        message: 'Test message',
        duration: 1000,
      });
      vi.advanceTimersByTime(1100);
      expect(useGameStore.getState().ui.notification).toBeNull();
      vi.useRealTimers();
    });
  });

  describe('Settings', () => {
    it('should update settings by category', () => {
      useGameStore.getState().updateSettings('graphics', { quality: 'low' });
      expect(useGameStore.getState().settings.graphics.quality).toBe('low');
    });

    it('should reset settings', () => {
      useGameStore.getState().updateSettings('graphics', { quality: 'low' });
      useGameStore.getState().resetSettings();
      expect(useGameStore.getState().settings.graphics.quality).toBe('high');
    });
  });

  describe('Statistics', () => {
    it('should add distance walked', () => {
      useGameStore.getState().addDistance(10);
      useGameStore.getState().addDistance(5);
      expect(useGameStore.getState().stats.distanceWalked).toBe(15);
    });

    it('should add play time', () => {
      useGameStore.getState().addPlayTime(60);
      expect(useGameStore.getState().stats.playTime).toBe(60);
    });
  });

  describe('NPC and Mailbox', () => {
    it('should set nearby NPC', () => {
      const npc = { id: 'npc-1', name: 'Villager' };
      useGameStore.getState().setNearbyNPC(npc);
      expect(useGameStore.getState().nearbyNPC).toEqual(npc);
    });

    it('should clear nearby NPC', () => {
      useGameStore.getState().setNearbyNPC({ id: 'npc-1' });
      useGameStore.getState().setNearbyNPC(null);
      expect(useGameStore.getState().nearbyNPC).toBeNull();
    });

    it('should set nearby mailbox', () => {
      const mailbox = { id: 'mb-1', hasNewMail: true };
      useGameStore.getState().setNearbyMailbox(mailbox);
      expect(useGameStore.getState().nearbyMailbox).toEqual(mailbox);
    });
  });
});
