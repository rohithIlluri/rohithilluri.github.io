// Building configurations for the Messenger-style exploration game
// Each building belongs to a zone and displays content

export const BUILDING_TYPES = {
  WORKSHOP: 'workshop',
  PAVILION: 'pavilion',
  RECORD_STORE: 'recordStore',
  CINEMA: 'cinema',
  POST_OFFICE: 'postOffice',
  WELCOME_ARCH: 'welcomeArch',
};

export const BUILDINGS = [
  {
    id: 'welcome-arch',
    type: BUILDING_TYPES.WELCOME_ARCH,
    zoneId: 'welcome',
    label: 'Welcome',
    theta: Math.PI * 0.15, // Slightly offset from guide NPC
    phi: Math.PI / 2,
    scale: 1,
    rotation: 0,
    colors: {
      primary: '#5DBFB8', // Theme teal
      secondary: '#FFF8E7',
      accent: '#FFD93D',
    },
    description: 'The entrance to your world',
  },
  {
    id: 'skill-workshop',
    type: BUILDING_TYPES.WORKSHOP,
    zoneId: 'skills',
    label: 'Workshop',
    theta: Math.PI * 0.52, // Near craftsman NPC but offset
    phi: Math.PI / 2,
    scale: 1,
    rotation: 0,
    colors: {
      primary: '#E8B4A0', // Soft terracotta
      secondary: '#FFF8E7',
      accent: '#FF6B6B',
    },
    description: 'Tools of the trade',
    contentType: 'skills',
  },
  {
    id: 'project-pavilion',
    type: BUILDING_TYPES.PAVILION,
    zoneId: 'projects',
    label: 'Pavilion',
    theta: Math.PI * 0.87, // Near architect NPC but offset
    phi: Math.PI / 2,
    scale: 1,
    rotation: 0,
    colors: {
      primary: '#98D8C8', // Mint
      secondary: '#FFFFFF',
      accent: '#5DBFB8',
    },
    description: 'Project showcase',
    contentType: 'projects',
  },
  {
    id: 'record-store',
    type: BUILDING_TYPES.RECORD_STORE,
    zoneId: 'music',
    label: 'Records',
    theta: Math.PI * 1.22, // Near musician NPC but offset
    phi: Math.PI / 2,
    scale: 1,
    rotation: 0,
    colors: {
      primary: '#FFD93D', // Golden
      secondary: '#3D3D3D',
      accent: '#FF6B6B',
    },
    description: 'Music collection',
    contentType: 'music',
  },
  {
    id: 'cinema',
    type: BUILDING_TYPES.CINEMA,
    zoneId: 'movies',
    label: 'Cinema',
    theta: Math.PI * 1.57, // Near critic NPC but offset
    phi: Math.PI / 2,
    scale: 1,
    rotation: 0,
    colors: {
      primary: '#E8B4A0', // Soft terracotta
      secondary: '#2D2D2D',
      accent: '#FF6B6B',
    },
    description: 'Movie theater',
    contentType: 'movies',
  },
  {
    id: 'post-office',
    type: BUILDING_TYPES.POST_OFFICE,
    zoneId: 'contact',
    label: 'Post Office',
    theta: Math.PI * 1.9, // Near postmaster NPC but offset
    phi: Math.PI / 2,
    scale: 1,
    rotation: 0,
    colors: {
      primary: '#3B82F6', // Blue
      secondary: '#FFF8E7',
      accent: '#60A5FA',
    },
    description: 'Send a message',
    contentType: 'contact',
  },
];

// Building visual configurations
export const BUILDING_CONFIGS = {
  [BUILDING_TYPES.WELCOME_ARCH]: {
    width: 3,
    height: 4,
    depth: 1,
    hasRoof: false,
    hasSign: true,
    signText: 'WELCOME',
  },
  [BUILDING_TYPES.WORKSHOP]: {
    width: 3.5,
    height: 3,
    depth: 2.5,
    hasRoof: true,
    roofStyle: 'peaked',
    hasChimney: true,
    windowCount: 2,
    hasDoor: true,
  },
  [BUILDING_TYPES.PAVILION]: {
    width: 4,
    height: 3.5,
    depth: 3,
    hasRoof: true,
    roofStyle: 'flat',
    hasBillboards: true,
    billboardCount: 3,
    hasColumns: true,
    columnCount: 4,
  },
  [BUILDING_TYPES.RECORD_STORE]: {
    width: 3,
    height: 2.5,
    depth: 2,
    hasRoof: true,
    roofStyle: 'flat',
    hasAwning: true,
    hasVinylDisplay: true,
    hasNeonSign: true,
    signText: 'RECORDS',
  },
  [BUILDING_TYPES.CINEMA]: {
    width: 4,
    height: 4,
    depth: 3,
    hasRoof: true,
    roofStyle: 'art-deco',
    hasMarquee: true,
    hasPosterFrames: true,
    posterCount: 3,
    hasTicketBooth: true,
  },
  [BUILDING_TYPES.POST_OFFICE]: {
    width: 3,
    height: 3,
    depth: 2,
    hasRoof: true,
    roofStyle: 'peaked',
    hasMailbox: true,
    hasClock: true,
    hasDoor: true,
    hasFlag: true,
  },
};

// Get building by ID
export function getBuildingById(buildingId) {
  return BUILDINGS.find((building) => building.id === buildingId) || null;
}

// Get buildings by zone
export function getBuildingsByZone(zoneId) {
  return BUILDINGS.filter((building) => building.zoneId === zoneId);
}

// Get building by type
export function getBuildingsByType(type) {
  return BUILDINGS.filter((building) => building.type === type);
}

// Get building config
export function getBuildingConfig(type) {
  return BUILDING_CONFIGS[type] || null;
}

// Get all building IDs
export function getAllBuildingIds() {
  return BUILDINGS.map((building) => building.id);
}

export default BUILDINGS;
