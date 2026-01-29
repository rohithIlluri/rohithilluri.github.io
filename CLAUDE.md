# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A **Messenger clone** - a mail delivery game on a tiny planet inspired by [Messenger by Abeto](https://messenger.abeto.co/). Players walk around a spherical world, customize their character, deliver mail to NPCs, and see other players in real-time.

**This is NOT a portfolio** - it's a pure game clone for learning/fun.

---

## Current Status Assessment (v0.9.0)

### Completion Summary

| System | Completion | Quality |
|--------|------------|---------|
| Visual Rendering | 95% | Excellent |
| Tiny Planet/Movement | 100% | Excellent |
| Player Controller | 100% | Excellent |
| Camera System | 100% | Excellent (frame-rate independent) |
| NPC Visuals/Animation | 85% | Good |
| Day/Night Cycle | 100% | Excellent |
| Post-Processing | 90% | Excellent |
| UI/HUD | 90% | Excellent |
| Dialogue System | 95% | Excellent |
| Mail Delivery Loop | 90% | Excellent |
| Character Customization | 85% | Good (UI complete) |
| Quest Integration | 90% | Excellent |
| Audio | 80% | Good (procedural SFX) |
| Test Infrastructure | 80% | Good (75 tests) |
| Mobile Touch Controls | 75% | Good |
| Multiplayer | 0% | Not started |

**Overall: ~90% complete** (Target: 60%+ ACHIEVED)

---

## Root Cause Analysis (RCA)

### Critical Issues Identified

#### 1. Infrastructure-First Development Pattern
**Problem**: Excellent backend infrastructure (Zustand stores, managers, data files) was built without completing frontend UI/gameplay integration.

**Evidence**:
- `gameStore.js`: 500+ lines of complete state management
- `QuestManager.js`: Quest logic ready but no UI triggers
- `NPCData.js`: 6 NPCs with appearance data, no dialogue

**Impact**: Users can't access 60% of built features.

#### 2. Visual Priority Over Gameplay
**Problem**: Heavy focus on matching Messenger's visual style while neglecting the gameplay loop.

**Evidence**:
- `toon.js`: 300+ lines of perfect cel-shading
- `sky.js`: 400+ lines of beautiful sky rendering
- No mail pickup, no delivery confirmation, no quest UI

**Impact**: Beautiful demo, not a playable game.

#### 3. Disconnected System Architecture
**Problem**: Systems built in isolation without integration points.

**Evidence**:
- Store has `startDialogue()` but nothing calls it
- Store has `deliverMail()` but no trigger to invoke it
- NPCs exist but pressing E does nothing meaningful

**Impact**: Features exist but aren't accessible.

#### 4. Missing User Feedback Layer
**Problem**: No HUD, notifications are transient, player has no visibility into game state.

**Evidence**:
- No coin display, no mail count, no quest tracker
- `showNotification()` exists but UI to show it doesn't
- No interaction prompts when near NPCs

**Impact**: Players don't know what they can do or have done.

---

## Improvement Roadmap (To 60%+ Completion)

### Phase 1: Core UI System (Priority: CRITICAL)
Create the foundational UI layer that connects all existing systems.

**Files to Create/Modify**:
```
src/
├── ui/
│   ├── UIManager.js          # Central UI controller
│   ├── HUD.js                # Coins, mail, minimap
│   ├── InteractionPrompt.js  # "Press E to talk"
│   ├── NotificationToast.js  # Reward/status popups
│   └── styles.css            # UI styling
```

**Implementation**:
1. Create HTML overlay for UI elements
2. Subscribe to gameStore for reactive updates
3. Show interaction prompts when `nearbyNPC` changes
4. Display coins/mail count from `inventory`

### Phase 2: Dialogue System (Priority: HIGH)
Enable NPC conversations with mail/quest triggers.

**Files to Create/Modify**:
```
src/
├── systems/
│   └── DialogueManager.js    # Dialogue tree handler
├── data/
│   └── dialogues.json        # NPC dialogue trees
```

**Implementation**:
1. Create dialogue data structure with nodes/choices
2. Hook E key to start dialogue with `nearbyNPC`
3. Render dialogue box UI with speaker name/portrait
4. Process dialogue choices → trigger quests/mail

### Phase 3: Mail Delivery Gameplay (Priority: HIGH)
Complete the core gameplay loop.

**Flow**:
```
Mailbox → Pickup → Carry to NPC → Deliver → Reward
```

**Implementation**:
1. Add mailboxes to planet (spawn points for mail)
2. E near mailbox → `addMail()` to inventory
3. E near matching NPC → `deliverMail()` trigger
4. Show success animation + coin reward

### Phase 4: Character Customization UI (Priority: MEDIUM)
Expose existing customization data to players.

**Files to Create**:
```
src/
├── ui/
│   └── CustomizationScreen.js  # Character creator
```

**Implementation**:
1. Show during `gameState === 'customization'`
2. Color pickers for hair, skin, clothes
3. Style selectors with preview
4. Apply to player mesh via `setPlayerAppearance()`

### Phase 5: Quest Integration (Priority: MEDIUM)
Connect existing quest data to gameplay.

**Implementation**:
1. NPCs offer quests via dialogue system
2. Quest log UI shows active quests
3. Objective tracking (talk to X, deliver to Y)
4. Quest completion → rewards

---

## Technology Stack

- **3D Engine**: Three.js r170 (WebGL)
- **Physics/Collision**: three-mesh-bvh (BVH-based collision detection)
- **Animation**: GSAP 3.12
- **Build Tool**: Vite 6
- **State Management**: Zustand 5.0 (vanilla store)
- **Multiplayer**: Socket.io (planned)

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run deploy   # Deploy to GitHub Pages
```

## Architecture

```
src/
├── main.js              # App entry, loading screen
├── World.js             # Scene orchestrator (lighting, rendering)
├── Player.js            # Character controller (spherical movement)
├── Camera.js            # Third-person camera (frame-rate independent)
├── InputManager.js      # Keyboard/touch input events
├── audio/
│   └── AudioManager.js  # Sound effects and music (disabled)
├── constants/
│   └── colors.js        # Complete color palette (messenger.abeto.co match)
├── data/
│   ├── dialogues.js     # NPC dialogue trees (6 NPCs)
│   └── quests.js        # Quest definitions (8 quests)
├── effects/
│   ├── PostProcessing.js    # Bloom, SSAO, vignette
│   └── particles/
│       ├── Emitters.js      # Firefly, leaf, bird emitters
│       └── ParticleManager.js
├── entities/
│   ├── NPC.js           # NPC character with procedural mesh
│   ├── NPCData.js       # 6 NPC configurations
│   ├── NPCManager.js    # NPC spawning/patrol/look-at
│   ├── Mailbox.js       # 3D mailbox entity with cel-shading
│   └── MailboxManager.js # Mailbox spawning (6 mailboxes)
├── environment/
│   ├── TinyPlanet.js    # Spherical gravity + coordinate system
│   ├── Planet.js        # Buildings, props, zones
│   └── Street.js        # Legacy flat mode (deprecated)
├── optimization/
│   └── LODManager.js    # Level of detail (framework)
├── shaders/
│   ├── toon.js          # 4-band cel-shading + outlines
│   └── sky.js           # Gradient sky, clouds, sun/moon
├── stores/
│   └── gameStore.js     # Complete Zustand state (500+ lines)
├── systems/
│   ├── DialogueManager.js  # Dialogue tree handler + actions
│   ├── QuestManager.js     # Quest logic + progress tracking
│   ├── InventoryManager.js # Inventory management
│   └── MailSystem.js       # Mail logic
├── utils/
│   ├── ModelLoader.js      # GLB/GLTF loading with caching
│   └── ToonModelHelper.js  # Apply toon shading to loaded models
└── ui/
    ├── UIManager.js        # Central UI controller
    ├── HUD.js              # Coins, mail, quest indicator
    ├── DialogueBox.js      # Typewriter dialogue with choices
    ├── InteractionPrompt.js # "Press E to talk/collect"
    ├── NotificationToast.js # Toast notifications
    ├── QuestLog.js         # Full quest log UI
    ├── QuestTracker.js     # Mini HUD quest tracker
    └── styles.css          # Complete UI styling
```

## Visual Style (Messenger-quality) - ACHIEVED

- **Cel-shading**: 4-band discrete transitions (hard edges, NOT smooth)
- **Shadow color**: `#5A6B7A` (blue-gray, NEVER black)
- **Outlines**: 2px inverted hull, color `#1A1A2E`
- **Rim lighting**: White `#FFFFFF`, intensity 0.5 (characters), 0.25 (environment)
- **Sky**: `#5BBFBA` (turquoise day) → `#1B2838` (deep blue night)
- **UI**: Dark `#1A1A2E`, accent `#FFD54F` (yellow)

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Shift | Run |
| E | Interact (NPCs, Mailboxes) |
| N | Toggle day/night |
| Q | Toggle quest log |
| C | Character customization |
| M | Mute/unmute audio |
| 1-4 | Select dialogue choices |
| ESC | Close dialogue/quest log |

## Key Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Tiny Planet | DONE | Full spherical movement |
| Character Visuals | DONE | Procedural mesh + GLB model support |
| Cel-Shading | DONE | 4-band + outlines |
| Day/Night | DONE | 1.5s smooth transition |
| Camera | DONE | Frame-rate independent, smooth |
| NPCs | DONE | Patrol + look-at + dialogue |
| Mail Delivery | DONE | Collect → Deliver → Reward + SFX |
| Dialogue System | DONE | Typewriter effect, choices, actions |
| Quest System | DONE | 12 quests, quest log, tracker |
| UI/HUD | DONE | Coins, mail, prompts, toasts |
| Customization | DONE | Color pickers for hair/skin/clothes |
| Audio | DONE | Procedural SFX, ambient music, footsteps |
| Touch Controls | DONE | Virtual joystick + action buttons |
| Test Suite | DONE | 75 tests (Vitest) |
| Multiplayer | NOT STARTED | Planned for v1.0 |

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Initial Load | < 6 MB | ~3 MB (no assets) |
| Frame Rate (Desktop) | 60 FPS | 60 FPS |
| Frame Rate (Mobile) | 30 FPS | 30 FPS (low preset) |
| Load Time (4G) | < 5 seconds | ~2 seconds |

## Quality Presets

| Preset | Shadow Map | Pixel Ratio | Bloom | SSAO |
|--------|------------|-------------|-------|------|
| Low | 512px | 1.0 | Off | Off |
| Medium | 1024px | 1.5 | On | Off |
| High | 2048px | 2.0 | On | On |

## Development Guidelines

### Code Style
- ES6 modules with clear exports
- Class-based controllers (Player, Camera, NPC)
- Factory functions for materials (`createToonMaterial`)
- Event-driven input system
- Zustand for centralized state

### Important Patterns
```javascript
// State updates
useGameStore.getState().addMail(mailItem);

// Event handling
inputManager.on('interact', () => { ... });

// Material creation
const mat = createToonMaterial({ color: 0xff0000 });
```

### Testing Approach
1. `npm run dev` → Visual inspection
2. Browser DevTools → Performance tab
3. Mobile emulation → Touch controls
4. Network throttling → Load times

## 3D Model Support

The game supports loading external GLB models with automatic toon shader application.

### Directory Structure
```
assets/models/
├── characters/
│   ├── player.glb      # Player character (auto-loaded)
│   └── npc-*.glb       # NPC models
├── buildings/
│   └── *.glb           # Building models
└── props/
    └── *.glb           # Props (streetlights, trees, etc.)
```

### Model Loading Pattern
```javascript
import { loadModelWithFallback } from './utils/ModelLoader.js';
import { applyCharacterToonShading } from './utils/ToonModelHelper.js';

// Load with fallback to procedural geometry
const { model, isLoaded } = await loadModelWithFallback(
  'characters/player.glb',
  () => createProceduralMesh(),
  { clone: true }
);

// Apply toon shading if loaded
if (isLoaded) {
  applyCharacterToonShading(model, appearance, lightDirection);
}
```

### Creating Models with Blender MCP
See `docs/BLENDER_MCP_SETUP.md` for AI-assisted 3D modeling setup.

## Reference

- **Live Reference**: https://messenger.abeto.co/
- **Screenshots**: `.playwright-mcp/messenger-*.png`
- **Plan**: `.ralph/prompt.md`

---

## Quick Start for Contributors

1. **Clone & Install**
   ```bash
   git clone https://github.com/rohithIlluri/rohithilluri.github.io.git
   cd rohithilluri.github.io
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

4. **Test Controls**
   - WASD to move, Shift to run
   - E to interact with NPCs and mailboxes
   - Q to open quest log
   - N to toggle day/night
   - Walk near NPCs to trigger dialogue prompts

## Known Issues

1. **Multiplayer** - Not started (planned for v1.0)
2. **Audio loading** - Uses procedural generation; no asset files yet
3. **Quest NPC ID mismatch** - Legacy quests.json references NPCs (npc_postmaster, etc.) that don't exist in NPCData.js; new quests use correct IDs
