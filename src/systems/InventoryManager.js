/**
 * InventoryManager.js - Mail and Item Inventory System
 * Manages player inventory, mail collection, and delivery tracking
 */

import { useGameStore } from '../stores/gameStore.js';

class InventoryManager {
  constructor() {
    this.maxMailSlots = 5;
    this.mailPickupRadius = 2.0;
    this.deliveryRadius = 2.5;
  }

  /**
   * Initialize the inventory system
   */
  init() {
    console.log('[InventoryManager] Initialized');
  }

  /**
   * Get current mail items
   * @returns {Array} Array of mail items
   */
  getMail() {
    return useGameStore.getState().inventory.mail;
  }

  /**
   * Get mail count
   * @returns {number}
   */
  getMailCount() {
    return useGameStore.getState().inventory.mail.length;
  }

  /**
   * Check if inventory is full
   * @returns {boolean}
   */
  isInventoryFull() {
    const inv = useGameStore.getState().inventory;
    return inv.mail.length >= inv.maxMail;
  }

  /**
   * Check if player has specific mail item
   * @param {string} mailId
   * @returns {boolean}
   */
  hasMail(mailId) {
    return useGameStore.getState().inventory.mail.some(m => m.id === mailId);
  }

  /**
   * Get mail for specific recipient
   * @param {string} recipientId NPC or building ID
   * @returns {Object|null} Mail item or null
   */
  getMailFor(recipientId) {
    return useGameStore.getState().inventory.mail.find(m => m.to === recipientId);
  }

  /**
   * Get all mail items for display
   * @returns {Array} Mail items with full info
   */
  getAllMail() {
    return useGameStore.getState().inventory.mail;
  }

  /**
   * Check if player has any mail for a specific recipient
   * @param {string} recipientId
   * @returns {boolean}
   */
  hasMailFor(recipientId) {
    return useGameStore.getState().inventory.mail.some(m => m.to === recipientId);
  }

  /**
   * Deliver mail directly to an NPC (bypasses dialogue system)
   * Used when interacting with game NPCs from NPCData
   * @param {string} npcId NPC definition ID
   * @returns {boolean} Success
   */
  deliverMailToNPC(npcId) {
    const mail = this.getMailFor(npcId);
    if (!mail) {
      return false;
    }
    return useGameStore.getState().deliverMail(mail.id, npcId);
  }

  /**
   * Add mail to inventory
   * @param {Object} mailItem Mail data { id, from, to, priority, description }
   * @returns {boolean} Success
   */
  collectMail(mailItem) {
    if (this.isInventoryFull()) {
      useGameStore.getState().showNotification('warning', 'Inventory full! Deliver some mail first.');
      return false;
    }

    if (this.hasMail(mailItem.id)) {
      return false; // Already have this mail
    }

    return useGameStore.getState().addMail(mailItem);
  }

  /**
   * Deliver mail to recipient
   * @param {string} mailId
   * @param {string} recipientId
   * @returns {boolean} Success
   */
  deliverMail(mailId, recipientId) {
    const mail = useGameStore.getState().inventory.mail.find(m => m.id === mailId);

    if (!mail) {
      console.warn('[InventoryManager] Mail not found:', mailId);
      return false;
    }

    // Verify correct recipient
    if (mail.to !== recipientId) {
      useGameStore.getState().showNotification('error', 'Wrong recipient!');
      return false;
    }

    return useGameStore.getState().deliverMail(mailId, recipientId);
  }

  /**
   * Get player coins
   * @returns {number}
   */
  getCoins() {
    return useGameStore.getState().inventory.coins;
  }

  /**
   * Get player reputation
   * @returns {number}
   */
  getReputation() {
    return useGameStore.getState().inventory.reputation;
  }

  /**
   * Add coins
   * @param {number} amount
   */
  addCoins(amount) {
    useGameStore.getState().addCoins(amount);
  }

  /**
   * Spend coins (returns false if not enough)
   * @param {number} amount
   * @returns {boolean}
   */
  spendCoins(amount) {
    const inv = useGameStore.getState().inventory;
    if (inv.coins < amount) {
      useGameStore.getState().showNotification('error', 'Not enough coins!');
      return false;
    }
    useGameStore.setState({
      inventory: { ...inv, coins: inv.coins - amount }
    });
    return true;
  }

  /**
   * Upgrade inventory capacity
   * @returns {boolean} Success
   */
  upgradeCapacity() {
    const inv = useGameStore.getState().inventory;
    const upgradeCost = (inv.maxMail - 4) * 100; // 100, 200, 300...

    if (inv.maxMail >= 10) {
      useGameStore.getState().showNotification('info', 'Max capacity reached!');
      return false;
    }

    if (!this.spendCoins(upgradeCost)) {
      return false;
    }

    useGameStore.setState({
      inventory: { ...inv, maxMail: inv.maxMail + 1 }
    });
    useGameStore.getState().showNotification('success', 'Inventory upgraded!');
    return true;
  }

  /**
   * Get inventory summary for HUD
   * @returns {Object}
   */
  getSummary() {
    const inv = useGameStore.getState().inventory;
    return {
      mailCount: inv.mail.length,
      maxMail: inv.maxMail,
      coins: inv.coins,
      reputation: inv.reputation,
      mail: inv.mail.map(m => ({
        id: m.id,
        to: m.to,
        priority: m.priority,
        description: m.description
      }))
    };
  }

  /**
   * Clear all mail (for testing/reset)
   */
  clearMail() {
    const inv = useGameStore.getState().inventory;
    useGameStore.setState({
      inventory: { ...inv, mail: [] }
    });
  }

  /**
   * Dispose
   */
  dispose() {
    console.log('[InventoryManager] Disposed');
  }
}

// Singleton instance
export const inventoryManager = new InventoryManager();
export default InventoryManager;
