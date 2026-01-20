// Collectibles configuration for "The Wanderer's World"
// Story fragments scattered across the planet - memories, photos, and postcards

export const COLLECTIBLE_TYPES = {
  MEMORY_ORB: 'memoryOrb',
  PHOTO_FRAME: 'photoFrame',
  POSTCARD: 'postcard',
};

export const COLLECTIBLES = [
  // Welcome Zone - The Arrival
  {
    id: 'orb-welcome-1',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'welcome',
    theta: Math.PI * 0.05,
    phi: Math.PI / 2,
    heightOffset: 1.5,
    color: '#5DBFB8',
    glowColor: '#98D8C8',
    title: 'First Steps',
    content: "The day I decided to build my own world. Not because I had to. Because I couldn't imagine not trying.",
    rarity: 'common',
  },
  {
    id: 'photo-welcome-1',
    type: COLLECTIBLE_TYPES.PHOTO_FRAME,
    zoneId: 'welcome',
    theta: Math.PI * 0.25,
    phi: Math.PI / 2,
    heightOffset: 0.8,
    frameColor: '#E8DFD3',
    title: 'The Spark',
    content: "A photo of my first computer setup. Everything started here, in a tiny room with big dreams.",
    rarity: 'common',
  },

  // Skills Zone - The Learning
  {
    id: 'orb-skills-1',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'skills',
    theta: Math.PI * 0.42,
    phi: Math.PI / 2,
    heightOffset: 1.5,
    color: '#FF6B6B',
    glowColor: '#FFB4A0',
    title: 'The First Bug',
    content: "I spent 6 hours debugging. It was a missing semicolon. I cried. Then I laughed. Then I understood: this is the life.",
    rarity: 'uncommon',
  },
  {
    id: 'orb-skills-2',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'skills',
    theta: Math.PI * 0.6,
    phi: Math.PI / 2,
    heightOffset: 1.8,
    color: '#FF6B6B',
    glowColor: '#FFB4A0',
    title: '3 AM Breakthrough',
    content: "When the code finally worked at 3 AM and I jumped out of my chair. The neighbors probably heard.",
    rarity: 'common',
  },

  // Projects Zone - The Building
  {
    id: 'orb-projects-1',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'projects',
    theta: Math.PI * 0.78,
    phi: Math.PI / 2,
    heightOffset: 1.5,
    color: '#98D8C8',
    glowColor: '#5DBFB8',
    title: 'Ship It!',
    content: "The first time I hit 'deploy' on a real project. My heart was pounding. Someone out there was going to use this.",
    rarity: 'uncommon',
  },
  {
    id: 'photo-projects-1',
    type: COLLECTIBLE_TYPES.PHOTO_FRAME,
    zoneId: 'projects',
    theta: Math.PI * 0.95,
    phi: Math.PI / 2,
    heightOffset: 0.8,
    frameColor: '#98D8C8',
    title: 'The Whiteboard',
    content: "A photo of a whiteboard covered in diagrams. Every project starts as scribbles before it becomes code.",
    rarity: 'common',
  },

  // Music Zone - The Listening
  {
    id: 'orb-music-1',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'music',
    theta: Math.PI * 1.12,
    phi: Math.PI / 2,
    heightOffset: 1.5,
    color: '#FFD93D',
    glowColor: '#FFE873',
    title: 'The Perfect Album',
    content: "There's an album that got me through every deadline. Played it 847 times. Yes, I counted.",
    rarity: 'common',
  },
  {
    id: 'postcard-music-1',
    type: COLLECTIBLE_TYPES.POSTCARD,
    zoneId: 'music',
    theta: Math.PI * 1.32,
    phi: Math.PI / 2,
    heightOffset: 0.6,
    color: '#FFD93D',
    title: 'Concert Night',
    content: "A postcard from a concert that changed how I hear music. The bass still vibrates in my memory.",
    rarity: 'uncommon',
  },

  // Movies Zone - The Watching
  {
    id: 'orb-movies-1',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'movies',
    theta: Math.PI * 1.48,
    phi: Math.PI / 2,
    heightOffset: 1.5,
    color: '#E8B4A0',
    glowColor: '#F5D0C0',
    title: 'The Rewatch',
    content: "Some films I've seen 20+ times. Each viewing reveals something new. That's the magic of good storytelling.",
    rarity: 'common',
  },
  {
    id: 'photo-movies-1',
    type: COLLECTIBLE_TYPES.PHOTO_FRAME,
    zoneId: 'movies',
    theta: Math.PI * 1.65,
    phi: Math.PI / 2,
    heightOffset: 0.8,
    frameColor: '#E8B4A0',
    title: 'The Quote',
    content: "'Why do we fall? So we can learn to pick ourselves up.' - Words I needed exactly when I found them.",
    rarity: 'rare',
  },

  // Contact Zone - The Connecting
  {
    id: 'orb-contact-1',
    type: COLLECTIBLE_TYPES.MEMORY_ORB,
    zoneId: 'contact',
    theta: Math.PI * 1.82,
    phi: Math.PI / 2,
    heightOffset: 1.5,
    color: '#3B82F6',
    glowColor: '#60A5FA',
    title: 'The Cold Email',
    content: "A message I sent that I never expected a reply to. It started one of the most important connections of my career.",
    rarity: 'uncommon',
  },
  {
    id: 'postcard-contact-1',
    type: COLLECTIBLE_TYPES.POSTCARD,
    zoneId: 'contact',
    theta: Math.PI * 1.95,
    phi: Math.PI / 2,
    heightOffset: 0.6,
    color: '#3B82F6',
    title: 'To The Explorer',
    content: "Thank you for walking through my world. If something here resonated with you, I'd love to hear about it. Reach out!",
    rarity: 'rare',
  },
];

// Rarity configuration
export const RARITY_CONFIG = {
  common: {
    glow: 1,
    scale: 1,
    points: 10,
  },
  uncommon: {
    glow: 1.5,
    scale: 1.1,
    points: 25,
  },
  rare: {
    glow: 2,
    scale: 1.2,
    points: 50,
  },
};

// Get collectible by ID
export function getCollectibleById(collectibleId) {
  return COLLECTIBLES.find((c) => c.id === collectibleId) || null;
}

// Get collectibles by zone
export function getCollectiblesByZone(zoneId) {
  return COLLECTIBLES.filter((c) => c.zoneId === zoneId);
}

// Get collectibles by type
export function getCollectiblesByType(type) {
  return COLLECTIBLES.filter((c) => c.type === type);
}

// Get collectibles by rarity
export function getCollectiblesByRarity(rarity) {
  return COLLECTIBLES.filter((c) => c.rarity === rarity);
}

// Get all collectible IDs
export function getAllCollectibleIds() {
  return COLLECTIBLES.map((c) => c.id);
}

// Get total collectibles count
export function getTotalCollectiblesCount() {
  return COLLECTIBLES.length;
}

// Calculate total possible points
export function getTotalPossiblePoints() {
  return COLLECTIBLES.reduce((total, c) => {
    return total + (RARITY_CONFIG[c.rarity]?.points || 0);
  }, 0);
}

export default COLLECTIBLES;
