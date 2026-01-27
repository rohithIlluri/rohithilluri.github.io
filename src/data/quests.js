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
