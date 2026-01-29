/**
 * quests.js - Quest Definitions Data
 * Contains all quest data for the mail delivery game
 */

export const QUESTS = [
  {
    id: 'quest_tutorial_01',
    type: 'delivery',
    title: 'First Steps',
    description: 'Meet the Postmaster and learn how mail delivery works.',
    npcId: 'npc_postmaster', // Quest giver
    objectives: [
      {
        type: 'talk',
        target: 'npc_postmaster',
        count: 1,
        description: 'Talk to the Postmaster'
      }
    ],
    rewards: { coins: 0, reputation: 5 },
    unlocks: ['quest_first_delivery'],
    isStarter: true,
    prerequisite: null
  },
  {
    id: 'quest_first_delivery',
    type: 'delivery',
    title: 'Your First Delivery',
    description: 'Pick up mail from the Post Office and deliver it to the Mayor.',
    npcId: 'npc_postmaster',
    objectives: [
      {
        type: 'collect',
        target: 'mail_welcome_letter',
        count: 1,
        description: 'Pick up the Welcome Letter'
      },
      {
        type: 'deliver',
        target: 'npc_mayor',
        count: 1,
        description: 'Deliver to the Mayor'
      }
    ],
    rewards: { coins: 25, reputation: 10 },
    unlocks: ['quest_harbor_run'],
    prerequisite: 'quest_tutorial_01'
  },
  {
    id: 'quest_harbor_run',
    type: 'delivery',
    title: 'Harbor Delivery',
    description: 'The dockworker is waiting for an important package.',
    npcId: 'npc_postmaster',
    objectives: [
      {
        type: 'collect',
        target: 'mail_harbor_package',
        count: 1,
        description: 'Pick up the Harbor Package'
      },
      {
        type: 'deliver',
        target: 'npc_dockworker',
        count: 1,
        description: 'Deliver to the Dockworker'
      }
    ],
    rewards: { coins: 30, reputation: 10 },
    unlocks: ['zone_harbor'],
    prerequisite: 'quest_first_delivery'
  },
  {
    id: 'quest_cafe_order',
    type: 'delivery',
    title: 'Special Order',
    description: 'The Cafe Owner needs supplies from the General Store.',
    npcId: 'npc_cafe_owner',
    objectives: [
      {
        type: 'collect',
        target: 'mail_cafe_supplies',
        count: 1,
        description: 'Pick up supplies order form'
      },
      {
        type: 'deliver',
        target: 'npc_shopkeeper',
        count: 1,
        description: 'Deliver to the Shopkeeper'
      },
      {
        type: 'collect',
        target: 'mail_cafe_receipt',
        count: 1,
        description: 'Collect the receipt'
      },
      {
        type: 'deliver',
        target: 'npc_cafe_owner',
        count: 1,
        description: 'Return receipt to Cafe Owner'
      }
    ],
    rewards: { coins: 50, reputation: 15 },
    unlocks: [],
    prerequisite: 'quest_harbor_run'
  },
  {
    id: 'quest_love_letter',
    type: 'delivery',
    title: 'Secret Admirer',
    description: 'Someone has written a love letter. Handle with care!',
    npcId: 'npc_shopkeeper',
    objectives: [
      {
        type: 'collect',
        target: 'mail_love_letter',
        count: 1,
        description: 'Pick up the Love Letter'
      },
      {
        type: 'deliver',
        target: 'npc_florist',
        count: 1,
        description: 'Deliver to the Florist'
      }
    ],
    rewards: { coins: 35, reputation: 20 },
    unlocks: [],
    prerequisite: 'quest_first_delivery'
  },
  {
    id: 'quest_urgent_telegram',
    type: 'delivery',
    title: 'Urgent News',
    description: 'An urgent telegram needs immediate delivery!',
    npcId: 'npc_postmaster',
    objectives: [
      {
        type: 'collect',
        target: 'mail_telegram',
        count: 1,
        description: 'Pick up the Telegram'
      },
      {
        type: 'deliver',
        target: 'npc_factory_manager',
        count: 1,
        description: 'Deliver to Factory Manager'
      }
    ],
    rewards: { coins: 75, reputation: 25 },
    unlocks: ['zone_industrial'],
    prerequisite: 'quest_harbor_run',
    priority: 'urgent',
    timeLimit: 180
  },
  {
    id: 'quest_neighborhood_round',
    type: 'collection',
    title: 'Neighborhood Round',
    description: 'Deliver mail to three residents in the Residential Zone.',
    npcId: 'npc_mayor',
    objectives: [
      {
        type: 'deliver',
        target: 'npc_resident_1',
        count: 1,
        description: 'Deliver to House 1'
      },
      {
        type: 'deliver',
        target: 'npc_resident_2',
        count: 1,
        description: 'Deliver to House 2'
      },
      {
        type: 'deliver',
        target: 'npc_resident_3',
        count: 1,
        description: 'Deliver to House 3'
      }
    ],
    rewards: { coins: 60, reputation: 20 },
    unlocks: [],
    prerequisite: 'quest_cafe_order'
  },
  {
    id: 'quest_meet_everyone',
    type: 'social',
    title: 'Making Friends',
    description: 'Introduce yourself to all the NPCs on the planet.',
    npcId: 'npc_mayor',
    objectives: [
      {
        type: 'talk',
        target: 'npc_postmaster',
        count: 1,
        description: 'Meet the Postmaster'
      },
      {
        type: 'talk',
        target: 'npc_mayor',
        count: 1,
        description: 'Meet the Mayor'
      },
      {
        type: 'talk',
        target: 'npc_cafe_owner',
        count: 1,
        description: 'Meet the Cafe Owner'
      },
      {
        type: 'talk',
        target: 'npc_dockworker',
        count: 1,
        description: 'Meet the Dockworker'
      },
      {
        type: 'talk',
        target: 'npc_shopkeeper',
        count: 1,
        description: 'Meet the Shopkeeper'
      }
    ],
    rewards: { coins: 100, reputation: 50 },
    unlocks: ['achievement_social_butterfly'],
    prerequisite: null
  },
  // --- New quests using actual NPC IDs from NPCData.js ---
  {
    id: 'quest_social_butterfly',
    type: 'social',
    title: 'Social Butterfly',
    description: 'Talk to every resident on the planet and learn their stories.',
    npcId: 'npc-townCenter1',
    objectives: [
      { type: 'talk', target: 'npc-townCenter1', count: 1, description: 'Talk to the Villager' },
      { type: 'talk', target: 'npc-townCenter2', count: 1, description: 'Talk to the Shopkeeper' },
      { type: 'talk', target: 'npc-student', count: 1, description: 'Talk to the Student' },
      { type: 'talk', target: 'npc-artist', count: 1, description: 'Talk to the Artist' },
      { type: 'talk', target: 'npc-mailCarrier', count: 1, description: 'Talk to the Mail Carrier' },
      { type: 'talk', target: 'npc-wanderer', count: 1, description: 'Talk to the Wanderer' }
    ],
    rewards: { coins: 100, reputation: 50 },
    unlocks: ['achievement_social_butterfly'],
    prerequisite: null,
    isStarter: true
  },
  {
    id: 'quest_urgent_restock',
    type: 'delivery',
    title: 'Emergency Restock',
    description: 'The Shopkeeper urgently needs supplies delivered before closing time!',
    npcId: 'npc-townCenter2',
    objectives: [
      { type: 'collect', target: 'supply_crate', count: 1, description: 'Get the supply crate from the Mail Carrier' },
      { type: 'deliver', target: 'npc-townCenter2', count: 1, description: 'Deliver supplies to the Shopkeeper' }
    ],
    rewards: { coins: 60, reputation: 15 },
    unlocks: [],
    prerequisite: null,
    priority: 'urgent',
    timeLimit: 120
  },
  {
    id: 'quest_planet_tour',
    type: 'delivery',
    title: 'Grand Planet Tour',
    description: 'Deliver welcome packets to residents across the whole planet.',
    npcId: 'npc-townCenter1',
    objectives: [
      { type: 'deliver', target: 'npc-student', count: 1, description: 'Deliver packet to the Student' },
      { type: 'deliver', target: 'npc-artist', count: 1, description: 'Deliver packet to the Artist' },
      { type: 'deliver', target: 'npc-wanderer', count: 1, description: 'Deliver packet to the Wanderer' },
      { type: 'talk', target: 'npc-townCenter1', count: 1, description: 'Return to the Villager' }
    ],
    rewards: { coins: 75, reputation: 30 },
    unlocks: [],
    prerequisite: null
  },
  {
    id: 'quest_art_supplies',
    type: 'collection',
    title: 'Art Supply Run',
    description: 'Collect art supplies scattered around the planet for the Artist.',
    npcId: 'npc-artist',
    objectives: [
      { type: 'collect', target: 'paint_tubes', count: 1, description: 'Find paint tubes near the east path' },
      { type: 'collect', target: 'brushes', count: 1, description: 'Find brushes near the north path' },
      { type: 'collect', target: 'canvas', count: 1, description: 'Find canvas near the south path' },
      { type: 'deliver', target: 'npc-artist', count: 1, description: 'Bring all supplies to the Artist' }
    ],
    rewards: { coins: 55, reputation: 20 },
    unlocks: [],
    prerequisite: null
  }
];

export const MAIL_ITEMS = [
  {
    id: 'mail_welcome_letter',
    from: 'Postmaster',
    to: 'Mayor',
    priority: 'normal',
    description: 'An official welcome letter'
  },
  {
    id: 'mail_harbor_package',
    from: 'Post Office',
    to: 'Dockworker',
    priority: 'normal',
    description: 'A sturdy brown package'
  },
  {
    id: 'mail_cafe_supplies',
    from: 'Cafe Owner',
    to: 'Shopkeeper',
    priority: 'normal',
    description: 'A supplies order form'
  },
  {
    id: 'mail_cafe_receipt',
    from: 'Shopkeeper',
    to: 'Cafe Owner',
    priority: 'normal',
    description: 'A receipt for supplies'
  },
  {
    id: 'mail_love_letter',
    from: 'Anonymous',
    to: 'Florist',
    priority: 'normal',
    description: 'A pink envelope with a heart seal'
  },
  {
    id: 'mail_telegram',
    from: 'Central Office',
    to: 'Factory Manager',
    priority: 'urgent',
    description: 'An urgent yellow telegram'
  },
  {
    id: 'supply_crate',
    from: 'Mail Carrier',
    to: 'Shopkeeper',
    priority: 'urgent',
    description: 'A heavy supply crate'
  },
  {
    id: 'welcome_packet_student',
    from: 'Villager',
    to: 'Student',
    priority: 'normal',
    description: 'A welcome packet with a hand-drawn map'
  },
  {
    id: 'welcome_packet_artist',
    from: 'Villager',
    to: 'Artist',
    priority: 'normal',
    description: 'A welcome packet with flower seeds'
  },
  {
    id: 'welcome_packet_wanderer',
    from: 'Villager',
    to: 'Wanderer',
    priority: 'normal',
    description: 'A welcome packet with trail mix'
  }
];

/**
 * Get quest by ID
 * @param {string} questId
 * @returns {Object|null}
 */
export function getQuestById(questId) {
  return QUESTS.find(q => q.id === questId) || null;
}

/**
 * Get quests available from a specific NPC
 * @param {string} npcId
 * @returns {Array}
 */
export function getQuestsForNPC(npcId) {
  return QUESTS.filter(q => q.npcId === npcId);
}

/**
 * Get mail item by ID
 * @param {string} mailId
 * @returns {Object|null}
 */
export function getMailItemById(mailId) {
  return MAIL_ITEMS.find(m => m.id === mailId) || null;
}

/**
 * Get starter quests
 * @returns {Array}
 */
export function getStarterQuests() {
  return QUESTS.filter(q => q.isStarter);
}

export default {
  quests: QUESTS,
  mailItems: MAIL_ITEMS,
  getQuestById,
  getQuestsForNPC,
  getMailItemById,
  getStarterQuests
};
