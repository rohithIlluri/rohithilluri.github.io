/**
 * Tests for InventoryManager.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock THREE.js
vi.mock('three', () => ({
  Vector3: class {
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  },
}));

const { useGameStore } = await import('../src/stores/gameStore.js');
const { inventoryManager } = await import('../src/systems/InventoryManager.js');

describe('InventoryManager', () => {
  beforeEach(() => {
    useGameStore.setState({
      inventory: { mail: [], maxMail: 5, coins: 0, reputation: 0 },
      ui: { showHUD: true, showQuestLog: false, showInventory: false, showMap: false, showSettings: false, notification: null },
    });
  });

  describe('Mail Management', () => {
    it('should get empty mail list', () => {
      expect(inventoryManager.getMail()).toEqual([]);
      expect(inventoryManager.getMailCount()).toBe(0);
    });

    it('should collect mail', () => {
      const result = inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      expect(result).toBe(true);
      expect(inventoryManager.getMailCount()).toBe(1);
    });

    it('should not collect duplicate mail', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      const result = inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      expect(result).toBe(false);
      expect(inventoryManager.getMailCount()).toBe(1);
    });

    it('should check if inventory is full', () => {
      expect(inventoryManager.isInventoryFull()).toBe(false);
      for (let i = 0; i < 5; i++) {
        inventoryManager.collectMail({ id: `mail-${i}`, from: 'Town', to: `npc-${i}`, priority: 'normal' });
      }
      expect(inventoryManager.isInventoryFull()).toBe(true);
    });

    it('should check hasMail', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      expect(inventoryManager.hasMail('mail-1')).toBe(true);
      expect(inventoryManager.hasMail('mail-2')).toBe(false);
    });

    it('should get mail for recipient', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      const mail = inventoryManager.getMailFor('npc-1');
      expect(mail).toBeTruthy();
      expect(mail.id).toBe('mail-1');
    });

    it('should check hasMailFor', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      expect(inventoryManager.hasMailFor('npc-1')).toBe(true);
      expect(inventoryManager.hasMailFor('npc-2')).toBe(false);
    });

    it('should deliver mail to NPC', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      const result = inventoryManager.deliverMailToNPC('npc-1');
      expect(result).toBe(true);
      expect(inventoryManager.getMailCount()).toBe(0);
    });

    it('should fail to deliver when no mail for NPC', () => {
      const result = inventoryManager.deliverMailToNPC('npc-1');
      expect(result).toBe(false);
    });

    it('should fail delivery to wrong recipient', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      const result = inventoryManager.deliverMail('mail-1', 'npc-2');
      expect(result).toBe(false);
    });

    it('should clear all mail', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'normal' });
      inventoryManager.clearMail();
      expect(inventoryManager.getMailCount()).toBe(0);
    });
  });

  describe('Coins', () => {
    it('should get coins', () => {
      expect(inventoryManager.getCoins()).toBe(0);
    });

    it('should add coins', () => {
      inventoryManager.addCoins(100);
      expect(inventoryManager.getCoins()).toBe(100);
    });

    it('should spend coins', () => {
      inventoryManager.addCoins(100);
      const result = inventoryManager.spendCoins(30);
      expect(result).toBe(true);
      expect(inventoryManager.getCoins()).toBe(70);
    });

    it('should fail to spend more than available', () => {
      inventoryManager.addCoins(10);
      const result = inventoryManager.spendCoins(50);
      expect(result).toBe(false);
      expect(inventoryManager.getCoins()).toBe(10);
    });
  });

  describe('Summary', () => {
    it('should return inventory summary', () => {
      inventoryManager.collectMail({ id: 'mail-1', from: 'Town', to: 'npc-1', priority: 'express' });
      inventoryManager.addCoins(42);
      const summary = inventoryManager.getSummary();
      expect(summary.mailCount).toBe(1);
      expect(summary.maxMail).toBe(5);
      expect(summary.coins).toBe(42);
      expect(summary.mail).toHaveLength(1);
    });
  });
});
