/**
 * colors.js - Messenger Clone Color Palette
 * Exact colors from messenger.abeto.co analysis
 * DO NOT use pure black (#000000) anywhere - always use soft colors
 */

// Master color palette matching messenger.abeto.co
export const MESSENGER_PALETTE = {
  // === SKY ===
  SKY_PRIMARY: 0x5BBFBA,      // Turquoise/teal (main sky color)
  SKY_LIGHT: 0x7DD1CD,        // Lighter teal (horizon)
  CLOUD_WHITE: 0xFFFFFF,      // Cloud color (render at 40-60% opacity)
  CLOUD_SHADOW: 0xE8E8E8,     // Cloud shadow tint

  // === NIGHT SKY ===
  NIGHT_ZENITH: 0x1B2838,     // Deep night blue
  NIGHT_HORIZON: 0x2A3848,    // Slightly lighter night horizon

  // === GROUND/ROADS ===
  ASPHALT: 0x6B7B7A,          // Blue-gray road surface
  SIDEWALK: 0xD4CFC5,         // Warm gray/cream sidewalk
  SHADOW_GROUND: 0x5A6B6A,    // Soft ground shadow color
  ROAD_MARKING: 0xE8E8E8,     // Road line markings

  // === BUILDINGS ===
  BUILDING_CREAM: 0xE8DFD0,   // Main wall color (most common)
  BUILDING_WARM_GRAY: 0xB8AFA0, // Secondary wall color
  BUILDING_COOL_GRAY: 0x8A9090, // Modern buildings
  BUILDING_CONCRETE: 0xC5C0B8, // Concrete surfaces
  BUILDING_BRICK: 0x9A7B6A,   // Brick accents

  // === BUILDING DETAILS ===
  WINDOW_DARK: 0x3A4A4A,      // Window glass (slightly blue)
  WINDOW_FRAME: 0x5A5A5A,     // Window frames
  DOOR_WOOD: 0x8B7355,        // Wooden doors
  DOOR_METAL: 0x6A7A7A,       // Metal doors

  // === VEGETATION ===
  TREE_GREEN: 0x6B9B5A,       // Muted tree green
  GRASS_GREEN: 0x7AAB6A,      // Grass and small plants
  PLANT_DARK: 0x5A8B4A,       // Darker foliage/shadows
  TREE_TRUNK: 0x8B7355,       // Tree trunk brown

  // === ACCENTS ===
  YELLOW_ACCENT: 0xE8B84A,    // Signs, vending machines, character bag
  ORANGE_ACCENT: 0xD87A4A,    // Traffic cones, rust, character strap
  BLUE_ACCENT: 0x5AABCB,      // Water, boat hull, misc accents
  RED_ACCENT: 0xC85A5A,       // Warning signs, emergency elements
  TEAL_ACCENT: 0x5ABBB8,      // UI accent, character shirt design

  // === OUTLINES ===
  OUTLINE_PRIMARY: 0x2A2A2A,  // Near-black (main outlines)
  OUTLINE_SOFT: 0x4A4A4A,     // Distant objects, softer outlines
  OUTLINE_LIGHTEST: 0x5A5A5A, // Very distant, subtle outlines

  // === CHARACTER (messenger.abeto.co reference) ===
  CHAR_SKIN: 0xF5E1D0,        // Warm peach skin tone
  CHAR_HAIR: 0x2A2A2A,        // Black hair (very dark)
  CHAR_SHIRT: 0x2A2A2A,       // Black/dark shirt
  CHAR_SHIRT_COLLAR: 0xF5E8D8, // Shirt collar accent (cream)
  CHAR_SKIRT: 0xB84A5A,       // Red/maroon skirt (signature look)
  CHAR_SOCKS: 0xF5F5F5,       // White socks
  CHAR_SHOES: 0xE8B84A,       // YELLOW chunky sneakers (messenger style)
  CHAR_BAG: 0xE8B84A,         // YELLOW messenger bag (iconic)
  CHAR_STRAP: 0xD87A4A,       // ORANGE bag strap

  // === UI ===
  UI_WHITE: 0xFFFFFF,         // UI backgrounds
  UI_BLACK: 0x2A2A2A,         // UI text, outlines
  UI_TEAL: 0x5ABBB8,          // Primary accent (buttons, labels)
  UI_YELLOW: 0xE8B84A,        // Secondary accent (CTA buttons)

  // === SHADOWS (CRITICAL: never black!) ===
  SHADOW_TINT: 0x5A6B7A,      // Blue-gray shadow tint
  SHADOW_LIGHT: 0x7A8B9A,     // Lighter shadow for subtle areas
  AMBIENT_SHADOW: 0x4A5A6A,   // Ambient occlusion tint

  // === PROPS ===
  METAL_GRAY: 0x8A8A8A,       // Metal surfaces (poles, rails)
  METAL_DARK: 0x5A5A5A,       // Darker metal
  RUST: 0xB87A5A,             // Rusty metal
  PLASTIC_RED: 0xC85A5A,      // Red plastic (cones, hydrants)
  PLASTIC_BLUE: 0x5A7ABB,     // Blue plastic (recycling bins)
  CARDBOARD: 0xB8A890,        // Cardboard boxes
  WOOD_LIGHT: 0xC8B090,       // Light wood (pallets, crates)
  WOOD_DARK: 0x8B7355,        // Dark wood
};

// Helper function to get Three.js Color
export function getColor(colorKey) {
  return MESSENGER_PALETTE[colorKey];
}

// Color categories for easy access
export const SKY_COLORS = {
  primary: MESSENGER_PALETTE.SKY_PRIMARY,
  light: MESSENGER_PALETTE.SKY_LIGHT,
  cloud: MESSENGER_PALETTE.CLOUD_WHITE,
  nightZenith: MESSENGER_PALETTE.NIGHT_ZENITH,
  nightHorizon: MESSENGER_PALETTE.NIGHT_HORIZON,
};

export const BUILDING_COLORS = [
  MESSENGER_PALETTE.BUILDING_CREAM,
  MESSENGER_PALETTE.BUILDING_WARM_GRAY,
  MESSENGER_PALETTE.BUILDING_COOL_GRAY,
  MESSENGER_PALETTE.BUILDING_CONCRETE,
  MESSENGER_PALETTE.BUILDING_BRICK,
];

export const VEGETATION_COLORS = {
  tree: MESSENGER_PALETTE.TREE_GREEN,
  grass: MESSENGER_PALETTE.GRASS_GREEN,
  dark: MESSENGER_PALETTE.PLANT_DARK,
  trunk: MESSENGER_PALETTE.TREE_TRUNK,
};

export const CHARACTER_COLORS = {
  skin: MESSENGER_PALETTE.CHAR_SKIN,
  hair: MESSENGER_PALETTE.CHAR_HAIR,
  shirt: MESSENGER_PALETTE.CHAR_SHIRT,
  shirtCollar: MESSENGER_PALETTE.CHAR_SHIRT_COLLAR,
  skirt: MESSENGER_PALETTE.CHAR_SKIRT,
  socks: MESSENGER_PALETTE.CHAR_SOCKS,
  shoes: MESSENGER_PALETTE.CHAR_SHOES,
  bag: MESSENGER_PALETTE.CHAR_BAG,
  strap: MESSENGER_PALETTE.CHAR_STRAP,
};

export const UI_COLORS = {
  white: MESSENGER_PALETTE.UI_WHITE,
  black: MESSENGER_PALETTE.UI_BLACK,
  teal: MESSENGER_PALETTE.UI_TEAL,
  yellow: MESSENGER_PALETTE.UI_YELLOW,
};

// Convert hex to CSS color string
export function hexToCSS(hex) {
  return '#' + hex.toString(16).padStart(6, '0');
}

// CSS custom properties for use in stylesheets
export const CSS_VARS = `
:root {
  /* Sky */
  --sky-primary: #5BBFBA;
  --sky-light: #7DD1CD;
  --cloud-white: #FFFFFF;
  --night-zenith: #1B2838;
  --night-horizon: #2A3848;

  /* Ground */
  --asphalt: #6B7B7A;
  --sidewalk: #D4CFC5;

  /* Buildings */
  --building-cream: #E8DFD0;
  --building-warm-gray: #B8AFA0;
  --building-cool-gray: #8A9090;

  /* Vegetation */
  --tree-green: #6B9B5A;
  --grass-green: #7AAB6A;

  /* Accents */
  --yellow-accent: #E8B84A;
  --orange-accent: #D87A4A;
  --teal-accent: #5ABBB8;
  --red-accent: #C85A5A;

  /* Outlines */
  --outline-primary: #2A2A2A;
  --outline-soft: #4A4A4A;

  /* Shadows (never black!) */
  --shadow-tint: #5A6B7A;

  /* UI */
  --ui-white: #FFFFFF;
  --ui-black: #2A2A2A;
  --ui-teal: #5ABBB8;
  --ui-yellow: #E8B84A;
}
`;

// Japanese Machiya Building Colors (traditional wooden townhouse palette)
export const MACHIYA_COLORS = {
  // === WOOD TONES ===
  WOOD_LIGHT: 0xB8A080,       // Light aged wood (hinoki cypress)
  WOOD_MEDIUM: 0x8B7355,      // Medium brown (sugi cedar)
  WOOD_DARK: 0x5D4037,        // Dark stained wood (kuri chestnut)
  WOOD_WEATHERED: 0x6D5D4D,   // Weathered gray-brown
  WOOD_REDDISH: 0xA0522D,     // Reddish sienna (beni-kara)

  // === ROOF TILES ===
  ROOF_GRAY: 0x4A4A4A,        // Traditional gray kawara
  ROOF_DARK: 0x2F4F4F,        // Dark slate kawara
  ROOF_BLUE: 0x3D5A6A,        // Blue-gray glazed tiles

  // === LATTICE (KOSHI) ===
  LATTICE_DARK: 0x3D2B1F,     // Dark lattice wood
  LATTICE_MEDIUM: 0x5A4535,   // Medium lattice

  // === PLASTER/PAPER ===
  PLASTER_WHITE: 0xF5F5DC,    // Shikkui plaster (beige-white)
  PLASTER_CREAM: 0xE8DFC8,    // Aged plaster
  PAPER_SHOJI: 0xFAF8F0,      // Shoji screen paper

  // === ACCENTS ===
  ACCENT_RED: 0x8B0000,       // Deep red (bengara)
  ACCENT_VERMILLION: 0xC41E3A, // Vermillion (shu)
  ACCENT_GOLD: 0xD4AF37,      // Gold leaf
  NOREN_INDIGO: 0x264653,     // Indigo noren curtain
  NOREN_NAVY: 0x1C3A4D,       // Navy noren

  // === FOUNDATION ===
  STONE_BASE: 0x6B6B6B,       // Foundation stone
  STONE_DARK: 0x4A4A4A,       // Dark foundation
};

// Building variation presets for machiya generation
export const MACHIYA_PRESETS = {
  // Traditional shop front
  SHOP: {
    wall: MACHIYA_COLORS.WOOD_MEDIUM,
    roof: MACHIYA_COLORS.ROOF_GRAY,
    lattice: MACHIYA_COLORS.LATTICE_DARK,
    trim: MACHIYA_COLORS.WOOD_DARK,
    accent: MACHIYA_COLORS.NOREN_INDIGO,
  },
  // Residential
  RESIDENTIAL: {
    wall: MACHIYA_COLORS.WOOD_LIGHT,
    roof: MACHIYA_COLORS.ROOF_DARK,
    lattice: MACHIYA_COLORS.LATTICE_MEDIUM,
    trim: MACHIYA_COLORS.WOOD_MEDIUM,
    accent: MACHIYA_COLORS.PLASTER_CREAM,
  },
  // Wealthy merchant
  MERCHANT: {
    wall: MACHIYA_COLORS.PLASTER_CREAM,
    roof: MACHIYA_COLORS.ROOF_BLUE,
    lattice: MACHIYA_COLORS.LATTICE_DARK,
    trim: MACHIYA_COLORS.WOOD_DARK,
    accent: MACHIYA_COLORS.ACCENT_GOLD,
  },
  // Weathered/aged
  WEATHERED: {
    wall: MACHIYA_COLORS.WOOD_WEATHERED,
    roof: MACHIYA_COLORS.ROOF_GRAY,
    lattice: MACHIYA_COLORS.LATTICE_MEDIUM,
    trim: MACHIYA_COLORS.WOOD_DARK,
    accent: MACHIYA_COLORS.PLASTER_WHITE,
  },
};

// Street colors for Japanese downtown
export const STREET_GRID_COLORS = {
  MAIN_ROAD: 0x5A5A5A,        // Main street asphalt
  SIDE_ROAD: 0x6A6A6A,        // Side street (slightly lighter)
  COBBLESTONE: 0x7A7A70,      // Cobblestone alley
  CURB: 0x808080,             // Concrete curb
  GUTTER: 0x4A4A4A,           // Drainage gutter
  MARKING_WHITE: 0xE8E8E0,    // White road marking
  MARKING_YELLOW: 0xE8B84A,   // Yellow center line
};

export default MESSENGER_PALETTE;
