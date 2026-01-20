// Zone definitions for the Messenger-style exploration game
// Each zone has a theta range on the sphere and unique visual properties

export const ZONES = [
  {
    id: 'welcome',
    name: 'Welcome Plaza',
    description: 'Your journey begins here',
    thetaStart: 0,
    thetaEnd: Math.PI * 0.35,
    groundTint: '#FFF8E7', // Warm cream
    accentColor: '#5DBFB8', // Theme teal
    icon: '🏛️',
    npcId: 'guide',
  },
  {
    id: 'skills',
    name: 'Skill Workshop',
    description: 'Where craft meets creativity',
    thetaStart: Math.PI * 0.35,
    thetaEnd: Math.PI * 0.7,
    groundTint: '#F5E6DC', // Soft terracotta tint
    accentColor: '#FF6B6B', // Coral
    icon: '🔧',
    npcId: 'skills',
  },
  {
    id: 'projects',
    name: 'Project District',
    description: 'Blueprints and builds',
    thetaStart: Math.PI * 0.7,
    thetaEnd: Math.PI * 1.05,
    groundTint: '#E8F5F2', // Mint tint
    accentColor: '#98D8C8', // Mint
    icon: '🏗️',
    npcId: 'projects',
  },
  {
    id: 'music',
    name: 'Music Quarter',
    description: 'Rhythms and records',
    thetaStart: Math.PI * 1.05,
    thetaEnd: Math.PI * 1.4,
    groundTint: '#FFF9E6', // Golden tint
    accentColor: '#FFD93D', // Golden
    icon: '🎵',
    npcId: 'music',
  },
  {
    id: 'movies',
    name: 'Cinema Row',
    description: 'Stories on screen',
    thetaStart: Math.PI * 1.4,
    thetaEnd: Math.PI * 1.75,
    groundTint: '#FDF2EF', // Coral tint
    accentColor: '#E8B4A0', // Soft terracotta
    icon: '🎬',
    npcId: 'movies',
  },
  {
    id: 'contact',
    name: 'Contact Corner',
    description: 'Send a message',
    thetaStart: Math.PI * 1.75,
    thetaEnd: Math.PI * 2,
    groundTint: '#EEF4FF', // Blue tint
    accentColor: '#3B82F6', // Blue
    icon: '📮',
    npcId: 'contact',
  },
];

// Get zone by ID
export function getZoneById(zoneId) {
  return ZONES.find((zone) => zone.id === zoneId) || null;
}

// Get zone by theta angle (handles wrap-around)
export function getZoneByTheta(theta) {
  // Normalize theta to 0 to 2*PI range
  let normalizedTheta = theta % (Math.PI * 2);
  if (normalizedTheta < 0) normalizedTheta += Math.PI * 2;

  for (const zone of ZONES) {
    if (normalizedTheta >= zone.thetaStart && normalizedTheta < zone.thetaEnd) {
      return zone;
    }
  }

  // Handle edge case for theta near 0 (wraps from contact zone)
  if (normalizedTheta >= 0 && normalizedTheta < ZONES[0].thetaEnd) {
    return ZONES[0];
  }

  return ZONES[0]; // Default to welcome
}

// Get zone by NPC ID
export function getZoneByNpcId(npcId) {
  return ZONES.find((zone) => zone.npcId === npcId) || null;
}

// Get all zone IDs
export function getAllZoneIds() {
  return ZONES.map((zone) => zone.id);
}

// Check if position is in a specific zone
export function isInZone(theta, zoneId) {
  const zone = getZoneByTheta(theta);
  return zone && zone.id === zoneId;
}

// Get neighboring zones
export function getNeighboringZones(zoneId) {
  const index = ZONES.findIndex((zone) => zone.id === zoneId);
  if (index === -1) return { prev: null, next: null };

  const prevIndex = index === 0 ? ZONES.length - 1 : index - 1;
  const nextIndex = index === ZONES.length - 1 ? 0 : index + 1;

  return {
    prev: ZONES[prevIndex],
    next: ZONES[nextIndex],
  };
}

export default ZONES;
