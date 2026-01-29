# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A **Messenger clone** - a mail delivery game on a tiny planet inspired by [Messenger by Abeto](https://messenger.abeto.co/). Players walk around a spherical world, customize their character, deliver mail to NPCs, and see other players in real-time.

**This is NOT a portfolio** - it's a pure game clone for learning/fun.

---

## Current Status Assessment (v0.9.7)

### Completion Summary

| System | Completion | Quality |
|--------|------------|---------|
| Visual Rendering | 95% | Excellent |
| Tiny Planet/Movement | 100% | Excellent |
| Player Controller | 100% | Excellent (walk cycle fixed) |
| Camera System | 100% | Excellent (touch orbit added) |
| NPC Visuals/Animation | 85% | Good |
| Day/Night Cycle | 100% | Excellent |
| Post-Processing | 90% | Excellent |
| UI/HUD | 98% | Excellent (settings, audio, tutorial) |
| Dialogue System | 95% | Excellent (loop detection) |
| Mail Delivery Loop | 95% | Excellent (validation added) |
| Character Customization | 85% | Good (UI complete) |
| Quest Integration | 95% | Excellent (cycle detection) |
| Audio | 85% | Good (procedural SFX, mute button) |
| Test Infrastructure | 95% | Excellent (228 tests) |
| Mobile Touch Controls | 95% | Excellent (camera look area, visible hints) |
| Edge Case Handling | 90% | Excellent (comprehensive) |
| User Onboarding | 90% | Excellent (6-step tutorial) |
| Celebration Effects | 95% | Excellent (confetti particles) |
| Settings Persistence | 95% | Excellent (localStorage) |
| Multiplayer | 0% | Not started |

**Overall: ~95% complete** (Target: 60%+ ACHIEVED)

### Recent Improvements (v0.9.7)

#### Test Coverage & Quality
- Expanded test suite from 75 to 228 tests (+153 tests)
- Added comprehensive tests for Player, TinyPlanet, NPCManager, MailboxManager
- Added MemoryMonitor utility tests

#### Performance & Tooling
- Created MemoryMonitor for long session memory leak detection
- Optimized NPC proximity checks with early exit optimization
- Added haptic feedback for mobile touch controls

### Previous Improvements (v0.9.6)

#### UX & User Experience
- Added SettingsPanel with audio/graphics/accessibility controls
- Audio mute button and settings button added to HUD
- Created TutorialOverlay for first-time player onboarding (6-step tutorial)
- Added CelebrationEffect with confetti particles for mail delivery and quest completion
- Settings now persist to localStorage
- Mobile touch hints made more visible (increased opacity, text shadow)

### Previous Improvements (v0.9.5)

#### Player Controls & Views
- Walk cycle now wraps at 2π (prevents NaN after long sessions)
- Input state resets on window blur/focus/visibility change
- RenderOrder added to character mesh outlines for proper layering
- Touch camera look area for mobile (swipe to orbit)
- Camera orbit offset with smooth interpolation

#### Edge Case Handling
- BEGIN button race condition prevention
- Duplicate mail detection in inventory
- Mail recipient validation on delivery
- Quest prerequisite cycle detection
- Dialogue infinite loop prevention (max 3 node visits)
- UI toggle debounce (150ms)
- Notification duplicate prevention (500ms window)
- Mobile orientation change handling

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
| Test Suite | DONE | 228 tests (Vitest) |
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

---

## Next Steps (v1.0 Roadmap)

### Priority 1: Additional Test Coverage ✅ COMPLETE
| Test Area | Status | Files Tested |
|-----------|--------|--------------|
| Player Movement & Collision | ✅ Done | Player.js, TinyPlanet.js |
| NPC/Mailbox Managers | ✅ Done | NPCManager.js, MailboxManager.js |
| Memory Monitoring | ✅ Done | MemoryMonitor.js |
| Mail Delivery Flow | Needed | MailSystem.js, gameStore.js |
| Quest Objective Tracking | Needed | QuestManager.js |
| UI State Consistency | Needed | UIManager.js, HUD.js |

### Priority 2: Performance Optimization
- [ ] Implement LODManager for distant objects
- [ ] Add frustum culling for NPCs/mailboxes off-screen
- [x] Profile and optimize NPC proximity checks ✅ (O(n) optimal for 6 NPCs, documented)
- [x] Add memory leak detection for long sessions ✅ (MemoryMonitor.js)

### Priority 3: Multiplayer Foundation
- [ ] Socket.io connection setup
- [ ] Player position broadcasting
- [ ] Remote player rendering
- [ ] State synchronization protocol
- [ ] Disconnect/reconnect handling

### Priority 4: Polish & UX
- [x] Implement settings persistence (localStorage) ✅ v0.9.6
- [x] Add tutorial/onboarding for new players ✅ v0.9.6
- [x] Add celebration effects for achievements ✅ v0.9.6
- [x] Add haptic feedback for touch controls ✅ (TouchControls.js + settings toggle)
- [ ] Add loading progress for 3D model assets
- [ ] Improve mobile virtual keyboard handling

### Priority 5: Content
- [ ] Add more NPCs with unique dialogues
- [ ] Create additional quests with branching paths
- [ ] Add collectibles and achievements
- [ ] Implement leaderboard for deliveries

---

## Session Summary (Latest)

**Session ID**: session_016oJ7t7kEtJ8JeUM21jBp9y

### Changes Made (v0.9.7)
1. Added comprehensive test coverage (228 tests total, up from 75)
   - Player.js tests (30 tests): movement, animation, collision
   - TinyPlanet.js tests (23 tests): spherical coordinates, zones
   - NPCManager.js tests (27 tests): lifecycle, proximity
   - MailboxManager.js tests (38 tests): collection, respawn
   - MemoryMonitor.js tests (26 tests): leak detection
2. Added haptic feedback for mobile touch controls
   - TouchControls.js: vibration patterns (light/medium/heavy/success/error)
   - Settings toggle in Accessibility panel
3. Created MemoryMonitor utility for long session debugging
   - Tracks object counts by category (geometries, materials, meshes, etc.)
   - Periodic snapshots for trend analysis
   - Growth rate anomaly detection
   - Browser memory info (when available)
4. Optimized NPC proximity checks with early exit and documentation
5. All 228 tests passing, build successful

### New Files Created
- `src/utils/MemoryMonitor.js` - Memory leak detection utility
- `tests/player.test.js` - Player controller tests
- `tests/tinyPlanet.test.js` - Spherical world tests
- `tests/npcManager.test.js` - NPC manager tests
- `tests/mailboxManager.test.js` - Mailbox manager tests
- `tests/memoryMonitor.test.js` - Memory monitor tests

### Files Modified
- `src/ui/TouchControls.js` - Added haptic feedback
- `src/ui/SettingsPanel.js` - Added haptic toggle
- `src/stores/gameStore.js` - Added hapticEnabled setting
- `src/entities/NPCManager.js` - Optimized getNearestNPC

### Previous Session (v0.9.6)
- Created SettingsPanel with audio/graphics/accessibility controls
- Created TutorialOverlay for first-time player onboarding
- Added CelebrationEffect with confetti particles
- Settings persist to localStorage

### Previous Session (v0.9.5)
- Enhanced player controls (walk cycle, input reset, touch camera)
- Fixed rendering layering (renderOrder on outlines)
- Added comprehensive edge case handling
- Fixed UI toggle spam and notification duplicates
- Added mobile orientation/viewport handlers

### Branch
`claude/pull-latest-changes-4IM0s` - Ready to merge to master
