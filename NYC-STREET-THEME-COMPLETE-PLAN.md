# NYC STREET THEME: COMPLETE PROJECT PLAN
## Immersive Portfolio Experience - Implementation Blueprint

**Reference:** https://messenger.abeto.co/
**Studio Inspiration:** Abeto (abeto.co) - Interactive Web Experiences
**Theme:** New York City Streets - Urban Portfolio Experience

---

# CLAUDE AGENT DIRECTIVE

> **IMPORTANT:** All Claude agents working on this repository MUST read and adhere to this document.
> This plan defines the visual direction, technical architecture, and implementation standards for the NYC Street Theme portfolio revamp.
> Any modifications to the portfolio should align with the specifications outlined here.

---

# TABLE OF CONTENTS

1. [Project Vision & Concept](#1-project-vision--concept)
2. [Art Direction & Visual Style](#2-art-direction--visual-style)
3. [Technical Stack & Architecture](#3-technical-stack--architecture)
4. [Asset Requirements & Sources](#4-asset-requirements--sources)
5. [3D World Design](#5-3d-world-design)
6. [Interactive Elements & Gameplay](#6-interactive-elements--gameplay)
7. [Portfolio Integration](#7-portfolio-integration)
8. [Performance Specifications](#8-performance-specifications)
9. [Implementation Phases](#9-implementation-phases)
10. [File Structure & Conventions](#10-file-structure--conventions)

---

# 1. PROJECT VISION & CONCEPT

## Core Concept

Transform the portfolio into an **immersive 3D NYC street experience** where visitors can:
- Walk through stylized New York City streets
- Discover portfolio sections as interactive storefronts/buildings
- Experience the energy and atmosphere of NYC in a unique web format
- Explore at their own pace in a non-linear fashion

## Tagline Ideas
- *"Every block tells a story. Welcome to my corner of the city."*
- *"Navigate my world. One street at a time."*
- *"The city that never sleeps. The portfolio that never stops."*

## Inspiration Sources

| Source | What to Learn |
|--------|---------------|
| [Messenger by Abeto](https://messenger.abeto.co/) | Tiny planet, exploration, atmosphere |
| NYC Street Photography | Color palette, urban textures |
| Lo-fi Hip Hop Aesthetics | Warm tones, cozy vibes, night scenes |
| Pixel Art Cities | Stylized buildings, neon signs |
| Spider-Verse Art Style | Bold colors, halftone patterns, urban energy |

## Unique Selling Points

1. **Street-level exploration** - Walk through NYC blocks, not menus
2. **Day/Night cycle** - Dynamic atmosphere changes
3. **Interactive storefronts** - Each building = portfolio section
4. **Ambient city sounds** - Immersive audio landscape
5. **Easter eggs** - Hidden NYC references for explorers

---

# 2. ART DIRECTION & VISUAL STYLE

## Visual Aesthetic: "Lo-fi NYC"

A stylized, warm interpretation of New York City that feels:
- **Nostalgic** - Like a memory of NYC, not photorealistic
- **Cozy** - Warm lighting, inviting spaces
- **Stylized** - Low-poly with hand-painted textures
- **Vibrant** - Rich colors, neon accents at night

## Color Palette

### Day Mode
| Element | Hex Code | Description |
|---------|----------|-------------|
| Sky (Top) | `#87CEEB` | Light blue |
| Sky (Horizon) | `#FFF5E6` | Warm cream |
| Buildings (Brick) | `#B5651D`, `#8B4513` | Warm browns |
| Buildings (Stone) | `#D4C4B5`, `#C9B8A8` | Sandstone tones |
| Street | `#4A4A4A` | Asphalt gray |
| Sidewalk | `#C0C0C0` | Concrete gray |
| Foliage | `#228B22`, `#2E8B57` | Tree greens |
| Accents | `#FFD700`, `#FF6B35` | Taxi yellow, orange |

### Night Mode (Primary)
| Element | Hex Code | Description |
|---------|----------|-------------|
| Sky (Top) | `#0D1B2A` | Deep navy |
| Sky (Horizon) | `#1B263B` | Dark blue |
| Building Windows | `#FFE066`, `#FFA500` | Warm interior glow |
| Neon Signs | `#FF1493`, `#00FFFF`, `#39FF14` | Pink, cyan, green |
| Street Lights | `#FFD700` | Golden glow |
| Wet Streets | `#2C3E50` | Reflective dark |
| Steam/Fog | `#FFFFFF` @ 30% opacity | Atmospheric haze |

### UI Overlay Colors
| Element | Hex Code | Usage |
|---------|----------|-------|
| Primary Text | `#FFFFFF` | Headings |
| Secondary Text | `#B0B0B0` | Body text |
| Accent | `#FF6B35` | Interactive elements |
| Background | `#1A1A1A` @ 90% | UI panels |
| Border | `#333333` | Panel borders |

## Typography

### 3D World Signage
- **Font:** "Bebas Neue" or "Oswald" - Bold, condensed, urban feel
- **Style:** ALL CAPS for building signs
- **Effects:** Neon glow, slight bevel

### UI/HUD
- **Font:** "Inter" (current) - Clean, readable
- **Weights:** 400 (body), 600 (emphasis), 700 (headings)

## Shader & Rendering Style

### Cel-Shading Approach
```
Light Bands: 3 (bright, mid, shadow)
Shadow Color: Slightly purple-shifted (#2D1B4E undertone)
Outline: 1-2px dark outline on geometry edges
Rim Light: Subtle cyan/orange rim on character edges
```

### Post-Processing Effects
1. **Bloom** - On neon signs and bright lights
2. **Vignette** - Subtle darkening at edges
3. **Film Grain** - Very subtle (2-5%), toggleable
4. **Color Grading** - Warm highlights, cool shadows
5. **Ambient Occlusion** - Soft shadows in corners

---

# 3. TECHNICAL STACK & ARCHITECTURE

## Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **3D Engine** | Three.js | ^0.160+ | WebGL rendering |
| **React Integration** | @react-three/fiber | ^8.15+ | React bindings |
| **3D Helpers** | @react-three/drei | ^9.88+ | Useful abstractions |
| **Physics** | @react-three/rapier | ^1.2+ | Collision & physics |
| **Animation** | GSAP | ^3.12+ | Complex animations |
| **State Management** | Zustand | ^4.4+ | Global state |
| **Build Tool** | Vite | ^5.0+ | Fast bundling |
| **Styling** | Tailwind CSS | ^3.3+ | Utility CSS |

## File Format Standards

| Asset Type | Format | Compression | Tool |
|------------|--------|-------------|------|
| 3D Models | `.glb` | Draco | gltf-transform |
| Textures | `.ktx2` / `.webp` | Basis Universal | toktx |
| Audio (Music) | `.ogg` / `.mp3` | 128kbps | Audacity |
| Audio (SFX) | `.ogg` | 96kbps | Audacity |
| Fonts | `.woff2` | Compressed | Google Fonts |

## Project Architecture

```
client/
├── src/
│   ├── components/
│   │   ├── sections/          # Existing portfolio sections
│   │   ├── layout/            # Navigation, footer
│   │   ├── ui/                # UI components
│   │   └── three/             # NEW: 3D components
│   │       ├── World.jsx           # Main 3D scene
│   │       ├── Player.jsx          # Character controller
│   │       ├── Camera.jsx          # Third-person camera
│   │       ├── Buildings/          # NYC building components
│   │       │   ├── SkillsBuilding.jsx
│   │       │   ├── ProjectsBuilding.jsx
│   │       │   ├── MusicBuilding.jsx
│   │       │   └── ContactBuilding.jsx
│   │       ├── Environment/        # World elements
│   │       │   ├── Street.jsx
│   │       │   ├── Sidewalk.jsx
│   │       │   ├── Streetlight.jsx
│   │       │   ├── TrafficLight.jsx
│   │       │   ├── Subway.jsx
│   │       │   └── Props.jsx
│   │       ├── Effects/            # Visual effects
│   │       │   ├── NeonSign.jsx
│   │       │   ├── Steam.jsx
│   │       │   └── Rain.jsx
│   │       ├── UI/                 # 3D UI overlays
│   │       │   ├── BuildingLabel.jsx
│   │       │   ├── MiniMap.jsx
│   │       │   └── Controls.jsx
│   │       └── hooks/              # Custom hooks
│   │           ├── usePlayer.js
│   │           ├── useNPCs.js
│   │           └── useAudio.js
│   ├── stores/                # Zustand stores
│   │   ├── gameStore.js           # Game state
│   │   └── portfolioStore.js      # Portfolio data
│   ├── assets/
│   │   ├── models/            # 3D models (.glb)
│   │   ├── textures/          # Textures (.ktx2, .webp)
│   │   ├── audio/             # Sound files
│   │   └── fonts/             # Web fonts
│   └── constants/
│       ├── theme.js           # Existing theme
│       └── worldConfig.js     # NEW: World configuration
```

---

# 4. ASSET REQUIREMENTS & SOURCES

## 3D Models Needed

### Buildings (Low-Poly Stylized)

| Model | Purpose | Poly Target | Source |
|-------|---------|-------------|--------|
| Brownstone | Skills building | < 2000 | Sketchfab/Custom |
| Corner Deli | Music section | < 1500 | Poly.pizza |
| Office Tower | Projects | < 3000 | Kenney Assets |
| Subway Entrance | Navigation | < 1000 | Custom |
| Coffee Shop | Contact | < 1500 | Sketchfab |
| Water Tower | Decoration | < 500 | Quaternius |
| Fire Escape | Decoration | < 800 | Custom |

### Street Props

| Model | Quantity | Poly Target | Source |
|-------|----------|-------------|--------|
| Street Light | 12+ | < 300 | Kenney Assets |
| Traffic Light | 4+ | < 400 | Poly.pizza |
| Fire Hydrant | 6+ | < 200 | Kenney Assets |
| Mailbox | 4+ | < 200 | Kenney Assets |
| Bench | 4+ | < 300 | Quaternius |
| Tree (City) | 8+ | < 500 | Nature pack |
| Trash Can | 6+ | < 150 | Kenney Assets |
| Newspaper Stand | 2+ | < 400 | Custom |
| Hot Dog Cart | 1 | < 600 | Sketchfab |
| Yellow Cab | 4+ | < 800 | Sketchfab |

### Character

| Model | Purpose | Poly Target | Source |
|-------|---------|-------------|--------|
| Player Character | Main avatar | < 5000 | Mixamo + Custom |
| NPC Pedestrian x3 | Ambient life | < 3000 each | Mixamo |

## Free Asset Sources

### Kenney Assets (CC0 - 100% Free)
**URL:** https://kenney.nl/assets
- City Kit Suburban
- City Kit Commercial
- Nature Kit

### Sketchfab (Filter: Free + Downloadable)
**Search Terms:**
- "low poly NYC building"
- "stylized brownstone"
- "cartoon city props"
- "lo-fi urban"

### Poly.pizza (Free)
**URL:** https://poly.pizza/
- Filter by "Buildings", "Urban", "Props"

### Quaternius (Free)
**URL:** https://quaternius.com/
- Ultimate City Pack (free)
- Props pack

### Mixamo (Free with Adobe Account)
**URL:** https://www.mixamo.com/
- Character models
- Walking, idle, interaction animations

## Audio Assets

### Ambient Sounds
| Sound | Source | License |
|-------|--------|---------|
| City Traffic (distant) | Freesound | CC0 |
| Subway rumble | Freesound | CC0 |
| Pedestrian chatter (muffled) | Freesound | CC-BY |
| Bird sounds (pigeons) | Freesound | CC0 |
| HVAC/AC hum | Freesound | CC0 |

### Music
| Type | Source | Style |
|------|--------|-------|
| Background | Pixabay Music | Lo-fi hip hop, chill |
| Night theme | Pixabay Music | Jazz, smooth |
| Building interiors | Pixabay Music | Ambient, minimal |

### SFX
| Sound | Usage |
|-------|-------|
| Footsteps (concrete) | Player movement |
| Door open/close | Building entry |
| Neon buzz | Near signs |
| UI click | Menu interactions |

---

# 5. 3D WORLD DESIGN

## World Layout

```
                    [NORTH - Projects District]
                           │
                    ┌──────┴──────┐
                    │   PROJECTS  │
                    │   TOWER     │
                    └──────┬──────┘
                           │
    [WEST]          MAIN STREET           [EAST]
    ┌─────┐    ═══════════════════    ┌─────┐
    │MUSIC│                           │SKILLS│
    │DELI │←── CROSSWALK ────────────→│BLDG  │
    └─────┘    ═══════════════════    └─────┘
                           │
                    ┌──────┴──────┐
                    │  CONTACT    │
                    │  COFFEE     │
                    └──────┬──────┘
                           │
                    [SOUTH - Spawn Point]

    ════ = Street
    ─── = Sidewalk
    │ = Cross street
```

## Block Dimensions

```
Street Width: 10 units
Sidewalk Width: 3 units
Building Lot: 8-12 units wide
Block Length: 40 units
Total World Size: ~100 x 100 units
```

## Key Locations

### 1. Spawn Point (South)
- **Description:** Subway exit, player emerges here
- **Features:** Subway sign, staircase, newsstand
- **Mood:** Arrival, anticipation

### 2. Skills Building (East Side)
- **Type:** Classic brownstone with fire escapes
- **Signage:** Neon sign "SKILLS" or "WORKSHOP"
- **Interior trigger:** Opens skills modal/overlay
- **Details:** Tools in window display, blueprints

### 3. Projects Tower (North)
- **Type:** Modern office building, glass facade
- **Signage:** Rooftop sign "PROJECTS"
- **Interior trigger:** Opens projects gallery
- **Details:** Screens in windows showing projects

### 4. Music Deli (West Side)
- **Type:** Corner bodega/record shop
- **Signage:** Neon "VINYL" or "RECORDS"
- **Interior trigger:** Opens music section
- **Details:** Records in window, speakers outside

### 5. Contact Coffee Shop (South-Center)
- **Type:** Cozy coffee shop
- **Signage:** Chalkboard style "CONTACT"
- **Interior trigger:** Opens contact form
- **Details:** Steaming coffee cups, outdoor seating

## Environmental Details

### Street Level
- Cracked sidewalks with texture variation
- Manhole covers (interactive? steam?)
- Crosswalk stripes
- Puddles (if rain enabled)
- Leaves/trash particles

### Building Level
- Window variety (lit/unlit pattern)
- Fire escapes on brownstones
- AC units
- Water tanks on roofs
- Billboards/signs

### Atmosphere
- Distant buildings (2D sprites/low-poly)
- Sky gradient with moving clouds
- Birds flying occasionally
- Subtle fog/haze at distance

---

# 6. INTERACTIVE ELEMENTS & GAMEPLAY

## Player Controls

### Keyboard (Desktop)
| Key | Action |
|-----|--------|
| W / ↑ | Move forward |
| S / ↓ | Move backward |
| A / ← | Move left |
| D / → | Move right |
| Space | Jump (optional) |
| Shift | Run |
| E | Interact |
| M | Toggle minimap |
| N | Toggle day/night |

### Touch (Mobile)
- **Left side:** Virtual joystick for movement
- **Right side:** Camera drag area
- **Bottom center:** Interact button (context-sensitive)

### Gamepad (Optional)
- Left stick: Move
- Right stick: Camera
- A/X button: Interact

## Camera System

```javascript
// Third-person follow camera settings
const CAMERA_CONFIG = {
  distance: 8,           // Units behind player
  height: 4,             // Units above player
  lookAheadDistance: 2,  // Look slightly ahead of player
  smoothing: 0.1,        // Lerp factor (lower = smoother)
  collisionPadding: 0.5, // Distance from walls
  fov: 60,
  nearClip: 0.1,
  farClip: 200
};
```

## Building Interactions

### Approach Detection
- **Trigger distance:** 3-4 units from building door
- **Visual cue:** Door highlight, "Press E" prompt
- **Audio cue:** Soft chime

### Entry Transition
1. Player approaches building door
2. Screen fades to black (0.5s)
3. Portfolio section loads as overlay
4. 3D world stays loaded but paused
5. Close button returns to street

### Modal Overlays
Each building opens a styled modal with the existing portfolio section content:

```jsx
// Example structure
<BuildingModal isOpen={activeBuilding === 'skills'}>
  <Skills /> {/* Existing component */}
</BuildingModal>
```

## Day/Night Cycle

### Automatic Mode
- Full cycle: 10 minutes real-time
- Dawn: 0:00 - 1:30
- Day: 1:30 - 5:00
- Dusk: 5:00 - 6:30
- Night: 6:30 - 10:00

### Manual Toggle
- Press 'N' to instantly switch
- Smooth transition: 2 seconds

### Visual Changes

| Element | Day | Night |
|---------|-----|-------|
| Sky | Blue gradient | Dark blue/purple |
| Ambient light | 0.8 intensity | 0.2 intensity |
| Directional light | Yellow-white | Blue-ish moonlight |
| Building windows | Some lit | Most lit (warm glow) |
| Street lights | Off | On (yellow glow) |
| Neon signs | Subtle | Full glow + bloom |
| Fog | Light haze | Heavier, atmospheric |

## Easter Eggs & Secrets

1. **Pigeon on fire escape** - Click for a coo sound
2. **Subway grate steam** - Appears randomly
3. **Distant siren** - Occasional audio
4. **Street performer** - NPC playing music (near music building)
5. **Hidden rooftop** - Accessible via fire escape (bonus content?)

---

# 7. PORTFOLIO INTEGRATION

## Existing Sections → Buildings Mapping

| Section | Building | Style | Icon |
|---------|----------|-------|------|
| Hero | Spawn area billboard | Large mural of profile | 🏠 |
| Skills | Brownstone workshop | Industrial, crafty | 🛠️ |
| Projects | Office tower | Modern, screens | 💼 |
| Music | Record shop/deli | Cozy, vinyl aesthetic | 🎵 |
| Movies | Theater (optional) | Marquee, posters | 🎬 |
| Contact | Coffee shop | Warm, inviting | ☕ |
| Stats | Info kiosk (street) | Digital display | 📊 |

## Transition Between 2D and 3D

### Entry Point
```
Landing page → "Enter NYC" button → 3D world loads
```

### Fallback Mode
```
If WebGL not supported → Standard 2D portfolio
If user prefers → "Classic View" toggle available
```

### Loading Strategy
1. Show styled loading screen (NYC themed)
2. Load critical 3D assets first (~2MB)
3. Show world with LOD models
4. Stream full quality in background
5. Replace models as they load

## State Synchronization

```javascript
// Zustand store for game state
const useGameStore = create((set) => ({
  // World state
  currentBuilding: null,
  dayNightCycle: 'night',  // Default to night (more dramatic)
  playerPosition: { x: 0, y: 0, z: 0 },

  // Portfolio state
  visitedBuildings: [],

  // Actions
  setCurrentBuilding: (building) => set({ currentBuilding: building }),
  toggleDayNight: () => set((state) => ({
    dayNightCycle: state.dayNightCycle === 'day' ? 'night' : 'day'
  })),
  markVisited: (building) => set((state) => ({
    visitedBuildings: [...state.visitedBuildings, building]
  }))
}));
```

---

# 8. PERFORMANCE SPECIFICATIONS

## Target Metrics

| Metric | Target | Mobile Target |
|--------|--------|---------------|
| Initial Load | < 3 MB | < 2 MB |
| Total Assets | < 15 MB | < 10 MB |
| Frame Rate | 60 FPS | 30 FPS |
| Load Time (4G) | < 5 seconds | < 7 seconds |
| Memory Usage | < 300 MB | < 200 MB |

## Optimization Techniques

### Asset Optimization

| Technique | Tool | Savings |
|-----------|------|---------|
| Draco mesh compression | gltf-transform | ~66% |
| KTX2 texture compression | toktx | ~50% |
| GZIP transfer | Server config | ~30% |
| Texture atlasing | Custom | Variable |
| LOD models | Blender | Variable |

### Runtime Optimization

1. **Frustum culling** - Built into Three.js
2. **Instanced rendering** - For repeated props (lights, hydrants)
3. **LOD switching** - Near/far model variants
4. **Object pooling** - For particles (steam, leaves)
5. **Occlusion culling** - Hide buildings behind player
6. **Texture streaming** - Load high-res as needed

### Mobile Optimizations

```javascript
// Detect mobile and reduce quality
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

const QUALITY_SETTINGS = {
  mobile: {
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    shadowMapSize: 512,
    maxLights: 4,
    enableBloom: false,
    enableSSAO: false,
    drawDistance: 50
  },
  desktop: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    shadowMapSize: 1024,
    maxLights: 8,
    enableBloom: true,
    enableSSAO: true,
    drawDistance: 100
  }
};
```

## Loading Strategy

```
Phase 1: Critical (< 1 MB)
├── Player model (simplified)
├── Ground plane
├── Nearest building (LOD0)
└── Essential textures

Phase 2: Visible (< 3 MB)
├── All visible buildings (LOD0)
├── Street props (instanced)
├── Skybox
└── UI assets

Phase 3: Background (< 10 MB)
├── High-detail models
├── Full textures
├── Audio files
└── NPCs & animations
```

---

# 9. IMPLEMENTATION PHASES

## Phase 1: Foundation
**Goal:** Basic 3D scene with navigation

- [ ] Install Three.js dependencies (@react-three/fiber, drei, rapier)
- [ ] Create basic 3D canvas component
- [ ] Implement ground plane and skybox
- [ ] Add first-person/third-person camera
- [ ] Basic WASD movement controls
- [ ] Mobile touch controls (virtual joystick)
- [ ] Loading screen with progress

## Phase 2: World Building
**Goal:** NYC street environment

- [ ] Import/create building models
- [ ] Set up street grid layout
- [ ] Add street props (lights, hydrants, etc.)
- [ ] Implement collision meshes
- [ ] Add basic lighting (ambient + directional)
- [ ] Day/night toggle functionality
- [ ] Distant city skyline (2D backdrop)

## Phase 3: Interactions
**Goal:** Building entry and portfolio integration

- [ ] Building proximity detection
- [ ] Interaction prompts (Press E)
- [ ] Modal overlay system for buildings
- [ ] Connect existing portfolio sections
- [ ] Smooth transitions (fade in/out)
- [ ] State management (visited buildings)
- [ ] Minimap UI

## Phase 4: Visual Polish
**Goal:** Achieve the aesthetic vision

- [ ] Implement cel-shading/toon materials
- [ ] Add neon sign effects with bloom
- [ ] Window glow system (night mode)
- [ ] Post-processing pipeline
- [ ] Particle effects (steam, leaves)
- [ ] Weather effects (optional rain)
- [ ] Character animations

## Phase 5: Audio
**Goal:** Immersive soundscape

- [ ] Background music system
- [ ] Ambient city sounds
- [ ] Footstep sounds (surface-aware)
- [ ] Building-specific audio
- [ ] UI sound effects
- [ ] Volume controls
- [ ] Spatial audio positioning

## Phase 6: Optimization & Launch
**Goal:** Production-ready performance

- [ ] Asset compression pipeline
- [ ] Implement LOD system
- [ ] Memory profiling and fixes
- [ ] Mobile testing and optimization
- [ ] Accessibility features
- [ ] Analytics integration
- [ ] Deployment and CDN setup

---

# 10. FILE STRUCTURE & CONVENTIONS

## Naming Conventions

### Files
```
Components: PascalCase.jsx (e.g., SkillsBuilding.jsx)
Hooks: camelCase.js (e.g., usePlayer.js)
Stores: camelCase.js (e.g., gameStore.js)
Constants: camelCase.js (e.g., worldConfig.js)
Assets: kebab-case (e.g., skills-building.glb)
```

### Components
```jsx
// Example component structure
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function SkillsBuilding({ position = [0, 0, 0], onInteract }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    // Animation logic
  });

  return (
    <group position={position}>
      {/* Building mesh */}
      {/* Collision box */}
      {/* Neon sign */}
    </group>
  );
}
```

### Git Commit Conventions
```
feat: Add new feature
fix: Bug fix
style: Visual/styling changes
refactor: Code restructuring
perf: Performance improvements
docs: Documentation updates
chore: Maintenance tasks

Examples:
feat: Add Skills building with neon sign
fix: Resolve collision detection on mobile
perf: Implement LOD for distant buildings
```

## Configuration Files

### worldConfig.js
```javascript
export const WORLD_CONFIG = {
  // World dimensions
  gridSize: 100,
  blockSize: 40,
  streetWidth: 10,
  sidewalkWidth: 3,

  // Buildings
  buildings: {
    skills: { position: [15, 0, 0], rotation: [0, -Math.PI/2, 0] },
    projects: { position: [0, 0, -30], rotation: [0, 0, 0] },
    music: { position: [-15, 0, 0], rotation: [0, Math.PI/2, 0] },
    contact: { position: [0, 0, 20], rotation: [0, Math.PI, 0] }
  },

  // Player
  player: {
    spawnPosition: [0, 0, 35],
    walkSpeed: 4,
    runSpeed: 8,
    height: 1.7
  },

  // Camera
  camera: {
    distance: 8,
    height: 4,
    fov: 60
  },

  // Lighting
  lighting: {
    day: {
      ambient: 0.8,
      directional: 1.0,
      color: '#FFF5E0'
    },
    night: {
      ambient: 0.2,
      directional: 0.3,
      color: '#4466AA'
    }
  }
};
```

---

# QUICK START COMMANDS

```bash
# Install 3D dependencies
npm install three @react-three/fiber @react-three/drei @react-three/rapier

# Install animation library
npm install gsap

# Install state management
npm install zustand

# Asset compression tools (global)
npm install -g @gltf-transform/cli

# Compress a model
gltf-transform draco model.glb model-compressed.glb
gltf-transform ktx2 model-compressed.glb model-final.glb
```

---

# SUMMARY

## What Makes This Special

1. **Immersive portfolio** - Not just a website, an experience
2. **NYC atmosphere** - Captures the energy and vibe of the city
3. **Exploration-based** - Discover content naturally
4. **Day/night modes** - Dynamic, living world
5. **Performance-first** - Fast load, smooth experience
6. **Mobile-friendly** - Touch controls, optimized assets

## Success Criteria

1. **< 5 second load time** on 4G connection
2. **60 FPS** on mid-range desktop
3. **30 FPS** on modern mobile devices
4. **Intuitive navigation** - No tutorial needed
5. **Memorable experience** - Visitors remember the portfolio

## Key References

- [Messenger by Abeto](https://messenger.abeto.co/) - Primary inspiration
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Drei Helpers](https://github.com/pmndrs/drei)
- [Summer Afternoon Case Study](https://www.awwwards.com/summer-afternoon.html)

---

**Document Version:** 1.0
**Last Updated:** January 2026
**For:** Claude Code Implementation
**Branch:** claude/nyc-street-theme-*

---

# APPENDIX: CLAUDE AGENT CHECKLIST

Before making changes, every Claude agent should:

- [ ] Read this entire document
- [ ] Check current implementation phase
- [ ] Follow naming conventions
- [ ] Maintain performance targets
- [ ] Test on both desktop and mobile
- [ ] Use appropriate commit messages
- [ ] Update this document if plans change

**Remember:** Consistency is key. When in doubt, refer to this document.
