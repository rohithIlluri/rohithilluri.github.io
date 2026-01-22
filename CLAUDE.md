# CLAUDE.md

This file provides comprehensive guidance to Claude Code when working with this repository. **Update this file whenever significant changes are made to the codebase.**

---

## Project Overview

A **Messenger clone** - a mail delivery game on a tiny planet inspired by [Messenger by Abeto](https://messenger.abeto.co/). Players walk around a spherical world, customize their character, deliver mail to NPCs, and see other players in real-time.

**This is NOT a portfolio** - it's a pure game clone for learning/fun.

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Three.js | 0.170.0 | 3D WebGL rendering engine |
| three-mesh-bvh | 0.8.1 | BVH-based collision detection |
| GSAP | 3.12.5 | UI animation transitions |
| Zustand | 5.0.2 | Global state management (vanilla, no React) |
| Vite | 6.0.5 | Build tool and dev server |
| gh-pages | 6.2.0 | GitHub Pages deployment |

---

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run deploy   # Deploy to GitHub Pages
```

---

## Complete File Architecture

```
src/
├── main.js                     # Entry point + App class + LoadingPlanetPreview
├── World.js                    # Scene orchestrator (renderer, lighting, components)
├── Player.js                   # Character controller + procedural mesh (1.8 units tall)
├── Camera.js                   # Third-person camera with collision avoidance
├── InputManager.js             # Keyboard/touch input (event emitter pattern)
│
├── audio/
│   └── AudioManager.js         # Sound system (DISABLED but structure ready)
│
├── constants/
│   └── colors.js               # Master color palette (messenger.abeto.co exact)
│
├── data/
│   ├── quests.json             # Quest definitions (8 quests)
│   ├── customization.json      # Character customization options
│   └── dialogues.json          # NPC dialogue trees
│
├── effects/
│   ├── PostProcessing.js       # Bloom, SSAO, vignette, FXAA pipeline
│   └── particles/
│       ├── ParticleManager.js  # Manages leaf, firefly, bird emitters
│       └── Emitters.js         # Factory functions for emitter types
│
├── entities/
│   ├── NPC.js                  # NPC class (patrol, behavior, animation)
│   ├── NPCData.js              # NPC definitions (appearance, routes)
│   └── NPCManager.js           # NPC spawning and update loop
│
├── environment/
│   ├── TinyPlanet.js           # Spherical math (latLon, surface projection)
│   ├── Planet.js               # Planet builder (buildings, props, zones)
│   └── Street.js               # Legacy flat street mode (deprecated)
│
├── optimization/
│   └── LODManager.js           # Level of detail system (infrastructure)
│
├── shaders/
│   ├── toon.js                 # Cel-shading material factory
│   └── sky.js                  # Dynamic sky gradient shader
│
├── stores/
│   └── gameStore.js            # Zustand state (player, quests, inventory, UI)
│
└── systems/
    ├── QuestManager.js         # Quest progression and objectives
    ├── MailSystem.js           # Mailbox spawning and delivery
    ├── InventoryManager.js     # Mail items, coins, reputation
    └── DialogueManager.js      # NPC conversation trees
```

---

## Core System Details

### main.js - Application Entry
- **App class**: Main controller, manages lifecycle
- **LoadingPlanetPreview**: 3D mini-planet on loading screen
- **Lifecycle**: Load InputManager → Init World → Show BEGIN → Start render loop

### World.js - Scene Orchestrator
- **Responsibilities**: Renderer setup, lighting, scene rendering, component init
- **Quality Presets**:
  - HIGH: 2048 shadowmap, SSAO + Bloom, 60fps
  - MEDIUM: 1024 shadowmap, Bloom only
  - LOW: 512 shadowmap, minimal post-processing (mobile)
- **Lighting**:
  - Ambient: 0.2 intensity
  - Directional (Sun): 1.8 intensity, casts shadows
  - Rim Light: 0.3 intensity (back-light silhouettes)
  - Hemisphere: Sky + ground blending

### Player.js - Character Controller
- **Size**: 1.8 units tall, 6-head anime proportions
- **Visual**: Large anime eyes, blush marks, yellow messenger bag, chunky sneakers
- **Movement**: Spherical mode (planet surface) or flat mode (legacy)
- **Speed**: 4 units/sec walk, 8 units/sec run
- **Animation States**: IDLE (breathing), WALK (9 rad/sec), RUN (14 rad/sec)
- **Collision**: Capsule (0.4 radius, 1.8 height), 4-direction raycasting

### Camera.js - Third-Person Camera
- **Distance**: 8 units behind player
- **Height**: 4 units above player
- **Smoothness**: 0.25 lerp factor
- **Spherical Mode**: Maintains up-vector alignment with planet surface

### TinyPlanet.js - Spherical World Math
- **Radius**: 50 units (configurable)
- **Key Methods**:
  - `getUpVector(position)`: Outward direction from center
  - `getLocalAxes(position, heading)`: Forward/right/up tangent vectors
  - `projectToSurface(position)`: Project point onto sphere
  - `latLonToPosition(lat, lon)`: Spherical coords to world position
  - `moveOnSurface(position, direction, distance)`: Walk on surface
- **Zones** (by lat/lon):
  - Town: -30° to 30° lat (front/center)
  - Forest: Back side (opposite town)
  - Beach: 90° longitude (right side)
  - Mountain: 30° to 90° lat (north pole)
  - Harbor: -90° to -30° lat (south pole)

### gameStore.js - State Management
- **State Sections**:
  - Game: loading/menu/customization/playing/dialogue
  - Player: position, rotation, running, interacting
  - Appearance: hair, shirt, skirt, shoes, bag
  - Inventory: mail items (max 5), coins, reputation
  - Quests: active/completed/available with objectives
  - Dialogue: NPC conversation state
  - UI: HUD visibility, modals, notifications
  - Settings: graphics, audio, controls, accessibility
  - Statistics: mail delivered, quests completed, distance, playtime
- **Persistence**: localStorage save/load

---

## Visual Style Rules (CRITICAL)

### Color Philosophy
```
NEVER use pure black (#000000)
All dark colors must be soft blue-grays
Shadows: #5A6B7A (blue-gray) or #4A4063 (purple-gray)
```

### Cel-Shading (4-Band)
```javascript
// Gradient map bands
Shadow:    0.15 (38/255)
Mid:       0.4  (102/255)
Light:     0.7  (178/255)
Highlight: 1.0  (255/255)
```

### Outlines
- Width: 2px
- Color: #2A2A2A (near-black, NEVER pure black)
- Applied to: Characters, important objects

### Sky Colors
- Day: #5BBFBA (turquoise)
- Night: #1B2838 (deep blue)

### Building Palette
```javascript
cream:      '#E8DFD0'
peach:      '#E8D0C0'
sage:       '#C0D8C0'
lavender:   '#D0C8E8'
terracotta: '#D8B8A0'
mint:       '#B8D8D0'
```

### Character Colors
```javascript
bag:        '#F5D547' (yellow)
shoes:      '#F5D547' (yellow)
skirt:      '#8B2252' (red/maroon)
shirt:      '#1A1A2E' (dark)
```

---

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Shift | Run |
| E | Interact with NPCs/buildings |
| N | Toggle day/night |
| Escape | Menu/UI toggle |

---

## Feature Implementation Status

### Fully Implemented
- 3D spherical planet with proper orientation
- Procedural anime-styled player character
- Third-person camera follow system
- NPC system with patrol routes and behaviors
- Day/night cycle with smooth transitions
- Cel-shading with custom toon materials
- Outline rendering
- Particle system (leaves, fireflies, birds)
- Quest system with objectives
- Mail delivery mechanics
- Inventory management
- Save/load to localStorage
- Post-processing effects (bloom, SSAO, vignette, FXAA)
- Quality presets (low/medium/high)
- UI HUD and modals

### Partially Implemented
- Dialogue system (structure present, content minimal)
- Character customization (data structure exists)
- Building interactions (basic modal)
- NPC appearances (several presets)

### Not Implemented / Disabled
- Audio system (code present, commented out)
- Multiplayer/Socket.io (planned)
- Mobile touch controls (framework ready)
- Accessibility features (structure ready)

---

## Code Patterns & Conventions

### 1. Spherical Coordinates
```javascript
// Latitude: -90° (south) to 90° (north)
// Longitude: -180° to 180°
const pos = tinyPlanet.latLonToPosition(lat, lon);
```

### 2. Local Orientation Vectors
```javascript
// Always use these for character/camera orientation on planet
const { forward, right, up } = tinyPlanet.getLocalAxes(position, heading);
```

### 3. Material Creation
```javascript
// Use toon.js factory functions
import { createToonMaterial, createOutlineMesh } from './shaders/toon.js';
const material = createToonMaterial({ color: '#E8DFD0' });
```

### 4. State Access
```javascript
// Zustand store with getters/setters
import { useGameStore } from './stores/gameStore.js';
const state = useGameStore.getState();
state.setPlayerPosition(newPos);
```

### 5. Collision Detection
```javascript
// Raycasting for player collision
// BVH tree for efficiency
// Capsule shape (0.4 radius, 1.8 height)
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 6 MB |
| Frame Rate | 60 FPS desktop, 30 FPS mobile |
| Load Time (4G) | < 5 seconds |

### Optimization Techniques
- Quality presets with auto-detection
- Particle count scaling by quality
- LOD system infrastructure
- Efficient raycasting with BVH
- Material pooling via factories
- Vite code splitting

---

## Component Interaction Flow

```
main.js (App)
    ↓
InputManager
    ↓
World (orchestrator)
    ├── Renderer
    ├── Lighting (ambient + directional + rim + hemisphere)
    ├── Sky shader
    ├── Planet (TinyPlanet + Planet builder)
    │   └── Collision meshes
    ├── Player
    │   ├── Procedural mesh + outline
    │   ├── Animation state machine
    │   └── Interaction detection
    ├── Camera (follows player)
    ├── NPCManager
    │   └── NPC instances
    ├── ParticleManager
    │   ├── Leaves
    │   ├── Fireflies
    │   └── Birds
    ├── PostProcessing
    └── Game Systems
        ├── QuestManager
        ├── MailSystem
        ├── InventoryManager
        └── DialogueManager

gameStore (Zustand)
    ├── Player state sync
    ├── Inventory tracking
    ├── Quest progression
    ├── UI state
    └── Settings persistence
```

---

## Reference Materials

- **Live Reference**: https://messenger.abeto.co/
- **Screenshots**: `.playwright-mcp/messenger-*.png`
- **Plan**: `.ralph/prompt.md`

---

## Updating This Document

**When to update CLAUDE.md:**
1. Adding new files or systems
2. Changing core architecture
3. Adding new features
4. Modifying visual style rules
5. Changing state management patterns
6. Adding new dependencies

**How to update:**
1. Document the change in the appropriate section
2. Update the file architecture tree if needed
3. Update feature status if features were added/completed
4. Add new code patterns if introducing conventions
