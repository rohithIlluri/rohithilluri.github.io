// Messenger-style Tiny Planet Theme Configuration
// Teal/Turquoise color palette inspired by messenger.abeto.co

export const PLANET_CONFIG = {
  radius: 12,
  segments: 64,
  walkSpeed: 0.02,
  turnSpeed: 0.03,
  cameraDistance: 8,
  cameraHeight: 4,
  interactionDistance: 3,
  characterHeight: 1.8,
};

export const PLANET_COLORS = {
  // Teal/Turquoise sky theme
  sky: {
    top: '#2B4F60',      // Deep teal-blue
    middle: '#5DBFB8',   // Turquoise (main theme color)
    bottom: '#98D8C8',   // Mint
    sun: '#FFF5DC',      // Warm cream
  },

  // Street/ground - warm cream tones
  street: {
    asphalt: '#E8DFD3',  // Warm cream
    sidewalk: '#FFF8DC', // Soft cream
    crosswalk: '#F5F5F5',
    yellow: '#FFD93D',   // Accent yellow
    curb: '#D4C4B5',
  },

  // Buildings - soft pastels
  buildings: {
    brick: '#E8B4A0',    // Soft terracotta
    concrete: '#B8C5D0', // Soft blue-gray
    glass: '#A8D8DC',    // Light cyan
    metal: '#C4C4C4',
    neon: '#FF6B6B',     // Coral accent
  },

  // Character - updated to match theme
  character: {
    skin: '#FDBBB1',
    hair: '#5A4A3A',
    shirt: '#5DBFB8',    // Match theme teal
    pants: '#3D5A6A',
    shoes: '#FFFFFF',
  },

  // Lighting - warmer tones
  lighting: {
    directional: '#FFF5DC',
    ambient: '#E8F4F0',
    hemisphere: {
      sky: '#5DBFB8',
      ground: '#E8DFD3',
    },
  },

  // Outlines
  outline: '#3D5A6A',
};

// NPC types for messenger dialogue system
export const NPC_TYPES = {
  guide: { color: '#5DBFB8', accentColor: '#98D8C8' },
  craftsman: { color: '#FF6B6B', accentColor: '#FFB4A0' },
  architect: { color: '#98D8C8', accentColor: '#5DBFB8' },
  musician: { color: '#FFD93D', accentColor: '#FFE873' },
  critic: { color: '#E8B4A0', accentColor: '#F5D0C0' },
  postmaster: { color: '#3B82F6', accentColor: '#60A5FA' },
};

// Landmark configurations - Updated for NPC-based messenger system
export const LANDMARKS = [
  {
    id: 'guide',
    type: 'npc',
    npcType: 'guide',
    theta: 0,
    phi: Math.PI / 2,
    label: 'Guide',
    color: NPC_TYPES.guide.color,
    interaction: 'dialogue',
  },
  {
    id: 'skills',
    type: 'npc',
    npcType: 'craftsman',
    theta: Math.PI * 0.35,
    phi: Math.PI / 2,
    label: 'The Craftsman',
    color: NPC_TYPES.craftsman.color,
    interaction: 'dialogue',
  },
  {
    id: 'projects',
    type: 'npc',
    npcType: 'architect',
    theta: Math.PI * 0.7,
    phi: Math.PI / 2,
    label: 'The Architect',
    color: NPC_TYPES.architect.color,
    interaction: 'dialogue',
  },
  {
    id: 'music',
    type: 'npc',
    npcType: 'musician',
    theta: Math.PI * 1.05,
    phi: Math.PI / 2,
    label: 'The DJ',
    color: NPC_TYPES.musician.color,
    interaction: 'dialogue',
  },
  {
    id: 'movies',
    type: 'npc',
    npcType: 'critic',
    theta: Math.PI * 1.4,
    phi: Math.PI / 2,
    label: 'Film Buff',
    color: NPC_TYPES.critic.color,
    interaction: 'dialogue',
  },
  {
    id: 'contact',
    type: 'npc',
    npcType: 'postmaster',
    theta: Math.PI * 1.75,
    phi: Math.PI / 2,
    label: 'Postmaster',
    color: NPC_TYPES.postmaster.color,
    interaction: 'dialogue',
  },
];

// Convert spherical to cartesian coordinates
export function sphericalToCartesian(theta, phi, radius) {
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

// Animation timing
export const TIMING = {
  walkCycle: 0.4,
  neonFlicker: 0.1,
  cameraSmooth: 0.05,
  interactionFade: 0.3,
  typewriterSpeed: 30, // ms per character
  dialogueTransition: 0.3,
};

// Messenger UI colors
export const MESSENGER_COLORS = {
  dialogueBackground: '#FFFFFF',
  dialogueBorder: 'rgba(0,0,0,0.1)',
  dialogueShadow: 'rgba(0,0,0,0.15)',
  speakerTagBg: '#5DBFB8',
  speakerTagText: '#FFFFFF',
  messageText: '#1F2937',
  nextButtonBg: '#5DBFB8',
  nextButtonHover: '#4DA8A1',
  promptBackground: 'rgba(255,255,255,0.95)',
  promptBorder: 'rgba(93,191,184,0.3)',
};

// Zone ground colors for visual distinction
export const ZONE_COLORS = {
  welcome: {
    ground: '#FFF8E7',      // Warm cream
    accent: '#5DBFB8',       // Theme teal
    tint: 0xFFF8E7,
  },
  skills: {
    ground: '#F5E6DC',       // Soft terracotta tint
    accent: '#FF6B6B',       // Coral
    tint: 0xF5E6DC,
  },
  projects: {
    ground: '#E8F5F2',       // Mint tint
    accent: '#98D8C8',       // Mint
    tint: 0xE8F5F2,
  },
  music: {
    ground: '#FFF9E6',       // Golden tint
    accent: '#FFD93D',       // Golden
    tint: 0xFFF9E6,
  },
  movies: {
    ground: '#FDF2EF',       // Coral tint
    accent: '#E8B4A0',       // Soft terracotta
    tint: 0xFDF2EF,
  },
  contact: {
    ground: '#EEF4FF',       // Blue tint
    accent: '#3B82F6',       // Blue
    tint: 0xEEF4FF,
  },
};

// Get zone color by ID
export function getZoneColor(zoneId) {
  return ZONE_COLORS[zoneId] || ZONE_COLORS.welcome;
}
