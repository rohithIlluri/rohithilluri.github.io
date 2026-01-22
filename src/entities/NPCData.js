/**
 * NPCData.js - NPC Definitions and Configurations
 * Defines appearance, routes, and behavior for all NPCs
 */

// NPC appearance presets (variations of the player character style)
export const NPC_APPEARANCES = {
  villager1: {
    skinColor: 0xFFDFC4,    // Peachy skin
    shirtColor: 0xFF6B6B,   // Red shirt
    pantsColor: 0x2C3E50,   // Dark blue pants
    hairColor: 0x4A3728,    // Brown hair
    shoeColor: 0x34495E,    // Dark gray shoes
    name: 'Villager',
  },
  villager2: {
    skinColor: 0xD4A574,    // Tan skin
    shirtColor: 0x9B59B6,   // Purple shirt
    pantsColor: 0x1A1A2E,   // Navy pants
    hairColor: 0x1A1A1A,    // Black hair
    shoeColor: 0x8B4513,    // Brown shoes
    name: 'Resident',
  },
  shopkeeper: {
    skinColor: 0xFFDFC4,    // Peachy skin
    shirtColor: 0x27AE60,   // Green shirt (apron style)
    pantsColor: 0x2C3E50,   // Dark pants
    hairColor: 0x7F8C8D,    // Gray hair
    shoeColor: 0x2C2C2C,    // Black shoes
    name: 'Shopkeeper',
  },
  student: {
    skinColor: 0xFFE4C4,    // Light skin
    shirtColor: 0x3498DB,   // Blue shirt
    pantsColor: 0x34495E,   // Dark gray pants
    hairColor: 0x2C1810,    // Dark brown hair
    shoeColor: 0xFFFFFF,    // White sneakers
    name: 'Student',
  },
  artist: {
    skinColor: 0xD4A574,    // Tan skin
    shirtColor: 0xE74C3C,   // Red beret/shirt
    pantsColor: 0x1A1A1A,   // Black pants
    hairColor: 0x5D3A1A,    // Auburn hair
    shoeColor: 0x4A3728,    // Brown shoes
    name: 'Artist',
  },
  mailCarrier: {
    skinColor: 0xFFDFC4,
    shirtColor: 0x2980B9,   // Postal blue
    pantsColor: 0x2C3E50,   // Navy
    hairColor: 0x1A1A1A,
    shoeColor: 0x1A1A1A,
    hasBag: true,           // Has messenger bag like player
    bagColor: 0x8B4513,     // Brown bag
    name: 'Mail Carrier',
  },
};

// Waypoint locations on the planet (lat/lon coordinates)
// The planet has a 50-unit radius, these are in degrees
const WAYPOINTS = {
  townCenter: { lat: 0, lon: 0 },
  northPath: { lat: 30, lon: 0 },
  southPath: { lat: -30, lon: 0 },
  eastPath: { lat: 0, lon: 30 },
  westPath: { lat: 0, lon: -30 },
  northeast: { lat: 20, lon: 20 },
  northwest: { lat: 20, lon: -20 },
  southeast: { lat: -20, lon: 20 },
  southwest: { lat: -20, lon: -20 },
  farNorth: { lat: 45, lon: 0 },
  farSouth: { lat: -45, lon: 0 },
};

// NPC definitions with patrol routes
export const NPC_DEFINITIONS = [
  {
    id: 'npc-townCenter1',
    appearance: 'villager1',
    startWaypoint: 'townCenter',
    patrolRoute: ['townCenter', 'northPath', 'northeast', 'eastPath', 'townCenter'],
    speed: 2.0,
    pauseTime: 2.0, // Seconds to pause at each waypoint
    interactionRadius: 3.0,
    dialogue: "Nice day for a walk, isn't it?",
  },
  {
    id: 'npc-townCenter2',
    appearance: 'shopkeeper',
    startWaypoint: 'eastPath',
    patrolRoute: ['eastPath', 'northeast', 'northPath', 'northwest', 'westPath', 'eastPath'],
    speed: 1.5,
    pauseTime: 3.0,
    interactionRadius: 3.0,
    dialogue: "Welcome to the neighborhood!",
  },
  {
    id: 'npc-student',
    appearance: 'student',
    startWaypoint: 'southPath',
    patrolRoute: ['southPath', 'southeast', 'eastPath', 'townCenter', 'southPath'],
    speed: 2.5, // Students walk faster
    pauseTime: 1.5,
    interactionRadius: 3.0,
    dialogue: "I'm late for class!",
  },
  {
    id: 'npc-artist',
    appearance: 'artist',
    startWaypoint: 'westPath',
    patrolRoute: ['westPath', 'northwest', 'farNorth', 'northeast', 'eastPath', 'westPath'],
    speed: 1.2, // Artists stroll slowly
    pauseTime: 5.0, // Stops to admire scenery
    interactionRadius: 3.0,
    dialogue: "The light here is beautiful...",
  },
  {
    id: 'npc-mailCarrier',
    appearance: 'mailCarrier',
    startWaypoint: 'farSouth',
    patrolRoute: ['farSouth', 'southPath', 'townCenter', 'northPath', 'farNorth', 'northPath', 'townCenter', 'southPath', 'farSouth'],
    speed: 2.8, // Mail carriers are busy
    pauseTime: 1.0,
    interactionRadius: 3.0,
    dialogue: "Got deliveries to make!",
  },
  {
    id: 'npc-wanderer',
    appearance: 'villager2',
    startWaypoint: 'northeast',
    patrolRoute: ['northeast', 'farNorth', 'northwest', 'westPath', 'southwest', 'farSouth', 'southeast', 'eastPath', 'northeast'],
    speed: 1.8,
    pauseTime: 2.0,
    interactionRadius: 3.0,
    dialogue: "I love exploring this little world.",
  },
];

/**
 * Get waypoint position from name
 * @param {string} name Waypoint name
 * @returns {{lat: number, lon: number}} Lat/lon coordinates
 */
export function getWaypoint(name) {
  return WAYPOINTS[name] || WAYPOINTS.townCenter;
}

/**
 * Get NPC appearance preset
 * @param {string} name Appearance preset name
 * @returns {object} Appearance configuration
 */
export function getAppearance(name) {
  return NPC_APPEARANCES[name] || NPC_APPEARANCES.villager1;
}
