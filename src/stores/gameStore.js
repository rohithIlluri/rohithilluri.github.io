/**
 * gameStore.js - Global State Management with Zustand (Vanilla)
 * Complete game state: player, inventory, quests, settings, UI
 */

import { createStore } from 'zustand/vanilla';
import * as THREE from 'three';

// Default player appearance
const DEFAULT_APPEARANCE = {
  hairStyle: 'bob',
  hairColor: 0x2A2A2A,
  skinTone: 0xF5E1D0,
  shirtStyle: 'collared',
  shirtColor: 0x2A2A2A,
  skirtStyle: 'pleated',
  skirtColor: 0xB84A5A,
  shoesStyle: 'chunky',
  shoesColor: 0xE8B84A,
  bagStyle: 'messenger',
  bagColor: 0xE8B84A,
  accessories: [],
};

// Default settings
const DEFAULT_SETTINGS = {
  graphics: {
    quality: 'high', // 'low', 'medium', 'high', 'ultra'
    resolutionScale: 1.0,
    shadowsEnabled: true,
    bloomEnabled: true,
    particlesEnabled: true,
    showFPS: false,
  },
  audio: {
    masterVolume: 0.7,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    ambientVolume: 0.6,
  },
  controls: {
    cameraSensitivity: 1.0,
    invertY: false,
  },
  accessibility: {
    colorblindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
    textSize: 'medium', // 'small', 'medium', 'large'
    reduceMotion: false,
    hapticEnabled: true, // Vibration feedback on mobile
  },
};

const store = createStore((set, get) => ({
  // ===== GAME STATE =====
  gameState: 'loading', // 'loading', 'menu', 'customization', 'playing', 'paused', 'dialogue'
  isLoaded: false,
  loadProgress: 0,
  loadingMessage: 'Initializing...',

  // ===== PLAYER STATE =====
  playerPosition: new THREE.Vector3(),
  playerRotation: 0,
  isRunning: false,
  isInteracting: false,

  // ===== PLAYER APPEARANCE =====
  playerAppearance: { ...DEFAULT_APPEARANCE },

  // ===== TIME/WORLD STATE =====
  isNight: false,
  timeOfDay: 0, // 0-1, 0 = dawn, 0.5 = noon, 1 = dusk

  // ===== INVENTORY SYSTEM =====
  inventory: {
    mail: [], // Array of mail items: { id, from, to, priority, collected: timestamp }
    maxMail: 5,
    coins: 0,
    reputation: 0,
  },

  // ===== QUEST SYSTEM =====
  quests: {
    active: [], // Currently active quests
    completed: [], // Completed quest IDs
    available: [], // Available but not accepted
  },
  currentQuest: null, // Highlighted/tracked quest

  // ===== DIALOGUE STATE =====
  dialogue: {
    isActive: false,
    currentNPC: null,
    currentNode: null,
    history: [], // Previous dialogue nodes in current conversation
  },

  // ===== UI STATE =====
  ui: {
    showHUD: true,
    showQuestLog: false,
    showInventory: false,
    showMap: false,
    showSettings: false,
    notification: null, // { type, message, duration }
  },

  // ===== BUILDINGS/LOCATIONS =====
  buildings: [],
  currentBuilding: null,
  isModalOpen: false,
  visitedBuildings: new Set(),
  visitedZones: new Set(),

  // ===== NPC STATE =====
  npcs: [], // Loaded NPC data with current state
  nearbyNPC: null, // NPC in interaction range

  // ===== MAILBOX STATE =====
  nearbyMailbox: null, // Mailbox in interaction range

  // ===== SETTINGS =====
  settings: { ...DEFAULT_SETTINGS },

  // ===== STATISTICS =====
  stats: {
    mailDelivered: 0,
    questsCompleted: 0,
    distanceWalked: 0,
    npcsTalkedTo: new Set(),
    playTime: 0,
  },

  // ===== SAVE/LOAD =====
  saveSlot: null,
  lastSaveTime: null,

  // ========== ACTIONS ==========

  // --- Game State ---
  setGameState: (state) => set({ gameState: state }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setLoadProgress: (progress, message) => set({
    loadProgress: progress,
    loadingMessage: message || get().loadingMessage,
  }),

  startNewGame: () => {
    set({
      gameState: 'customization',
      playerAppearance: { ...DEFAULT_APPEARANCE },
      inventory: { mail: [], maxMail: 5, coins: 0, reputation: 0 },
      quests: { active: [], completed: [], available: [] },
      stats: {
        mailDelivered: 0,
        questsCompleted: 0,
        distanceWalked: 0,
        npcsTalkedTo: new Set(),
        playTime: 0,
      },
    });
  },

  startGame: () => set({ gameState: 'playing' }),
  pauseGame: () => set({ gameState: 'paused' }),
  resumeGame: () => set({ gameState: 'playing' }),
  returnToMenu: () => set({ gameState: 'menu' }),

  // --- Player ---
  setPlayerPosition: (position) => set({ playerPosition: position }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  setRunning: (isRunning) => set({ isRunning }),
  setInteracting: (isInteracting) => set({ isInteracting }),

  // --- Appearance ---
  setPlayerAppearance: (appearance) => set({
    playerAppearance: { ...get().playerAppearance, ...appearance }
  }),
  resetAppearance: () => set({ playerAppearance: { ...DEFAULT_APPEARANCE } }),

  // --- Time ---
  setNight: (isNight) => set({ isNight }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  toggleDayNight: () => set({ isNight: !get().isNight }),

  // --- Inventory ---
  addMail: (mailItem) => {
    const inv = get().inventory;
    // Check if inventory is full
    if (inv.mail.length >= inv.maxMail) {
      get().showNotification('error', 'Inventory full!');
      return false;
    }
    // Prevent duplicate mail (same ID)
    if (inv.mail.some((m) => m.id === mailItem.id)) {
      console.warn('[Store] Duplicate mail prevented:', mailItem.id);
      return false;
    }
    // Validate mail item has required fields
    if (!mailItem.id || !mailItem.to) {
      console.warn('[Store] Invalid mail item:', mailItem);
      return false;
    }
    set({
      inventory: {
        ...inv,
        mail: [...inv.mail, { ...mailItem, collected: Date.now() }],
      },
    });
    get().showNotification('mail', `Picked up mail for ${mailItem.to}`);
    return true;
  },

  removeMail: (mailId) => {
    const inv = get().inventory;
    set({
      inventory: {
        ...inv,
        mail: inv.mail.filter((m) => m.id !== mailId),
      },
    });
  },

  deliverMail: (mailId, recipientId) => {
    const inv = get().inventory;
    const mail = inv.mail.find((m) => m.id === mailId);
    if (!mail) {
      console.warn('[Store] Mail not found:', mailId);
      return false;
    }

    // Validate recipient matches mail.to (case-insensitive)
    const mailTo = (mail.to || '').toLowerCase();
    const recipient = (recipientId || '').toLowerCase();
    if (mailTo && recipient && mailTo !== recipient) {
      get().showNotification('error', `This mail is for ${mail.to}, not this NPC!`);
      return false;
    }

    // Award coins based on priority (with validation)
    const validPriorities = { urgent: 25, express: 20, normal: 10 };
    const reward = validPriorities[mail.priority] || 10;

    set({
      inventory: {
        ...inv,
        mail: inv.mail.filter((m) => m.id !== mailId),
        coins: inv.coins + reward,
        reputation: inv.reputation + 5,
      },
      stats: {
        ...get().stats,
        mailDelivered: get().stats.mailDelivered + 1,
      },
    });
    get().showNotification('success', `Delivered! +${reward} coins`);
    return true;
  },

  addCoins: (amount) => {
    const inv = get().inventory;
    set({ inventory: { ...inv, coins: inv.coins + amount } });
  },

  // --- Quests ---
  acceptQuest: (quest) => {
    const quests = get().quests;
    if (quests.active.find((q) => q.id === quest.id)) return;
    set({
      quests: {
        ...quests,
        active: [...quests.active, { ...quest, acceptedAt: Date.now() }],
        available: quests.available.filter((q) => q.id !== quest.id),
      },
    });
    get().showNotification('quest', `Quest accepted: ${quest.title}`);
  },

  completeQuest: (questId) => {
    const quests = get().quests;
    const quest = quests.active.find((q) => q.id === questId);
    if (!quest) return;

    // Award rewards
    if (quest.rewards) {
      if (quest.rewards.coins) get().addCoins(quest.rewards.coins);
      if (quest.rewards.reputation) {
        const inv = get().inventory;
        set({ inventory: { ...inv, reputation: inv.reputation + quest.rewards.reputation } });
      }
    }

    set({
      quests: {
        ...quests,
        active: quests.active.filter((q) => q.id !== questId),
        completed: [...quests.completed, questId],
      },
      stats: {
        ...get().stats,
        questsCompleted: get().stats.questsCompleted + 1,
      },
    });
    get().showNotification('success', `Quest complete: ${quest.title}`);
  },

  updateQuestObjective: (questId, objectiveIndex, complete) => {
    const quests = get().quests;
    const questIdx = quests.active.findIndex((q) => q.id === questId);
    if (questIdx === -1) return;

    const quest = { ...quests.active[questIdx] };
    quest.objectives = [...quest.objectives];
    quest.objectives[objectiveIndex] = { ...quest.objectives[objectiveIndex], complete };

    const newActive = [...quests.active];
    newActive[questIdx] = quest;

    set({ quests: { ...quests, active: newActive } });

    // Check if all objectives complete
    if (quest.objectives.every((o) => o.complete)) {
      get().completeQuest(questId);
    }
  },

  setCurrentQuest: (quest) => set({ currentQuest: quest }),

  // --- Dialogue ---
  startDialogue: (npc, startNodeId) => {
    set({
      gameState: 'dialogue',
      dialogue: {
        isActive: true,
        currentNPC: npc,
        currentNode: startNodeId,
        history: [],
      },
    });
    // Track NPC interaction
    const stats = get().stats;
    stats.npcsTalkedTo.add(npc.id);
    set({ stats: { ...stats, npcsTalkedTo: new Set(stats.npcsTalkedTo) } });
  },

  advanceDialogue: (nextNodeId) => {
    const dialogue = get().dialogue;
    if (!nextNodeId) {
      get().endDialogue();
      return;
    }
    set({
      dialogue: {
        ...dialogue,
        currentNode: nextNodeId,
        history: [...dialogue.history, dialogue.currentNode],
      },
    });
  },

  endDialogue: () => {
    set({
      gameState: 'playing',
      dialogue: {
        isActive: false,
        currentNPC: null,
        currentNode: null,
        history: [],
      },
    });
  },

  // --- UI ---
  // Debounce tracking for UI toggles (prevents rapid spam)
  _lastUIToggle: 0,
  _uiToggleDelay: 150, // ms between allowed toggles

  _canToggleUI: () => {
    const now = Date.now();
    const state = get();
    if (now - state._lastUIToggle < state._uiToggleDelay) {
      return false;
    }
    set({ _lastUIToggle: now });
    return true;
  },

  toggleHUD: () => {
    if (!get()._canToggleUI()) return;
    const ui = get().ui;
    set({ ui: { ...ui, showHUD: !ui.showHUD } });
  },

  toggleQuestLog: () => {
    if (!get()._canToggleUI()) return;
    const ui = get().ui;
    set({ ui: { ...ui, showQuestLog: !ui.showQuestLog } });
  },

  toggleInventory: () => {
    if (!get()._canToggleUI()) return;
    const ui = get().ui;
    set({ ui: { ...ui, showInventory: !ui.showInventory } });
  },

  toggleMap: () => {
    if (!get()._canToggleUI()) return;
    const ui = get().ui;
    set({ ui: { ...ui, showMap: !ui.showMap } });
  },

  toggleSettings: () => {
    if (!get()._canToggleUI()) return;
    const ui = get().ui;
    set({ ui: { ...ui, showSettings: !ui.showSettings } });
  },

  showNotification: (type, message, duration = 3000) => {
    const ui = get().ui;
    set({ ui: { ...ui, notification: { type, message, duration } } });
    setTimeout(() => {
      set({ ui: { ...get().ui, notification: null } });
    }, duration);
  },

  // --- Buildings/Modal (legacy compatibility) ---
  setCurrentBuilding: (building) => {
    if (building) {
      get().markBuildingVisited(building.id);
    }
    set({ currentBuilding: building });
  },
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, currentBuilding: null }),
  markBuildingVisited: (buildingId) => {
    const visited = get().visitedBuildings;
    visited.add(buildingId);
    set({ visitedBuildings: new Set(visited) });
  },
  markZoneVisited: (zoneId) => {
    const visited = get().visitedZones;
    visited.add(zoneId);
    set({ visitedZones: new Set(visited) });
  },

  // --- NPCs ---
  setNPCs: (npcs) => set({ npcs }),
  setNearbyNPC: (npc) => set({ nearbyNPC: npc }),

  // --- Mailboxes ---
  setNearbyMailbox: (mailbox) => set({ nearbyMailbox: mailbox }),

  // --- Settings ---
  updateSettings: (category, settings) => {
    const current = get().settings;
    set({
      settings: {
        ...current,
        [category]: { ...current[category], ...settings },
      },
    });
  },

  resetSettings: () => set({ settings: { ...DEFAULT_SETTINGS } }),

  // Legacy compatibility
  setQualityLevel: (level) => get().updateSettings('graphics', { quality: level }),
  setParticlesEnabled: (enabled) => get().updateSettings('graphics', { particlesEnabled: enabled }),
  setAmbientParticlesEnabled: (enabled) => get().updateSettings('graphics', { particlesEnabled: enabled }),
  setAudioEnabled: (enabled) => get().updateSettings('audio', { masterVolume: enabled ? 0.7 : 0 }),
  setAudioInitialized: () => {}, // No-op for compatibility
  setMasterVolume: (volume) => get().updateSettings('audio', { masterVolume: Math.max(0, Math.min(1, volume)) }),
  setMusicVolume: (volume) => get().updateSettings('audio', { musicVolume: Math.max(0, Math.min(1, volume)) }),
  setSFXVolume: (volume) => get().updateSettings('audio', { sfxVolume: Math.max(0, Math.min(1, volume)) }),

  // Legacy getters
  get qualityLevel() { return get().settings.graphics.quality; },
  get particlesEnabled() { return get().settings.graphics.particlesEnabled; },
  get audioEnabled() { return get().settings.audio.masterVolume > 0; },
  get masterVolume() { return get().settings.audio.masterVolume; },
  get musicVolume() { return get().settings.audio.musicVolume; },
  get sfxVolume() { return get().settings.audio.sfxVolume; },

  // --- Statistics ---
  addDistance: (distance) => {
    const stats = get().stats;
    set({ stats: { ...stats, distanceWalked: stats.distanceWalked + distance } });
  },

  addPlayTime: (seconds) => {
    const stats = get().stats;
    set({ stats: { ...stats, playTime: stats.playTime + seconds } });
  },

  // --- Save/Load ---
  saveGame: (slot = 0) => {
    const state = get();
    const saveData = {
      playerPosition: { x: state.playerPosition.x, y: state.playerPosition.y, z: state.playerPosition.z },
      playerAppearance: state.playerAppearance,
      inventory: state.inventory,
      quests: {
        active: state.quests.active,
        completed: state.quests.completed,
      },
      visitedBuildings: Array.from(state.visitedBuildings),
      visitedZones: Array.from(state.visitedZones),
      settings: state.settings,
      stats: {
        ...state.stats,
        npcsTalkedTo: Array.from(state.stats.npcsTalkedTo),
      },
      isNight: state.isNight,
      savedAt: Date.now(),
    };
    localStorage.setItem(`messenger_save_${slot}`, JSON.stringify(saveData));
    set({ saveSlot: slot, lastSaveTime: Date.now() });
    get().showNotification('success', 'Game saved!');
  },

  loadGame: (slot = 0) => {
    const saveData = localStorage.getItem(`messenger_save_${slot}`);
    if (!saveData) return false;

    try {
      const data = JSON.parse(saveData);
      set({
        playerPosition: new THREE.Vector3(data.playerPosition.x, data.playerPosition.y, data.playerPosition.z),
        playerAppearance: data.playerAppearance,
        inventory: data.inventory,
        quests: {
          ...get().quests,
          active: data.quests.active,
          completed: data.quests.completed,
        },
        visitedBuildings: new Set(data.visitedBuildings),
        visitedZones: new Set(data.visitedZones),
        settings: data.settings,
        stats: {
          ...data.stats,
          npcsTalkedTo: new Set(data.stats.npcsTalkedTo),
        },
        isNight: data.isNight,
        saveSlot: slot,
        lastSaveTime: data.savedAt,
        gameState: 'playing',
      });
      get().showNotification('success', 'Game loaded!');
      return true;
    } catch (e) {
      console.error('Failed to load save:', e);
      return false;
    }
  },

  hasSaveGame: (slot = 0) => {
    return localStorage.getItem(`messenger_save_${slot}`) !== null;
  },

  // --- Getters ---
  getBuildingById: (id) => get().buildings.find((b) => b.id === id),
  isBuildingVisited: (id) => get().visitedBuildings.has(id),
  isZoneVisited: (id) => get().visitedZones.has(id),
  getActiveQuests: () => get().quests.active,
  getCompletedQuests: () => get().quests.completed,
  getMailCount: () => get().inventory.mail.length,
  getCoins: () => get().inventory.coins,
  getReputation: () => get().inventory.reputation,
}));

// Export the store with a React-like hook API for compatibility
export const useGameStore = {
  getState: () => store.getState(),
  setState: (partial) => store.setState(partial),
  subscribe: (listener) => store.subscribe(listener),
};

// Export default appearance for Player.js
export { DEFAULT_APPEARANCE };
